"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, QrCode, Plus } from "lucide-react";

export function PresensiListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-48 rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border overflow-hidden">
        {/* Table Header */}
        <div className="bg-slate-50/40 px-4 py-3 flex gap-4 border-b">
          <Skeleton className="h-4 w-8 shrink-0" />
          <Skeleton className="h-4 flex-1 max-w-[200px]" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-4 w-14 shrink-0" />
          <Skeleton className="h-4 w-20 shrink-0" />
          <Skeleton className="h-4 w-8 shrink-0 ml-auto" />
        </div>
        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 flex gap-4 items-center border-b last:border-0"
          >
            <Skeleton className="h-4 w-6 shrink-0" />
            <div className="flex-1 max-w-[200px] space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            <Skeleton className="h-7 w-7 rounded-md shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PresensiFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6 border-t font-semibold">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PresensiDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Info + QR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="lg:col-span-2 border-slate-200">
          <div className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QR Card */}
        <Card className="border-slate-200">
          <div className="p-4 text-center border-b bg-slate-50">
            <Skeleton className="h-6 w-28 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto mt-1" />
          </div>
          <CardContent className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-[216px] h-[216px] rounded-xl mb-4" />
            <Skeleton className="h-9 w-full rounded-md mb-2" />
            <Skeleton className="h-8 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table Card */}
      <Card className="border-slate-200">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <CardContent className="pt-4">
          {/* Search bar skeleton */}
          <div className="mb-4">
            <Skeleton className="h-3 w-20 mb-1.5" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          {/* Table skeleton */}
          <div className="rounded-md border overflow-hidden">
            <div className="bg-slate-50/40 px-4 py-3 flex gap-4 border-b">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 flex gap-4 items-center border-b last:border-0"
              >
                <Skeleton className="h-4 w-6 shrink-0" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
