import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export function LogActivitySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-80 ml-13" />
        </div>
        <div className="bg-slate-50 p-1 rounded-lg border border-slate-100 w-full md:w-[250px] flex gap-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>

      {/* Stats Skeleton - 10 cards matching 2-row layout (5 per row) */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="h-[85px] p-3 border-slate-100 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-6 w-12" />
          </Card>
        ))}
      </div>

      {/* List / Filter Skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 items-end">
          <div className="md:col-span-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <div className="max-h-[600px]">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[50px] text-center font-semibold h-12">No</TableHead>
                  <TableHead className="w-[180px] font-semibold h-12">Waktu</TableHead>
                  <TableHead className="w-[130px] font-semibold h-12">Entitas</TableHead>
                  <TableHead className="w-[160px] font-semibold h-12">Menu</TableHead>
                  <TableHead className="font-semibold h-12">Aktivitas</TableHead>
                  <TableHead className="w-[80px] text-right font-semibold h-12 pr-6">
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
