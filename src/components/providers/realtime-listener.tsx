"use client";

import { useEffect } from "react";

/**
 * Komponen ini mendengarkan perubahan pada database Supabase secara real-time.
 * Jika ada perubahan (INSERT, UPDATE, DELETE), ia akan memicu router.refresh()
 * untuk memperbarui data di Server Components tanpa memuat ulang halaman.
 */
export function RealtimeListener() {
  useEffect(() => {
    const source = new EventSource("/api/realtime");
    source.onmessage = (event) => {
      try {
        const detail = JSON.parse((event as MessageEvent).data || "{}");
        window.dispatchEvent(new CustomEvent("laci-realtime", { detail }));
      } catch {}
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  return null;
}
