"use client";

import { useEffect } from "react";
import { setViewPeriode } from "@/app/actions/view-periode-actions";

export function CookieCleaner({ invalid }: { invalid: boolean }) {
  useEffect(() => {
    if (invalid) {
      setViewPeriode(null);
    }
  }, [invalid]);

  return null;
}
