"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (hasToasted.current) return;

    if (searchParams?.get("logout") === "success") {
      toast.success("Berhasil keluar! Sampai jumpa lagi.");
      hasToasted.current = true;
    } else if (searchParams?.get("verified") === "true") {
      toast.success("Email berhasil diverifikasi! Menunggu aktivasi admin.");
      hasToasted.current = true;
    } else if (
      searchParams?.get("error") === "account_inactive" ||
      searchParams?.get("error") === "inactive"
    ) {
      toast.error("Akun Anda belum diaktifkan oleh Sekretaris Cabang.");
      hasToasted.current = true;
    } else if (searchParams?.get("error") === "unregistered") {
      toast.error(
        "Email Anda belum terdaftar. Silakan register terlebih dahulu.",
      );
      hasToasted.current = true;
    } else if (searchParams?.get("error") === "auth_error") {
      toast.error("Terjadi kesalahan saat autentikasi.");
      hasToasted.current = true;
    }

    if (hasToasted.current) {
      // Clean up URL without reload
      const newPath = window.location.pathname;
      window.history.replaceState(null, "", newPath);
    }
  }, [searchParams]);

  return null;
}
