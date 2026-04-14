import { getPresensiList } from "@/app/actions/presensi-actions";
import { PresensiList } from "@/components/features/presensi/presensi-list";
import { Metadata } from "next";
import { QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Presensi Kegiatan",
};

export default async function PresensiPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <Suspense fallback={<PresensiSkeleton />}>
      <PresensiPageContent userId={session.user.id} userRole={session.user.role} />
    </Suspense>
  );
}

async function PresensiPageContent({
  userId,
  userRole,
}: {
  userId: string;
  userRole?: string;
}) {
  const [data, periodeAktif] = await Promise.all([
    getPresensiList(),
    prisma.periode.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
    }),
  ]);

  const isCabang = userRole === "SEKRETARIS_CABANG";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <QrCode size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Presensi Kegiatan</h2>
            <p className="text-sm text-muted-foreground">
              {periodeAktif
                ? `Periode: ${periodeAktif.nama}`
                : "Tidak ada periode aktif"}
            </p>
          </div>
        </div>
        {periodeAktif && (
          <Button
            asChild
            className={cn(
              "w-full sm:w-auto text-white shadow-md hover:shadow-xl transition-all duration-200",
              isCabang ? "bg-blue-600 hover:bg-blue-700" : "bg-green-700 hover:bg-green-800",
            )}
          >
            <Link href="/dashboard/presensi/add">
              <Plus className="w-4 h-4 mr-2" />
              Buat Presensi Baru
            </Link>
          </Button>
        )}
      </div>

      {!periodeAktif ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Silakan aktifkan periode terlebih dahulu untuk mengelola presensi.
          </p>
          <Button
            asChild
            className={cn(
              "mt-4 text-white shadow-md hover:shadow-xl transition-all duration-200",
              isCabang ? "bg-blue-600 hover:bg-blue-700" : "bg-green-700 hover:bg-green-800",
            )}
          >
            <Link href="/dashboard/periode">Kelola Periode</Link>
          </Button>
        </div>
      ) : (
        <PresensiList data={data} userRole={userRole ?? "SEKRETARIS_PAC"} />
      )}
    </div>
  );
}

function PresensiSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
