"use server";

import prisma from "@/lib/prisma";
import { LogAction, LogModule } from "@prisma/client";
import { notifyRealtime } from "@/lib/realtime";
import { getSession } from "@/lib/auth-session";

/**
 * HIGH-PERFORMANCE NON-BLOCKING LOGGER
 * 
 * Fungsi ini didesain khusus untuk Vercel + Remote VPS agar proses utama 
 * (Login, Register, CRUD) tetap instan meskipun jarak database jauh.
 */
export async function createLog(
  action: LogAction,
  module: LogModule,
  description: string,
  entityId?: string,
) {
  // 1. Ambil session dulu (biasanya cepat karena dari cookie/cache)
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    console.warn("[Logger] Gagal catat log: User tidak terautentikasi.");
    return;
  }

  // 2. JALANKAN DI BACKGROUND (Non-blocking)
  // Kita tidak menggunakan 'await' di sini agar fungsi langsung selesai (Return Fast)
  (async () => {
    try {
      // Optimasi: Ambil periode aktif sekali jalan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          periodeAktifId: true,
          periodes: {
            where: { isActive: true },
            take: 1,
            select: { id: true },
          },
        },
      });

      const periodeId = user?.periodeAktifId || user?.periodes[0]?.id;
      if (!periodeId) return;

      // Catat log ke database
      await prisma.logActivity.create({
        data: {
          userId,
          periodeId,
          action,
          module,
          description,
          entityId,
        },
      });

      // Notifikasi realtime (Fire and forget)
      notifyRealtime({ type: "log", action, module, description }).catch(() => {});
    } catch (err) {
      console.error("[Logger] Background logging failed:", err);
    }
  })(); 

  // Fungsi akan langsung selesai di sini, tanpa menunggu proses di atas beres.
  return;
}

/**
 * MANUAL NON-BLOCKING LOGGER
 */
export async function createLogManual(
  userId: string,
  action: LogAction,
  module: LogModule,
  description: string,
  entityId?: string,
) {
  // Jalankan langsung di background
  (async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          periodeAktifId: true,
          periodes: {
            where: { isActive: true },
            take: 1,
            select: { id: true },
          },
        },
      });

      const periodeId = user?.periodeAktifId || user?.periodes[0]?.id;
      if (!periodeId) return;

      // De-duplikasi AUTH (agar tidak banjir log saat login)
      if (module === "AUTH") {
        const existing = await prisma.logActivity.findFirst({
          where: {
            userId,
            module: "AUTH",
            action,
            createdAt: { gte: new Date(Date.now() - 3000) },
          },
          select: { id: true },
        });
        if (existing) return;
      }

      await prisma.logActivity.create({
        data: {
          userId,
          periodeId,
          action,
          module,
          description,
          entityId,
        },
      });

      notifyRealtime({ type: "log", action, module, description }).catch(() => {});
    } catch (err) {
      console.error("[Logger Manual] Background logging failed:", err);
    }
  })();

  return;
}

/**
 * BATCH LOGGER (Juga Non-blocking)
 */
export async function createBatchLogs(
  logs: Array<{
    action: LogAction;
    module: LogModule;
    description: string;
    entityId?: string;
  }>,
) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId || logs.length === 0) return;

  (async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          periodeAktifId: true,
          periodes: { where: { isActive: true }, take: 1, select: { id: true } },
        },
      });

      const periodeId = user?.periodeAktifId || user?.periodes[0]?.id;
      if (!periodeId) return;

      await prisma.logActivity.createMany({
        data: logs.map((log) => ({
          userId,
          periodeId,
          action: log.action,
          module: log.module,
          description: log.description,
          entityId: log.entityId,
        })),
      });

      notifyRealtime({ type: "log", module: logs[0]?.module }).catch(() => {});
    } catch (err) {
      console.error("[Batch Logger] Background logging failed:", err);
    }
  })();

  return;
}
