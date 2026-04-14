"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EmailType, EmailStatus } from "@prisma/client";

// ============================================
// HELPERS
// ============================================

async function requireSekretarisCabang() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "SEKRETARIS_CABANG")
    throw new Error("Forbidden: Hanya Sekretaris Cabang");
  return session;
}

// ============================================
// STATISTICS
// ============================================

export async function getEmailStats() {
  await requireSekretarisCabang();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalAll, totalToday, totalSent, totalFailed, byType] =
    await Promise.all([
      prisma.logEmail.count(),
      prisma.logEmail.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      prisma.logEmail.count({
        where: { status: "SENT" },
      }),
      prisma.logEmail.count({
        where: { status: "FAILED" },
      }),
      prisma.logEmail.groupBy({
        by: ["type"],
        _count: { type: true },
      }),
    ]);

  const typeStats = byType.reduce(
    (
      acc: Record<string, number>,
      item: { type: string; _count: { type: number } },
    ) => {
      acc[item.type] = item._count.type;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalAll,
    totalToday,
    totalSent,
    totalFailed,
    byType: typeStats,
  };
}

// ============================================
// LIST EMAILS (with pagination & filters)
// ============================================

export interface EmailLogFilters {
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getEmailLogs(
  filters: EmailLogFilters = {},
  page: number = 1,
  perPage: number = 20,
) {
  await requireSekretarisCabang();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { to: { contains: filters.search, mode: "insensitive" } },
      { subject: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [data, total] = await Promise.all([
    prisma.logEmail.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.logEmail.count({ where }),
  ]);

  // Get unique emails from data to check their verification status
  const emails = Array.from(new Set(data.map((log) => log.to)));
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true, emailVerified: true },
  });

  const verificationMap = users.reduce(
    (acc, user) => {
      acc[user.email] = !!user.emailVerified;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return {
    data: data.map(
      (log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
        updatedAt: log.updatedAt.toISOString(),
        isVerified: verificationMap[log.to] || false,
      }),
    ),
    total,
    totalPages: Math.ceil(total / perPage),
    currentPage: page,
  };
}

// ============================================
// RETRY FAILED EMAIL
// ============================================

export async function retryEmail(logId: string) {
  await requireSekretarisCabang();

  const log = await prisma.logEmail.findUnique({
    where: { id: logId },
  });

  if (!log) return { success: false, error: "Log tidak ditemukan" };
  if (log.status === "SENT")
    return { success: false, error: "Email sudah terkirim" };

  // Import sendEmail dynamically to avoid circular dependency issues
  const { sendEmail } = await import("@/lib/email");

  // We need to rebuild the email content based on the type
  try {
    // Update status to PENDING and increment retry count
    await prisma.logEmail.update({
      where: { id: logId },
      data: {
        status: "PENDING",
        retryCount: { increment: 1 },
        errorMessage: null,
      },
    });

    // Rebuild and send email in background
    rebuildAndSendEmail(log).then(async (result) => {
      // Update original log based on result manually when it finishes
      try {
        await prisma.logEmail.update({
          where: { id: logId },
          data: {
            status: result.success ? "SENT" : "FAILED",
            errorMessage: result.error || null,
          },
        });
      } catch (updateErr) {
        console.error("[RETRY-BG] Failed to update original log:", updateErr);
      }
    }).catch((err) => {
      console.error("[RETRY-BG] Critical error in background retry:", err);
    });

    return { success: true, message: "Proses pengiriman ulang dimulai" };
  } catch (error) {
    await prisma.logEmail.update({
      where: { id: logId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Retry failed",
      },
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Retry failed",
    };
  }
}

/**
 * Rebuild and resend email based on logged type
 * Does NOT use emailType param to avoid creating duplicate log
 */
async function rebuildAndSendEmail(log: {
  to: string;
  subject: string;
  type: EmailType;
  metadata: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const { sendEmail } = await import("@/lib/email");
  const metadata = log.metadata ? JSON.parse(log.metadata) : {};

  switch (log.type) {
    case "VERIFICATION": {
      // For verification, we need to generate a new OTP
      const { verificationEmailTemplate, verificationEmailText } =
        await import("@/lib/email-templates/verification");
      const { generateVerificationToken } = await import("@/lib/email");

      const newOtp = generateVerificationToken();
      const name = log.to.split("@")[0]; // fallback name

      const html = verificationEmailTemplate({ name, otp: newOtp });
      const text = verificationEmailText({ name, otp: newOtp });

      return sendEmail({
        to: log.to,
        subject: log.subject,
        html,
        text,
        // No emailType to avoid duplicate log
      });
    }

    case "VERIFIED_SUCCESS": {
      const { verifiedSuccessEmailTemplate, verifiedSuccessEmailText } =
        await import("@/lib/email-templates/verified-success");

      // Try to get user name from database
      const user = await prisma.user.findUnique({
        where: { email: log.to },
        select: { name: true },
      });
      const name = user?.name || "Rekan/Rekanita";

      const html = verifiedSuccessEmailTemplate({ name });
      const text = verifiedSuccessEmailText({ name });

      return sendEmail({
        to: log.to,
        subject: log.subject,
        html,
        text,
      });
    }

    case "PENGAJUAN_USER":
    case "PENGAJUAN_ADMIN":
    case "PENGAJUAN_STATUS": {
      // For pengajuan emails, we can't fully reconstruct the content
      // So we just resend with the original subject as a simple notification
      return sendEmail({
        to: log.to,
        subject: `[Kirim Ulang] ${log.subject}`,
        html: `<p>Email ini dikirim ulang oleh administrator. Silakan cek email sebelumnya atau hubungi Sekretaris Cabang untuk informasi lebih lanjut.</p>`,
        text: `Email ini dikirim ulang oleh administrator. Silakan cek email sebelumnya atau hubungi Sekretaris Cabang.`,
      });
    }

    default:
      return { success: false, error: "Tipe email tidak dikenali" };
  }
}

// ============================================
// RESEND VERIFICATION OTP
// ============================================

export async function resendVerificationOTP(email: string) {
  await requireSekretarisCabang();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true, emailVerified: true },
  });

  if (!user) return { success: false, error: "User tidak ditemukan" };
  if (user.emailVerified)
    return { success: false, error: "Email sudah terverifikasi" };

  const { auth } = await import("@/lib/auth");
  const { headers } = await import("next/headers");
  
  // Use Better Auth's official API to generate OTP
  // This ensures it's correctly stored in their internal tables with correct format
  try {
    const result = await (auth.api as any).sendVerificationOTP({
      headers: await headers(),
      body: {
        email,
        type: "email-verification",
      },
    });

    if (!result) {
      return { success: false, error: "Gagal membuat kode OTP dari sistem" };
    }

    // After calling generateEmailOTP, Better Auth will automatically 
    // trigger our sendVerificationOTP hook in lib/auth.ts, which will
    // send the email and log it. So we don't need to call sendVerificationEmail here.
    
    return { success: true, message: "OTP baru telah dikirim oleh sistem" };
  } catch (err) {
    console.error("[RESEND-OTP-AUTH] Failed to trigger BA OTP:", err);
    return { success: false, error: "Gagal memicu pengiriman OTP sistem" };
  }
}
