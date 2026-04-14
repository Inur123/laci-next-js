import { getPresensiDetail } from "@/app/actions/presensi-actions";
import { AttendanceForm } from "@/components/features/presensi/attendance-form";
import { PresensiStatusBadge } from "@/components/features/presensi/presensi-status-badge";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Image from "next/image";

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

  // Paksa pakai timezone Asia/Jakarta agar di Vercel tidak mundur 1 hari
  const tanggalFormatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: "Asia/Jakarta",
  }).format(new Date(data.tanggal));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top green header ── */}
      <div className="bg-green-600 text-white">
        {/* Brand bar */}
        <div className="max-w-lg mx-auto px-4 pt-6 pb-4 flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0 bg-white rounded-full p-0.5 shadow">
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
            <p className="text-green-200 text-xs">PC IPNU IPPNU Kab. Magetan</p>
          </div>
          {/* Status badge – realtime */}
          <div className="ml-auto">
            <PresensiStatusBadge
              presensiId={data.id}
              initialPresensi={data}
            />
          </div>
        </div>

        {/* Event info */}
        <div className="max-w-lg mx-auto px-4 pb-6">
          <h1 className="text-xl font-bold leading-snug mb-3">
            {capitalizeName(data.namaKegiatan)}
          </h1>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-green-300 text-xs font-medium mb-0.5">
                Penyelenggara
              </p>
              <p className="text-white font-medium text-sm leading-snug">
                {capitalizeName(data.penyelenggara)}
              </p>
            </div>
            <div>
              <p className="text-green-300 text-xs font-medium mb-0.5">
                Tempat
              </p>
              <p className="text-white font-medium text-sm leading-snug">
                {capitalizeName(data.tempat)}
              </p>
            </div>
            <div>
              <p className="text-green-300 text-xs font-medium mb-0.5">
                Tanggal
              </p>
              <p className="text-white font-medium text-sm">
                {tanggalFormatted}
              </p>
            </div>
            <div>
              <p className="text-green-300 text-xs font-medium mb-0.5">Waktu</p>
              <p className="text-white font-medium text-sm">
                {data.jamMulai} – {data.jamSelesai} WIB
              </p>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 40"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-10">
          <AttendanceForm presensi={data} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-4 px-4 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} PC IPNU IPPNU Kabupaten Magetan ·{" "}
          <span className="text-green-600 font-medium">Laci Digital</span>
        </p>
      </div>
    </div>
  );
}
