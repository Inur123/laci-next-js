"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { encryptText, decryptText, generateHash } from "@/lib/encryption";
import { revalidatePath, revalidateTag } from "next/cache";

import { createLog } from "@/lib/log-activity";
import { isPresensiOpen as checkIsPresensiOpen } from "@/lib/presensi-utils";
import { format } from "date-fns";
import { notifyRealtime } from "@/lib/realtime";

/**
 * Get List of Presensi Events
 */
export async function getPresensiList() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get active period
  const activePeriode = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  const presensi = await prisma.presensi.findMany({
    where: {
      userId: session.user.id,
      periodeId: activePeriode?.id || undefined,
    },
    orderBy: {
      tanggal: "desc",
    },
    include: {
      _count: {
        select: { dataPresensi: true },
      },
    },
  });

  return presensi;
}

/**
 * Get Presensi Event Detail
 */
export async function getPresensiDetail(id: string) {
  const presensi = await prisma.presensi.findUnique({
    where: { id },
    include: {
      dataPresensi: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!presensi) return null;

  // Decrypt sensitive data for display
  const decryptedData = presensi.dataPresensi.map((item) => ({
    ...item,
    namaLengkap: decryptText(item.namaLengkap),
    email: decryptText(item.email),
    noHp: decryptText(item.noHp),
  }));

  return {
    ...presensi,
    dataPresensi: decryptedData,
  };
}

/**
 * Create New Presensi Event
 */
export async function createPresensi(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const namaKegiatan = formData.get("namaKegiatan") as string;
  const tempat = formData.get("tempat") as string;
  const penyelenggara = formData.get("penyelenggara") as string;
  const tanggal = new Date(formData.get("tanggal") as string);
  const jamMulai = formData.get("jamMulai") as string;
  const jamSelesai = formData.get("jamSelesai") as string;

  if (
    !namaKegiatan ||
    !tempat ||
    !penyelenggara ||
    !tanggal ||
    !jamMulai ||
    !jamSelesai
  ) {
    return { error: "Semua field harus diisi" };
  }

  // Get current active period for the user
  const periodeAktif = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (!periodeAktif) return { error: "Anda belum memiliki periode aktif" };

  try {
    const presensi = await prisma.presensi.create({
      data: {
        userId: session.user.id,
        periodeId: periodeAktif.id,
        namaKegiatan,
        tempat,
        penyelenggara,
        tanggal,
        jamMulai,
        jamSelesai,
      },
    });

    createLog(
      "CREATE",
      "AGENDA_KEGIATAN",
      `Membuat kegiatan presensi baru: ${namaKegiatan}`,
      presensi.id,
    );

    notifyRealtime({
      type: "log",
      module: "PRESENSI",
      action: "CREATE",
      entityId: presensi.id,
    }).catch(() => {});

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/presensi", "page");
    return { success: "Kegiatan presensi berhasil dibuat!", data: presensi };
  } catch (error) {
    console.error("Create presensi error:", error);
    return { error: "Gagal membuat kegiatan presensi" };
  }
}

/**
 * Bridge: Server Action version (must be async)
 */
export async function isPresensiOpen(presensi: any) {
  return checkIsPresensiOpen(presensi);
}

/**
 * Update Existing Presensi Event
 */
export async function updatePresensi(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const namaKegiatan = formData.get("namaKegiatan") as string;
  const tempat = formData.get("tempat") as string;
  const penyelenggara = formData.get("penyelenggara") as string;
  const tanggal = new Date(formData.get("tanggal") as string);
  const jamMulai = formData.get("jamMulai") as string;
  const jamSelesai = formData.get("jamSelesai") as string;

  if (
    !namaKegiatan ||
    !tempat ||
    !penyelenggara ||
    !tanggal ||
    !jamMulai ||
    !jamSelesai
  ) {
    return { error: "Semua field harus diisi" };
  }

  try {
    const presensi = await prisma.presensi.update({
      where: { id, userId: session.user.id },
      data: {
        namaKegiatan,
        tempat,
        penyelenggara,
        tanggal,
        jamMulai,
        jamSelesai,
      },
    });

    createLog(
      "UPDATE",
      "AGENDA_KEGIATAN",
      `Memperbarui kegiatan presensi: ${namaKegiatan}`,
      id,
    );

    notifyRealtime({
      type: "log",
      module: "PRESENSI",
      action: "UPDATE",
      entityId: id,
    }).catch(() => {});

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/presensi", "page");
    revalidatePath(`/dashboard/presensi/${id}`, "page");
    return {
      success: "Kegiatan presensi berhasil diperbarui!",
      data: presensi,
    };
  } catch (error) {
    console.error("Update presensi error:", error);
    return { error: "Gagal memperbarui kegiatan presensi" };
  }
}

import { z } from "zod";

// Schema validasi untuk keamanan data (No HP Angka Saja)
const presensiSchema = z.object({
  namaLengkap: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama terlalu panjang")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("Format email tidak valid")
    .transform((val) => val.toLowerCase().trim()),
  noHp: z
    .string()
    .transform((val) => val.replace(/\s+/g, "")) // Hapus smua spasi biar aman
    .pipe(
      z
        .string()
        .regex(/^[0-9]+$/, "Nomor HP tidak boleh ada huruf/simbol")
        .min(10, "Nomor HP minimal harus 10 digit")
        .max(15, "Nomor HP maksimal 15 digit"),
    ),
  organisasi: z.string().min(1, "Organisasi wajib diisi"),
  tingkat: z.string().nullable().optional(),
  jabatan: z.string().nullable().optional(),
  instansi: z.string().nullable().optional(),
});

/**
 * Submit Attendance Data (Public - SECURED VALIDATION)
 */
export async function submitPresensiData(
  presensiId: string,
  formData: FormData,
) {
  // Validasi Masukan (Nama, Email, No HP Angka Saja)
  const validation = presensiSchema.safeParse({
    namaLengkap: formData.get("namaLengkap"),
    email: formData.get("email"),
    noHp: formData.get("noHp"),
    organisasi: formData.get("organisasi"),
    tingkat: formData.get("tingkat"),
    jabatan: formData.get("jabatan"),
    instansi: formData.get("instansi"),
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Input tidak valid",
    };
  }

  const { namaLengkap, email, noHp, organisasi, tingkat, jabatan, instansi } =
    validation.data;

  // Check if session is currently active
  const presensi = await prisma.presensi.findUnique({
    where: { id: presensiId },
  });

  if (!presensi) {
    return { error: "Sesi presensi tidak ditemukan" };
  }
  // New Logic: Check status & time (local utility)
  if (!checkIsPresensiOpen(presensi)) {
    return { error: "Presensi sudah ditutup" };
  }

  // ... (jam check logic)

  try {
    const newRecord = await prisma.presensiData.create({
      data: {
        presensiId,
        namaLengkap: encryptText(namaLengkap),
        email: encryptText(email.toLowerCase()),
        noHp: encryptText(noHp),
        emailHash: generateHash(email),
        noHpHash: generateHash(noHp),
        organisasi,
        tingkat: tingkat || null,
        jabatan: jabatan || null,
        instansi: instansi || null,
      },
    });

    // Notifikasi Realtime untuk update List & Detail
    // Kita kirim model "PresensiData" agar Detail Page Refresh
    // Kita kirim type "log" + module "PRESENSI" agar List Page Refresh (Counter)
    notifyRealtime({
      type: "mutation",
      model: "PresensiData",
      action: "create",
      presensiId: presensiId, // Extra info untuk mempermudah filter
    }).catch(() => {});

    notifyRealtime({
      type: "log",
      module: "PRESENSI",
      action: "CREATE",
      entityId: presensiId, // Mengacu ke ID Presensi (Event), bukan Data (Record)
    }).catch(() => {});

    return {
      success: "Berhasil melakukan presensi!",
      participantId: newRecord.id,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error:
          "Mohon maaf, email atau nomor HP ini sudah absen di kegiatan ini",
      };
    }
    console.error("Submit presensi error:", error);
    return { error: "Gagal menyimpan data presensi (Masalah Server)" };
  }
}

/**
 * Delete Presensi Event
 */
export async function deletePresensi(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const deleted = await prisma.presensi.delete({
      where: { id, userId: session.user.id },
    });

    createLog(
      "DELETE",
      "AGENDA_KEGIATAN",
      `Menghapus kegiatan presensi: ${deleted.namaKegiatan}`,
      id,
    );

    notifyRealtime({
      type: "log",
      module: "PRESENSI",
      action: "DELETE",
      entityId: id,
    }).catch(() => {});

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/presensi", "page");
    return { success: "Kegiatan presensi berhasil dihapus!" };
  } catch (error) {
    return { error: "Gagal menghapus kegiatan presensi" };
  }
}

/**
 * Update Presensi State (Automatic/Manual)
 */
export async function updatePresensiStatus(
  id: string,
  mode: "AUTO" | "MANUAL_CLOSE",
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    let data = {};
    let label = "";

    if (mode === "AUTO") {
      data = { isActive: true, isForcedOpen: false, forcedOpenAt: null };
      label = "diatur Otomatis";
    } else if (mode === "MANUAL_CLOSE") {
      data = { isActive: false, isForcedOpen: false, forcedOpenAt: null };
      label = "ditutup Manual";
    }

    const updated = await prisma.presensi.update({
      where: { id, userId: session.user.id },
      data,
    });

    createLog(
      "UPDATE",
      "AGENDA_KEGIATAN",
      `Mengubah status presensi ${label}: ${updated.namaKegiatan}`,
      id,
    );

    // Kirim notifikasi realtime agar semua tab yang membuka presensi ini ikut terupdate
    notifyRealtime({
      type: "log",
      module: "PRESENSI",
      action: "UPDATE",
      entityId: id,
    }).catch(() => {});

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/presensi", "page");
    revalidatePath(`/dashboard/presensi/${id}`, "page");

    return {
      success: `Status presensi berhasil ${label}!`,
      data: updated,
    };
  } catch (error) {
    console.error("Update presensi status error:", error);
    return { error: "Gagal mengubah status presensi" };
  }
}

/**
 * Get Specific Participant Detail
 */
export async function getParticipantDetail(id: string) {
  const data = await prisma.presensiData.findUnique({
    where: { id },
  });

  if (!data) return null;

  return {
    ...data,
    namaLengkap: decryptText(data.namaLengkap),
    email: decryptText(data.email),
    noHp: decryptText(data.noHp),
  };
}
