import { getPresensiDetail } from "@/app/actions/presensi-actions";
import { PresensiForm } from "@/components/features/presensi/presensi-form";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Edit Presensi",
};

export default async function EditPresensiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([
    getPresensiDetail(id),
    auth()
  ]);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/presensi">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>

        <div>
          <h2 className="text-xl font-semibold">Edit Presensi</h2>
          <p className="text-sm text-muted-foreground">
            Edit data kegiatan presensi{" "}
            <span className="font-semibold text-slate-700">
              {data.namaKegiatan}
            </span>
          </p>
        </div>
      </div>

      <PresensiForm 
        presensi={data} 
        userRole={session?.user?.role ?? "SEKRETARIS_PAC"} 
      />
    </div>
  );
}
