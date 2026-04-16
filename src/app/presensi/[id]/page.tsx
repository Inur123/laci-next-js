import { getPresensiDetail } from "@/app/actions/presensi-actions";
import { AttendanceForm } from "@/components/features/presensi/attendance-form";
import { PresensiStatusBadge } from "@/components/features/presensi/presensi-status-badge";
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
      {/* ── Main Column Wrapper ── */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        {/* ── Top green header (Sesuai lebar kolom) ── */}
        <div className="bg-green-600 text-white px-6 pt-6 pb-5">
          {/* Brand bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-10 h-10 shrink-0 bg-white rounded-full p-0.5 shadow-sm">
              <Image
                src="/images/logo-laci.webp"
                alt="Laci Digital"
                fill
                sizes="40px"
                className="object-contain rounded-full"
                priority
              />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Laci Digital</p>
              <p className="text-green-200 text-[10px] mt-0.5 leading-none">
                PC IPNU IPPNU Kab. Magetan
              </p>
            </div>
            <div className="ml-auto">
              <PresensiStatusBadge
                presensiId={data.id}
                initialPresensi={data}
              />
            </div>
          </div>

          {/* Event info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-black leading-tight tracking-tight">
              {capitalizeName(data.namaKegiatan)}
            </h1>
            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
              <div>
                <p className="text-green-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Penyelenggara
                </p>
                <p className="text-white font-bold text-xs leading-tight">
                  {capitalizeName(data.penyelenggara)}
                </p>
              </div>
              <div>
                <p className="text-green-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Tempat
                </p>
                <p className="text-white font-bold text-xs leading-tight">
                  {capitalizeName(data.tempat)}
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-white/90 text-[11px] font-bold">
                <span>{tanggalFormatted}</span>
                <span className="opacity-40">•</span>
                <span>
                  {data.jamMulai} – {data.jamSelesai} WIB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form area (Padding disamakan agar sejajar lurus) ── */}
        <div className="px-6 py-6 bg-white">
          <AttendanceForm presensi={{ ...data, statusOpen: isOpen }} />
        </div>
      </div>
    </div>
  );
}
