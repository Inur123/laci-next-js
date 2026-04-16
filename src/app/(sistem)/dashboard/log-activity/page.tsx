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
import { Suspense } from "react";
import { LogActivitySkeleton } from "@/components/features/log-activity/log-activity-skeleton";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LogActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <Suspense fallback={<LogActivitySkeleton userRole={role} />}>
      <LogActivityPageContent 
        userId={session.user.id} 
        role={role} 
        searchParams={searchParams}
      />
    </Suspense>
  );
}

async function LogActivityPageContent({
  userId,
  role,
  searchParams,
}: {
  userId: string;
  role: string;
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filteredUserId = (params.userId as string) || "ALL";

  // Check active period
  const periodeAktif = await prisma.periode.findFirst({
    where: {
      userId: userId,
      isActive: true,
    },
  });

  const isCabang = role === "SEKRETARIS_CABANG";

  if (!periodeAktif) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Belum Ada Periode Aktif</h3>
        <p className="text-slate-500 mt-2 mb-6 max-w-md">
          Anda belum memiliki periode kepengurusan yang aktif. Silakan pilih atau buat periode aktif terlebih dahulu di menu Periode.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
          <Link href="/dashboard/settings/periods">
            Ke Menu Periode
          </Link>
        </Button>
      </div>
    );
  }

  // Pre-fetch initial data
  const [personalLogs, globalLogs, personalStats, globalStats, monitoringData] =
    await Promise.all([
      periodeAktif
        ? getPersonalLogs({}, 1, 20)
        : Promise.resolve({ data: [], total: 0, totalPages: 0 }),
      isCabang
        ? getGlobalLogs({ userId: filteredUserId }, 1, 20)
        : Promise.resolve({ data: [], total: 0, totalPages: 0 }),
      getLogStats(),
      isCabang ? getGlobalLogStats(filteredUserId) : Promise.resolve(null),
      isCabang ? getLogMonitoringData(filteredUserId) : Promise.resolve(null),
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
    <div className="flex flex-col gap-4 sm:gap-6">
      <LogActivityClient
        initialPersonalLogs={personalLogs}
        initialGlobalLogs={globalLogs}
        personalStats={personalStats}
        globalStats={globalStats}
        monitoringData={monitoringData}
        userRole={role}
        pacUsers={pacUsers}
      />
    </div>
  );
}
