import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getPersonalLogs,
  getGlobalLogs,
  getLogStats,
  getGlobalLogStats,
  getLogMonitoringData,
} from "@/app/actions/log-activity-actions";
import { LogActivityClient } from "@/components/features/log-activity/log-activity-client";
import prisma from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Riwayat Aktivitas | Laci Digital",
};

export default async function LogActivityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check active period
  const periodeAktif = await prisma.periode.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  const role = session.user.role;
  const isCabang = role === "SEKRETARIS_CABANG";

  // If NO active period AND NOT Cabang, show empty state immediately
  // Cabang can still see "Global" even without their own active period.
  if (!periodeAktif && !isCabang) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Riwayat Aktivitas</h2>
            <p className="text-sm text-muted-foreground">
              Tidak ada periode aktif
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Silakan aktifkan periode terlebih dahulu untuk melihat riwayat
            aktivitas.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/periode">Kelola Periode</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Pre-fetch initial data
  // Only fetch data if CABANG or having an active period
  const [personalLogs, globalLogs, personalStats, globalStats, monitoringData] =
    await Promise.all([
      periodeAktif
        ? getPersonalLogs({}, 1, 20)
        : Promise.resolve({ data: [], total: 0, totalPages: 0 }),
      isCabang
        ? getGlobalLogs({}, 1, 20)
        : Promise.resolve({ data: [], total: 0, totalPages: 0 }),
      getLogStats(),
      isCabang ? getGlobalLogStats() : Promise.resolve(null),
      isCabang ? getLogMonitoringData() : Promise.resolve(null),
    ]);

  // Fetch PAC users for filter (only for Cabang)
  const pacUsers = isCabang
    ? await prisma.user.findMany({
        where: {
          role: "SEKRETARIS_PAC",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return (
    <LogActivityClient
      initialPersonalLogs={personalLogs}
      initialGlobalLogs={globalLogs}
      personalStats={personalStats}
      globalStats={globalStats}
      monitoringData={monitoringData}
      userRole={role}
      pacUsers={pacUsers}
    />
  );
}
