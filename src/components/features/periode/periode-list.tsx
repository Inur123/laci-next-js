"use client";

import { Periode } from "@prisma/client";
import {
  activatePeriode,
  deletePeriode,
  getPeriodes,
} from "@/app/actions/periode-actions";
import { setViewPeriode } from "@/app/actions/view-periode-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Trash2, CheckCircle, Edit, Info, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PeriodeList({ 
  periods, 
  userRole,
  activeViewId 
}: { 
  periods: Periode[]; 
  userRole?: string;
  activeViewId?: string;
}) {
  const [data, setData] = useState<Periode[]>(periods);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewLoadingId, setViewLoadingId] = useState<string | null>(null);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setData(periods);
  }, [periods]);

  const refreshData = async () => {
    const fresh = await getPeriodes();
    setData(fresh);
  };

  async function handleActivate(id: string) {
    setLoadingId(id);
    const result = await activatePeriode(id);
    setLoadingId(null);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Periode berhasil diaktifkan!");
      refreshData();
    }
  }

  async function handleView(id: string, name: string) {
    setViewLoadingId(id);
    try {
      const result = await setViewPeriode(id);
      if (result.success) {
        toast.success(`Berhasil beralih ke periode data ${name}!`);
        // Refresh halaman agar state server di-render ulang
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal beralih periode data");
    } finally {
      setViewLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    // Don't close modal yet.
    setLoadingId(id);
    const result = await deletePeriode(id);
    setLoadingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      setConfirmDeleteId(null);
      toast.success("Periode berhasil dihapus!");
      refreshData();
    }
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        type?: string;
        model?: string;
      };
      if (!detail || detail.type !== "mutation") return;
      if (detail.model !== "Periode") return;
      if (realtimeTimerRef.current) return;
      realtimeTimerRef.current = setTimeout(() => {
        realtimeTimerRef.current = null;
        refreshData();
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

  if (data.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informasi</AlertTitle>
        <AlertDescription>Belum ada periode yang dibuat.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((periode) => (
        <div
          key={periode.id}
          className={`flex items-center justify-between p-4 border rounded-lg bg-card transition-all ${
            periode.isActive
              ? "border-primary ring-1 ring-primary/20"
              : "border-border"
          }`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{periode.nama}</span>
              {periode.isActive && (
                <Badge
                  variant="outline"
                  className="bg-emerald-100/80 text-emerald-700 border-emerald-200 hover:bg-emerald-200/80 shadow-none"
                >
                  Aktif
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-500">
              Dibuat:{" "}
              {new Date(periode.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={
                (activeViewId && activeViewId === periode.id) || (!activeViewId && periode.isActive)
                  ? "default"
                  : "outline"
              }
              className={
                (activeViewId && activeViewId === periode.id) || (!activeViewId && periode.isActive)
                  ? userRole === "SEKRETARIS_CABANG"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
              disabled={viewLoadingId === periode.id}
              onClick={() => handleView(periode.id, periode.nama)}
            >
              {viewLoadingId === periode.id ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-1" />
              )}
              {(activeViewId && activeViewId === periode.id) || (!activeViewId && periode.isActive)
                ? "Sedang Ditampilkan"
                : "Tampilkan"}
            </Button>

            {!periode.isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActivate(periode.id)}
                disabled={loadingId === periode.id}
              >
                {loadingId === periode.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                {loadingId === periode.id ? "Memproses..." : "Aktifkan"}
              </Button>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/periode/${periode.id}/edit`}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDeleteId(periode.id)}
              disabled={loadingId === periode.id || periode.isActive}
              title={
                periode.isActive
                  ? "Periode aktif tidak dapat dihapus"
                  : "Hapus periode"
              }
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Periode?"
        description="Apakah Anda yakin ingin menghapus periode ini? Tindakan ini tidak dapat dibatalkan."
        variant="destructive"
        loading={!!loadingId}
      />
    </div>
  );
}
