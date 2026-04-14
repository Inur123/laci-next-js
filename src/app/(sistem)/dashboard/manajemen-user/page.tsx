import { auth } from "@/auth";
import { getPACUsers, getUserStats } from "@/app/actions/auth-actions";
import { UserList } from "@/components/features/manajemen-user/user-list";
import { UserStats } from "@/components/features/manajemen-user/user-stats";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Suspense } from "react";
import { UserSkeleton } from "@/components/features/manajemen-user/user-skeleton";

export const metadata = {
  title: "Manajemen User | Laci Digital",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (session?.user?.role !== "SEKRETARIS_CABANG") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Manajemen User (PAC)</h2>
            <p className="text-sm text-muted-foreground">
              Kelola status dan keamanan akun Sekretaris PAC.
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<UserSkeleton />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = (params.q as string) || "";
  const page = Number(params.page) || 1;
  const limit = 10;

  const [userData, stats] = await Promise.all([
    getPACUsers(q, page, limit),
    getUserStats(),
  ]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <UserStats stats={stats} />
      <UserList
        users={userData.data}
        totalPages={userData.totalPages}
        currentPage={page}
        totalItems={userData.total}
      />
    </div>
  );
}
