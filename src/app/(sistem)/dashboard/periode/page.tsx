import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PeriodeList } from "@/components/features/periode/periode-list";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Periode | Laci Digital",
};

export default async function PeriodePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const periods = await prisma.periode.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const userRole = session?.user?.role;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <CalendarDays size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Daftar Periode</h2>
            <p className="text-sm text-muted-foreground">
              Kelola masa bakti dan periode kepengurusan Anda.
            </p>
          </div>
        </div>
        <Button
          asChild
          className={`w-full sm:w-auto text-white shadow-md hover:shadow-xl transition-all duration-200 ${
            userRole === "SEKRETARIS_CABANG"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          <Link href="/dashboard/periode/add">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Periode
          </Link>
        </Button>
      </div>

      <PeriodeList periods={periods} />
    </div>
  );
}
