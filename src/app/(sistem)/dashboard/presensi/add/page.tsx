import { PresensiForm } from "@/components/features/presensi/presensi-form";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Buat Presensi Baru",
};

export default async function AddPresensiPage() {
  const session = await auth();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/presensi">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>

        <div>
          <h2 className="text-xl font-semibold">Buat Presensi</h2>
          <p className="text-sm text-muted-foreground">
            Silakan isi formulir di bawah untuk membuat sesi absensi baru.
          </p>
        </div>
      </div>

      <PresensiForm userRole={session?.user?.role ?? "SEKRETARIS_PAC"} />
    </div>
  );
}
