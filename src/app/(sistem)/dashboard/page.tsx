import { getDashboardStats } from "@/app/actions/dashboard-actions";
import DashboardClient from "@/components/features/dashboard/dashboard-client";

import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Check for login success cookie
  const cookieStore = await cookies();
  const showLoginToast = cookieStore.get("login_success")?.value === "true";

  // Delete cookie immediately after reading
  if (showLoginToast) {
    // We cannot delete cookie here easily because it's a server component during render,
    // but the Client Component will handle the display.
    // Actually, setting it to delete in a server component is tricky.
    // Let's just pass the prop.
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient initialData={stats} showLoginToast={showLoginToast} />
    </Suspense>
  );
}
