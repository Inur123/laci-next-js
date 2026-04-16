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
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function KegiatanListSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 md:w-44" />
            <Skeleton className="h-4 w-48 md:w-72" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[90px] p-4 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-6 w-12" />
          </Card>
        ))}
      </div>

      {/* Calendar Area Skeleton */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 h-[350px]">
             {[...Array(35)].map((_, i) => (
               <Skeleton key={i} className="h-full w-full rounded-lg bg-slate-50" />
             ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-[3]" />
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border overflow-hidden">
        <div className="relative overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-slate-50/40 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] text-center bg-slate-50/40">No</TableHead>
                <TableHead className="bg-slate-50/40">Judul Kegiatan</TableHead>
                <TableHead className="w-[180px] bg-slate-50/40">Tanggal</TableHead>
                <TableHead className="w-[200px] bg-slate-50/40">Lokasi</TableHead>
                <TableHead className="w-[150px] bg-slate-50/40">Status</TableHead>
                <TableHead className="w-[100px] text-right bg-slate-50/40 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
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

export function KegiatanFormSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="p-4 border rounded-xl bg-slate-50/50 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="w-8 h-8 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-40 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Skeleton className="h-10 flex-1 md:flex-none md:w-32 rounded-md" />
            <Skeleton className="h-10 flex-1 md:flex-none md:w-40 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
