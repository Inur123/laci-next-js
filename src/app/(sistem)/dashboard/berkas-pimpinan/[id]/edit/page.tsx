import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBerkasPimpinanById } from "@/app/actions/berkas-pimpinan-actions";
import { BerkasPimpinanForm } from "@/components/features/berkas-pimpinan/berkas-pimpinan-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function EditBerkasPimpinanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const berkas = await getBerkasPimpinanById(id);
  if (!berkas) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isCabang = user?.role === "SEKRETARIS_CABANG";
  const label = isCabang ? "Berkas Cabang" : "Berkas PAC";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/berkas-pimpinan">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Edit {label}</h2>
          <p className="text-sm text-muted-foreground">
            Perbarui informasi berkas pimpinan.
          </p>
        </div>
      </div>

      <BerkasPimpinanForm berkas={berkas} userRole={session.user.role} />
    </div>
  );
}
