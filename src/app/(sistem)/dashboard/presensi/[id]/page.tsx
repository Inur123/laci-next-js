import { getPresensiDetail } from "@/app/actions/presensi-actions";
import { PresensiDetail } from "@/components/features/presensi/presensi-detail";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Detail Presensi",
};

export default async function PresensiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, session] = await Promise.all([getPresensiDetail(id), auth()]);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PresensiDetail
        presensi={data}
        userRole={session?.user?.role ?? "SEKRETARIS_PAC"}
      />
    </div>
  );
}
