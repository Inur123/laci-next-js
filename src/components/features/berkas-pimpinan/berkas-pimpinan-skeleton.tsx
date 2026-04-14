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

export function BerkasPimpinanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="rounded-md border">
        <div className="relative max-h-[600px] overflow-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 bg-slate-50/40 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] text-center bg-slate-50/40 whitespace-nowrap">
                  No
                </TableHead>
                <TableHead className="bg-slate-50/40 whitespace-nowrap">
                  Nama
                </TableHead>
                <TableHead className="w-[150px] bg-slate-50/40 whitespace-nowrap">
                  Tanggal
                </TableHead>
                <TableHead className="w-[300px] bg-slate-50/40 whitespace-nowrap">
                  Catatan
                </TableHead>
                <TableHead className="w-[130px] text-right bg-slate-50/40 whitespace-nowrap">
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
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Skeleton className="h-4 w-[300px]" />
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
