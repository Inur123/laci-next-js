"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Mail,
  Trophy,
  Activity,
  UserPlus,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface LeaderboardItem {
  id: string;
  name: string;
  image: string | null;
  score: number;
  stats: {
    anggotas: number;
    arsipSurats?: number;
    kegiatans: number;
    berkasSps?: number;
    totalAdmin?: number;
  };
}

interface MonitoringStats {
  global: {
    totalAnggota: number;
    totalSurat: number;
    totalPAC: number;
    verifikasiPending: number;
  };
  leaderboard: LeaderboardItem[];
}

export function DashboardMonitoring({ data }: { data: MonitoringStats | null }) {
  if (!data) return null;
  // Top 3 Winners Styling
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-50 border-yellow-200 text-yellow-700"; // Gold
      case 1:
        return "bg-slate-50 border-slate-200 text-slate-700"; // Silver
      case 2:
        return "bg-orange-50 border-orange-200 text-orange-800"; // Bronze
      default:
        return "bg-white border-slate-100 text-slate-600";
    }
  };

  const getTrophyIcon = (index: number) => {
    if (index === 0)
      return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (index === 1)
      return <Trophy className="w-5 h-5 text-slate-400 fill-slate-400" />;
    if (index === 2)
      return <Trophy className="w-5 h-5 text-orange-500 fill-orange-500" />;
    return (
      <span className="text-sm font-bold w-5 text-center">#{index + 1}</span>
    );
  };

  // Chart Data Preparation
  const top5Pac = data.leaderboard.slice(0, 5).map((pac) => ({
    name: pac.name.replace("PAC IPNU IPPNU ", "").substring(0, 15), // Shorten name
    score: pac.score,
  }));
  const distributionData = [
    { name: "Anggota", value: data.global.totalAnggota, color: "#2563eb" }, // Blue
    { name: "Administrasi", value: data.global.totalSurat, color: "#d97706" }, // Amber
    { name: "PAC", value: data.global.totalPAC * 10, color: "#0ea5e9" }, // Sky Blue (Scaled)
  ];

  return (
    <div className="space-y-6">
      {/* 1. Global Stats Row Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardCompact
          title="Total Anggota"
          value={data.global.totalAnggota}
          icon={Users}
          colorClass="text-blue-700"
          bgClass="bg-blue-50/20 border-blue-100"
        />
        <StatsCardCompact
          title="Total Administrasi"
          value={data.global.totalSurat}
          icon={Mail}
          colorClass="text-sky-700"
          bgClass="bg-sky-50/20 border-sky-100"
        />
        <StatsCardCompact
          title="PAC Aktif"
          value={data.global.totalPAC}
          icon={Activity}
          colorClass="text-indigo-700"
          bgClass="bg-indigo-50/20 border-indigo-100"
        />
        <StatsCardCompact
          title="Verif. Pending"
          value={data.global.verifikasiPending}
          icon={UserPlus}
          colorClass="text-rose-700"
          bgClass="bg-rose-50/20 border-rose-100"
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Chart (2/3 width) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Top 5 PAC Paling Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-6">
              <div
                className="h-[280px] w-full mt-4"
                style={{ height: "280px", minHeight: "280px" }}
              >
                {top5Pac.length > 0 && top5Pac.some((d) => d.score > 0) ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart
                      data={top5Pac}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      barSize={20}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={90}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="score"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1000}
                        label={{
                          position: "right",
                          fill: "#64748b",
                          fontSize: 10,
                          formatter: (
                            val: string | number | boolean | null | undefined,
                          ) => `${val ?? ""}`,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 mx-4">
                    <Trophy className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Belum ada data peringkat</p>
                    <p className="text-xs text-slate-400">
                      Menunggu aktivitas PAC
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Chart (1/3 width) */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm h-full transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieIcon className="text-blue-600" size={20} />
                Sebaran Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[320px] pb-6 px-4">
              <div
                className="h-[200px] w-full"
                style={{ height: "200px", minHeight: "200px" }}
              >
                {distributionData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-dashed flex items-center justify-center">
                      <PieIcon className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-xs font-medium mt-4">Data masih kosong</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-500 font-medium">
                      {item.name} {index === 2 ? "(x10)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Full Width Leaderboard Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
          <CardTitle className="text-base font-bold">
            Rincian Klasemen Lengkap
          </CardTitle>
        </CardHeader>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">Nama PAC</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  Anggota
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  Total Administrasi
                </th>
                <th className="px-4 py-3 text-center">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.leaderboard.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada data aktivitas.
                  </td>
                </tr>
              ) : (
                data.leaderboard.map((pac, index) => (
                  <tr
                    key={pac.id}
                    className={`hover:bg-slate-50/80 transition-colors ${getRankStyle(index)}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center">
                        {getTrophyIcon(index)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-white shadow-sm">
                          <AvatarImage src={pac.image || ""} />
                          <AvatarFallback className="text-[10px]">
                            {pac.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold truncate max-w-[120px] sm:max-w-none">
                          {pac.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">
                      {pac.stats.anggotas}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">
                      {pac.stats.totalAdmin ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {pac.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatsCardCompact({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <Card
      className={`h-[85px] flex flex-col justify-between p-3 shadow-none border ${bgClass} ${colorClass.replace("text", "border")}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase ${colorClass}`}>
          {title}
        </span>
        <Icon
          className={`h-4 w-4 ${colorClass.replace("700", "500").replace("600", "400")}`}
        />
      </div>
      <div className={`text-xl font-bold leading-none ${colorClass}`}>
        {value}
      </div>
    </Card>
  );
}
