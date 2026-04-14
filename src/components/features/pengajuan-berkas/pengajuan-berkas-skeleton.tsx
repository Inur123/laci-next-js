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

export function PengajuanBerkasSkeleton({
  isCabang = false,
}: {
  isCabang?: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton (Single Row - Arsip Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-[3]" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-md border">
        <div className="relative max-h-[600px] overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="sticky top-0 bg-slate-50/40 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] text-center bg-slate-50/40 whitespace-nowrap">
                  No
                </TableHead>
                <TableHead className="bg-slate-50/40 whitespace-nowrap">
                  No Surat
                </TableHead>
                {isCabang && (
                  <TableHead className="bg-slate-50/40 whitespace-nowrap">
                    Pengaju
                  </TableHead>
                )}
                <TableHead className="w-[100px] bg-slate-50/40 whitespace-nowrap">
                  Penerima
                </TableHead>
                <TableHead className="w-[120px] bg-slate-50/40 whitespace-nowrap">
                  Tanggal
                </TableHead>
                <TableHead className="w-[200px] bg-slate-50/40 whitespace-nowrap">
                  Keperluan
                </TableHead>
                <TableHead className="w-[100px] bg-slate-50/40 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-[150px] text-right bg-slate-50/40 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center whitespace-nowrap">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  {isCabang && (
                    <TableCell className="whitespace-nowrap">
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export function PengajuanBerkasDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Detail Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-2xl bg-white shadow-sm overflow-hidden p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className="h-14 w-32 rounded-xl" />
            </div>

            <div className="pt-8 border-t space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl flex items-center gap-4"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Actions */}
        <div className="space-y-6">
          <div className="border rounded-2xl bg-white shadow-sm p-6 space-y-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-4 rounded-full mt-1 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-2xl bg-white shadow-sm p-6 space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
