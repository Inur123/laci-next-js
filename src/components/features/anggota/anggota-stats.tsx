"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { getAnggotaStats } from "@/app/actions/anggota-actions";
import { Users, Shield, ShieldAlert } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

type AnggotaStatsProps = {
  stats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
  } | null;
};

export function AnggotaStats({ stats: initialStats }: AnggotaStatsProps) {
  const [stats, setStats] = useState(initialStats);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        type?: string;
        model?: string;
      };
      if (!detail || detail.type !== "mutation") return;
      if (detail.model !== "Anggota") return;
      if (realtimeTimerRef.current) return;
      realtimeTimerRef.current = setTimeout(async () => {
        realtimeTimerRef.current = null;
        const fresh = await getAnggotaStats();
        if (fresh) setStats(fresh);
      }, 300);
    };
    window.addEventListener("laci-realtime", handler as EventListener);
    return () => {
      window.removeEventListener("laci-realtime", handler as EventListener);
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Total Anggota */}
      <Card className="h-[85px] flex flex-col justify-between p-3 shadow-none border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Total Anggota
          </span>
          <Users className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-slate-900 leading-none">
          <NumberTicker
            value={stats.total}
            formatter={(val) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1,
              }).format(val)
            }
          />
        </div>
      </Card>

      {/* Laki-laki */}
      <Card className="h-[85px] flex flex-col justify-between p-3 shadow-none border-emerald-100 bg-emerald-50/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">
            Laki-laki (IPNU)
          </span>
          <Shield className="h-4 w-4 text-green-600" />
        </div>
        <div className="text-xl font-bold text-green-600 leading-none">
          <NumberTicker
            value={stats.lakiLaki}
            formatter={(val) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1,
              }).format(val)
            }
          />
        </div>
      </Card>

      {/* Perempuan */}
      <Card className="h-[85px] flex flex-col justify-between p-3 shadow-none border-rose-100 bg-rose-50/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-rose-700 uppercase">
            Perempuan (IPPNU)
          </span>
          <ShieldAlert className="h-4 w-4 text-rose-500" />
        </div>
        <div className="text-xl font-bold text-rose-600 leading-none">
          <NumberTicker
            value={stats.perempuan}
            formatter={(val) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1,
              }).format(val)
            }
          />
        </div>
      </Card>
    </div>
  );
}
