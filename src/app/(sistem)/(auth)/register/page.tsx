import { Metadata } from "next";
import RegisterForm from "@/components/features/auth/register-form";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  // Cek apakah ada Sekretaris Cabang yang aktif DAN memiliki periode aktif
  const cabangAdmin = await prisma.user.findFirst({
    where: {
      role: "SEKRETARIS_CABANG",
      isActive: true,
      periodes: {
        some: {
          isActive: true,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const isCabangReady = !!cabangAdmin;

  return <RegisterForm isCabangReady={isCabangReady} />;
}
