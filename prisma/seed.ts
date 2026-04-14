import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const email = "lacipelajarnumagetan@gmail.com";
  const password = "password";
  const userId = "ipnuippnu-admin-cabang";

  console.log("Memulai proses seeding untuk Admin Cabang...");

  // 1. Bersihkan dulu data lama jika ada untuk email ini
  // Kita hapus secara manual agar tidak ada konflik unik
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.account.deleteMany({ where: { userId: existingUser.id } });
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
    console.log("   ✓ Menghapus data admin lama untuk sinkronisasi ulang.");
  }

  // 2. Gunakan API SignUp Better Auth agar Hashing Password OTOMATIS Sesuai Standar Better Auth
  // Ini menghindari error 'undefined' atau hashing yang tidak cocok
  console.log("   ➤ Mendaftarkan admin via Better Auth API...");
  const signUpResponse = await (auth.api as any).signUpEmail({
    body: {
      email,
      password,
      name: "Sekretaris Cabang",
    },
    headers: new Headers(), // Headers kosong untuk server-side call
  });

  if (!signUpResponse) {
    throw new Error("Gagal melakukan pendaftaran via Better Auth API");
  }

  const newUserId = signUpResponse.user.id;

  // 3. Update User agar ID-nya sesuai dengan aturan project Anda
  // Dan set status Aktif, Terverifikasi, serta Role Sekretaris Cabang
  console.log(`   ➤ Menyesuaikan ID User ke: ${userId}...`);

  // Kita update menggunakan Prisma
  // Karena Account memiliki relasi ke User, kita harus update keduanya
  await prisma.$transaction([
    prisma.user.update({
      where: { id: newUserId },
      data: {
        id: userId,
        role: "SEKRETARIS_CABANG",
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.account.updateMany({
      where: { userId: newUserId },
      data: { userId: userId },
    }),
  ]);

  // 4. Seed Allowed Origins (PENTING untuk CORS/Auth)
  const domains = ["localhost", "pelajarnumagetan.or.id"];
  for (const domain of domains) {
    await prisma.allowedOrigin.upsert({
      where: { domain },
      update: {},
      create: { domain },
    });
  }

  console.log("✅ Seed Berhasil:");
  console.log("- User ID:", userId);
  console.log("- Email:", email);
  console.log("- Role: SEKRETARIS_CABANG");
  console.log("- Status: Aktif & Terverifikasi");
  console.log("- Allowed Origins:", domains.join(", "));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed Gagal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
