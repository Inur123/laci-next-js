import { auth } from "@/auth";
import { getUserDetail } from "@/app/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import UserDetailClient from "@/components/features/manajemen-user/user-detail-client";
import { Suspense } from "react";
import { UserDetailSkeleton } from "@/components/features/manajemen-user/user-skeleton";

type UserDetail = Parameters<typeof UserDetailClient>[0]["user"];

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (session?.user?.role !== "SEKRETARIS_CABANG") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<UserDetailSkeleton />}>
      <UserDetailContent params={params} />
    </Suspense>
  );
}

async function UserDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) {
    notFound();
  }

  return <UserDetailClient user={user as any} />;
}
