import { getPresensiDetail } from "@/app/actions/presensi-actions";
import { AttendanceForm } from "@/components/features/presensi/attendance-form";
import { PresensiStatusBadge } from "@/components/features/presensi/presensi-status-badge";
import { PresensiPublicContainer } from "@/components/features/presensi/presensi-public-container";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Image from "next/image";
import { isPresensiOpen } from "@/lib/presensi-utils";

const capitalizeName = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const metadata: Metadata = {
  title: "Presensi | Laci Digital",
  description:
    "Formulir presensi digital untuk kegiatan PC IPNU IPPNU Kabupaten Magetan",
};

export default async function PublicPresensiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPresensiDetail(id);

  if (!data) {
    notFound();
  }

  // Hitung status buka/tutup secara realtime
  const isOpen = isPresensiOpen(data);

  // VPS sudah di-setting timezone Asia/Jakarta, pakai date-fns langsung
  const tanggalFormatted = format(
    new Date(data.tanggal),
    "EEEE, dd MMMM yyyy",
    {
      locale: idLocale,
    },
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-0 sm:py-8 px-0 sm:px-4">
      <PresensiPublicContainer initialData={data} />
    </div>
  );
}
