import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEmailStats, getEmailLogs } from "@/app/actions/log-email-actions";
import { EmailLogClient } from "@/components/features/log-email/email-log-client";
import { EmailLogSkeleton } from "@/components/features/log-email/email-log-skeleton";
import { Mail } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Log Email | Laci Digital",
};

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
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Log Email</h2>
            <p className="text-sm text-muted-foreground">
              Pantau dan kelola semua email yang dikirim oleh sistem
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<EmailLogSkeleton />}>
        <EmailLogContent />
      </Suspense>
    </div>
  );
}

async function EmailLogContent() {
  const [stats, initialLogs] = await Promise.all([
    getEmailStats(),
    getEmailLogs({}, 1, 20),
  ]);

  return <EmailLogClient initialStats={stats} initialLogs={initialLogs} />;
}
