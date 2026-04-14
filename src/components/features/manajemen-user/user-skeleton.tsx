"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UserSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton (Single Row - Arsip Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-[85px] p-3 border rounded-xl bg-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>
      <div className="relative max-h-[600px] overflow-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="sticky top-0 bg-slate-50/40 z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] bg-slate-50/40 whitespace-nowrap">
                User
              </TableHead>
              <TableHead className="w-[200px] bg-slate-50/40 whitespace-nowrap">
                Email
              </TableHead>
              <TableHead className="w-[120px] bg-slate-50/40 whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="w-[80px] text-right bg-slate-50/40 whitespace-nowrap">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
        <div className="grid md:grid-cols-[280px_1fr]">
          {/* Profile Sidebar Skeleton */}
          <div className="p-8 border-r flex flex-col items-center text-center space-y-6">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32 mt-4" />
          </div>

          {/* Details Section Skeleton */}
          <div className="p-8 space-y-8">
            {/* Info Tabs Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="space-y-4 pt-6 border-t font-semibold">
              <Skeleton className="h-6 w-36" />
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="space-y-4 pt-6 border-t font-semibold">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <div className="pt-4 mt-4 border-t border-dashed">
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
