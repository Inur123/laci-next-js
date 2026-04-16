import { auth } from "@/auth";

import { redirect } from "next/navigation";
import { getEmailStats, getEmailLogs } from "@/app/actions/log-email-actions";
import { EmailLogClient } from "@/components/features/log-email/email-log-client";
import { EmailLogSkeleton } from "@/components/features/log-email/email-log-skeleton";
import { Suspense } from "react";

// Note: Removed "use server" metadata to make this simpler or just keep it server.
// Actually this SHOULD be a server component if I'm using auth() and actions.
// Wait, I saw "use client" in my thought but it should be server.

export default async function EmailLogPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only Sekretaris Cabang can access this page
  if (session.user.role !== "SEKRETARIS_CABANG") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<EmailLogSkeleton />}>
      <EmailLogContent />
    </Suspense>
  );
}

async function EmailLogContent() {
  const [stats, initialLogs] = await Promise.all([
    getEmailStats(),
    getEmailLogs({}, 1, 20),
  ]);

  return <EmailLogClient initialStats={stats} initialLogs={initialLogs} />;
}
