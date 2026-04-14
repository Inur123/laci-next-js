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

export function ArsipSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Skeleton (6 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          "border-slate-200",
          "border-emerald-100 bg-emerald-50/5",
          "border-orange-100 bg-orange-50/5",
          "border-green-100 bg-green-50/5",
          "border-green-100 bg-green-50/5",
          "border-blue-100 bg-blue-50/5",
        ].map((style, i) => (
          <div
            key={i}
            className={`h-[85px] p-3 border rounded-xl flex flex-col justify-between ${style}`}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>

      {/* Filter Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-[2]">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <div className="relative overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] bg-slate-50/40 text-center whitespace-nowrap">
                  No
                </TableHead>
                <TableHead className="w-[120px] bg-slate-50/40 whitespace-nowrap">
                  Organisasi
                </TableHead>
                <TableHead className="w-[180px] bg-slate-50/40 whitespace-nowrap">
                  No. Surat
                </TableHead>
                <TableHead className="w-[100px] bg-slate-50/40 whitespace-nowrap">
                  Jenis
                </TableHead>
                <TableHead className="w-[140px] bg-slate-50/40 whitespace-nowrap">
                  Tanggal
                </TableHead>
                <TableHead className="w-[200px] bg-slate-50/40 whitespace-nowrap">
                  Pengirim/Penerima
                </TableHead>
                <TableHead className="bg-slate-50/40 whitespace-nowrap">
                  Perihal
                </TableHead>
                <TableHead className="w-[130px] text-right bg-slate-50/40 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
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
