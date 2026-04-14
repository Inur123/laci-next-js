"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { LogAction, LogModule, Prisma } from "@prisma/client";
import { createLog } from "@/lib/log-activity";

export type LogActivityFilters = {
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  periodeId?: string;
  userId?: string;
};

/**
 * Get personal activity logs for the current user
 */
export async function getPersonalLogs(
  filters: Omit<LogActivityFilters, "periodeId"> = {},
  page: number = 1,
  pageSize: number = 20,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { data: [], total: 0, totalPages: 0 };
    }

    const where: Prisma.LogActivityWhereInput = {
      userId: session.user.id,
    };

    // Filter by active periods by default (if no specific period filter is applied)
    // This allows showing logs from ANY active period the user has
    where.periode = {
      isActive: true,
    };

    // Apply filters
    if (filters.action && filters.action !== "ALL") {
      where.action = filters.action as LogAction;
    }

    if (filters.module && filters.module !== "ALL") {
      where.module = filters.module as LogModule;
    }

    if (filters.search) {
      where.description = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    if (filters.startDate || filters.endDate) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        createdAt.lte = endDate;
      }
      where.createdAt = createdAt;
    }

    const [logs, total] = await Promise.all([
      prisma.logActivity.findMany({
        where,
        select: {
          id: true,
          action: true,
          module: true,
          description: true,
          createdAt: true,
          entityId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          periode: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.logActivity.count({ where }),
    ]);

    return {
      data: logs,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error fetching personal logs:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

/**
 * Get activity log statistics by module for the current active period
 */
export async function getLogStats() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Get counts for each module
    const stats = await prisma.logActivity.groupBy({
      by: ["module"],
      where: {
        userId: session.user.id,
        periode: { isActive: true },
      },
      _count: {
        id: true,
      },
    });

    // Initialize all possible modules with 0
    const moduleCounts: Record<string, number> = {
      TOTAL: 0,
      ARSIP_SURAT: 0,
      ANGGOTA: 0,
      BERKAS_PIMPINAN: 0,
      BERKAS_SP: 0,
      AGENDA_KEGIATAN: 0,
      PENGAJUAN_BERKAS: 0,
      PERIODE: 0,
      USER: 0,
      AUTH: 0,
    };

    let total = 0;
    stats.forEach((item) => {
      moduleCounts[item.module] = item._count.id;
      total += item._count.id;
    });
    moduleCounts.TOTAL = total;

    return moduleCounts;
  } catch (error) {
    console.error("Error fetching log stats:", error);
    return null;
  }
}

export async function getGlobalLogStats() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SEKRETARIS_CABANG") {
      return null;
    }

    // Get counts for each module across all PAC users in active periods
    const stats = await prisma.logActivity.groupBy({
      by: ["module"],
      where: {
        periode: {
          isActive: true,
        },
      },
      _count: {
        id: true,
      },
    });

    // Initialize all possible modules with 0
    const moduleCounts: Record<string, number> = {
      TOTAL: 0,
      ARSIP_SURAT: 0,
      ANGGOTA: 0,
      BERKAS_PIMPINAN: 0,
      BERKAS_SP: 0,
      AGENDA_KEGIATAN: 0,
      PENGAJUAN_BERKAS: 0,
      PERIODE: 0,
      USER: 0,
      AUTH: 0,
    };

    let total = 0;
    stats.forEach((item) => {
      moduleCounts[item.module] = item._count.id;
      total += item._count.id;
    });
    moduleCounts.TOTAL = total;

    return moduleCounts;
  } catch (error) {
    console.error("Error fetching global log stats:", error);
    return null;
  }
}

export async function getLogMonitoringData() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SEKRETARIS_CABANG") {
      return null;
    }

    // 1. Distribution by Module
    const moduleStats = await prisma.logActivity.groupBy({
      by: ["module"],
      where: {
        periode: { isActive: true },
      },
      _count: { id: true },
    });

    const distribution = moduleStats.map((item) => ({
      name: item.module.replace("_", " "),
      value: item._count.id,
    }));

    // 2. Top Active PACs
    const userStats = await prisma.logActivity.groupBy({
      by: ["userId"],
      where: {
        periode: { isActive: true },
      },
      _count: { id: true },
    });

    const userDetails = await prisma.user.findMany({
      where: { id: { in: userStats.map((u) => u.userId) } },
      select: { id: true, name: true, image: true },
    });

    const leaderboard = userStats
      .map((stat) => {
        const user = userDetails.find((u) => u.id === stat.userId);
        return {
          id: stat.userId,
          name: user?.name || "Unknown",
          image: user?.image || null,
          count: stat._count.id,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Activity by Day (Last 7 days)
    const timeline = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        const count = await prisma.logActivity.count({
          where: {
            periode: { isActive: true },
            createdAt: { gte: start, lte: end },
          },
        });

        return {
          date: d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          count,
          rawDate: start.toISOString().split("T")[0],
        };
      }),
    );

    // Reverse to show oldest to newest
    timeline.reverse();

    return {
      distribution,
      leaderboard,
      timeline: timeline.map(({ date, count }) => ({ date, count })),
    };
  } catch (error) {
    console.error("Error fetching log monitoring data:", error);
    return null;
  }
}

export async function getGlobalLogs(
  filters: Omit<LogActivityFilters, "periodeId"> = {},
  page: number = 1,
  pageSize: number = 20,
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SEKRETARIS_CABANG") {
      return { data: [], total: 0, totalPages: 0 };
    }

    // Filter to only show activity from PAC users that are in THEIR OWN active period
    const where: Prisma.LogActivityWhereInput = {
      periode: {
        isActive: true,
      },
    };

    // Apply filters
    if (filters.action && filters.action !== "ALL") {
      where.action = filters.action as LogAction;
    }

    if (filters.module && filters.module !== "ALL") {
      where.module = filters.module as LogModule;
    }

    if (filters.search) {
      where.description = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    if (filters.startDate || filters.endDate) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        createdAt.lte = endDate;
      }
      where.createdAt = createdAt;
    }

    // Filter by userId if provided
    if (filters.userId && filters.userId !== "ALL") {
      where.userId = filters.userId;
    }

    const [logs, total] = await Promise.all([
      prisma.logActivity.findMany({
        where,
        select: {
          id: true,
          action: true,
          module: true,
          description: true,
          createdAt: true,
          entityId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          periode: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.logActivity.count({ where }),
    ]);

    return {
      data: logs,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error fetching global logs:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}
/**
 * Get a single activity log by ID
 */
export async function getLogActivityById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const log = await prisma.logActivity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        periode: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!log) return null;

    // PAC can only view their own logs
    if (
      session.user.role === "SEKRETARIS_PAC" &&
      log.userId !== session.user.id
    ) {
      return null;
    }

    return log;
  } catch (error) {
    console.error("Error fetching log detail:", error);
    return null;
  }
}

/**
 * Log Excel export activity
 */
export async function logExport(module: LogModule, fileName: string) {
  try {
    createLog(
      "EXPORT",
      module,
      `Mengeksport data ${module.replace("_", " ")} ke Excel: ${fileName}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Error logging export:", error);
    return { error: "Gagal mencatat log export" };
  }
}

/**
 * Log Excel import activity
 */
export async function logImport(
  module: LogModule,
  successCount: number,
  failedCount: number,
) {
  try {
    const detail =
      failedCount > 0
        ? `${successCount} berhasil, ${failedCount} gagal`
        : `${successCount} data berhasil diimport`;
    createLog(
      "IMPORT",
      module,
      `Import Excel ${module.replace("_", " ")}: ${detail}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Error logging import:", error);
    return { error: "Gagal mencatat log import" };
  }
}
