"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PeriodeSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border rounded-lg bg-card"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              {i === 0 && <Skeleton className="h-5 w-16 rounded-full" />}
            </div>
            <Skeleton className="h-3 w-32" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
