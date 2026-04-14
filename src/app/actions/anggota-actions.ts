"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  encryptText,
  decryptText,
  encryptFile,
  generateEncryptedFilename,
} from "@/lib/encryption";
import { JenisKelamin, Prisma } from "@prisma/client";
import { createLog } from "@/lib/log-activity";
import { uploadToR2, deleteFromR2 } from "@/lib/storage-r2";
import { revalidatePath } from "next/cache";

/**
 * Get List of Members with Pagination and Search
 */
export async function getAnggotaList(
  query?: string,
  page: number = 1,
  limit: number = 10,
  userId?: string,
  periodeId?: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const periodeAktif = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isCabang = currentUser?.role === "SEKRETARIS_CABANG";
  let whereClause: Prisma.AnggotaWhereInput = {};

  if (!isCabang) {
    const effectivePeriodeId = periodeId || periodeAktif?.id;
    if (!effectivePeriodeId) return { data: [], total: 0, totalPages: 0 };
    whereClause = { userId: session.user.id, periodeId: effectivePeriodeId };
  } else {
    if (userId && userId !== "ALL") whereClause.userId = userId;
    if (periodeId) {
      whereClause.periodeId = periodeId;
    } else if (periodeAktif) {
      whereClause.periode = { nama: periodeAktif.nama };
    } else {
      return { data: [], total: 0, totalPages: 0 };
    }
  }

  if (!query) {
    const [total, allAnggota] = await Promise.all([
      prisma.anggota.count({ where: whereClause }),
      prisma.anggota.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true } },
          periode: { select: { nama: true } },
        },
      }),
    ]);
    const decryptedData = allAnggota.map((item) => ({
      ...item,
      namaLengkap: decryptText(item.namaLengkap),
      nik: item.nik ? decryptText(item.nik) : null,
      nia: item.nia ? decryptText(item.nia) : null,
      noHp: item.noHp ? decryptText(item.noHp) : null,
      jabatan: item.jabatan ? decryptText(item.jabatan) : null,
    }));
    return { data: decryptedData, total, totalPages: Math.ceil(total / limit) };
  }

  const allAnggota = await prisma.anggota.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      periode: { select: { nama: true } },
    },
    take: 500,
  });

  const decryptedData = allAnggota.map((item) => ({
    ...item,
    namaLengkap: decryptText(item.namaLengkap),
    nik: item.nik ? decryptText(item.nik) : null,
    nia: item.nia ? decryptText(item.nia) : null,
    noHp: item.noHp ? decryptText(item.noHp) : null,
    jabatan: item.jabatan ? decryptText(item.jabatan) : null,
  }));

  const lowerQuery = query.toLowerCase();
  const filtered = decryptedData.filter(
    (item) =>
      item.namaLengkap.toLowerCase().includes(lowerQuery) ||
      (item.jabatan && item.jabatan.toLowerCase().includes(lowerQuery)) ||
      (item.nik && item.nik.toLowerCase().includes(lowerQuery)) ||
      (item.nia && item.nia.toLowerCase().includes(lowerQuery)),
  );

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return { data: paginatedData, total, totalPages: Math.ceil(total / limit) };
}

/**
 * Get all active users (for filtering by creator)
 */
export async function getActiveUsers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "SEKRETARIS_CABANG") return [];

  return await prisma.user.findMany({
    where: { isActive: true, emailVerified: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Get member by ID with full details
 */
export async function getAnggotaById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const item = await prisma.anggota.findUnique({
    where: { id },
    include: { perkaderans: true },
  });

  if (!item) return null;

  return {
    ...item,
    namaLengkap: decryptText(item.namaLengkap),
    nik: item.nik ? decryptText(item.nik) : null,
    nia: item.nia ? decryptText(item.nia) : null,
    noHp: item.noHp ? decryptText(item.noHp) : null,
    alamatLengkap: item.alamatLengkap ? decryptText(item.alamatLengkap) : null,
    hobi: item.hobi ? decryptText(item.hobi) : null,
    jabatan: item.jabatan ? decryptText(item.jabatan) : null,
    noRfid: item.noRfid ? decryptText(item.noRfid) : null,
    namaInstansiPendidikan: item.namaInstansiPendidikan
      ? decryptText(item.namaInstansiPendidikan)
      : null,
    tempatLahir: item.tempatLahir ? decryptText(item.tempatLahir) : null,
    perkaderans: item.perkaderans.map((p) => ({
      ...p,
      namaPerkaderan: decryptText(p.namaPerkaderan),
      tempat: decryptText(p.tempat),
    })),
  };
}

/**
 * Create New Member
 */
export async function createAnggota(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  const periodeAktif = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (!periodeAktif)
    return { error: "Silakan aktifkan periode terlebih dahulu." };

  const namaLengkap = formData.get("namaLengkap") as string;
  const jenisKelamin = formData.get("jenisKelamin") as JenisKelamin;

  if (!namaLengkap || !namaLengkap.trim())
    return { error: "Nama Lengkap wajib diisi" };

  let photoPath: string | null = null;
  const imageFile = formData.get("foto") as File | null;
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    photoPath = `anggota/${generateEncryptedFilename(imageFile.name)}`;
    await uploadToR2(encryptFile(buffer), photoPath, imageFile.type);
  }

  try {
    const rawPerkaderans = formData.get("perkaderans") as string;
    const anggota = await prisma.anggota.create({
      data: {
        userId: session.user.id,
        periodeId: periodeAktif.id,
        namaLengkap: encryptText(namaLengkap),
        jenisKelamin,
        foto: photoPath,
        nik: formData.get("nik")
          ? encryptText(formData.get("nik") as string)
          : null,
        nia: formData.get("nia")
          ? encryptText(formData.get("nia") as string)
          : null,
        email: (formData.get("email") as string) || null,
        tempatLahir: formData.get("tempatLahir")
          ? encryptText(formData.get("tempatLahir") as string)
          : null,
        tanggalLahir: formData.get("tanggalLahir")
          ? new Date(formData.get("tanggalLahir") as string)
          : null,
        alamatLengkap: formData.get("alamatLengkap")
          ? encryptText(formData.get("alamatLengkap") as string)
          : null,
        noHp: formData.get("noHp")
          ? encryptText(formData.get("noHp") as string)
          : null,
        hobi: formData.get("hobi")
          ? encryptText(formData.get("hobi") as string)
          : null,
        jabatan: formData.get("jabatan")
          ? encryptText(formData.get("jabatan") as string)
          : null,
        noRfid: formData.get("noRfid")
          ? encryptText(formData.get("noRfid") as string)
          : null,
        jenjangPendidikan:
          (formData.get("jenjangPendidikan") as string) || null,
        namaInstansiPendidikan: formData.get("namaInstansiPendidikan")
          ? encryptText(formData.get("namaInstansiPendidikan") as string)
          : null,
        perkaderans: {
          create: rawPerkaderans
            ? JSON.parse(rawPerkaderans).map((p: any) => ({
                namaPerkaderan: encryptText(p.namaPerkaderan),
                tanggal: new Date(p.tanggal),
                tempat: encryptText(p.tempat),
              }))
            : [],
        },
      },
    });

    createLog(
      "CREATE",
      "ANGGOTA",
      `Membuat data anggota: ${namaLengkap}`,
      anggota.id,
    );
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/anggota", "page");
    return { success: "Data anggota berhasil disimpan!" };
  } catch (error) {
    console.error(error);
    return { error: "Gagal menyimpan data anggota." };
  }
}

/**
 * Update Existing Member
 */
export async function updateAnggota(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  try {
    const existing = await prisma.anggota.findUnique({ where: { id } });
    if (!existing) return { error: "Data tidak ditemukan" };

    const namaLengkap = formData.get("namaLengkap") as string;
    let photoPath = existing.foto;
    const imageFile = formData.get("foto") as File | null;

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      if (existing.foto) await deleteFromR2(existing.foto).catch(() => {});
      photoPath = `anggota/${generateEncryptedFilename(imageFile.name)}`;
      await uploadToR2(
        encryptFile(Buffer.from(await imageFile.arrayBuffer())),
        photoPath,
        imageFile.type,
      );
    }

    const rawPerkaderans = formData.get("perkaderans") as string;

    await prisma.anggota.update({
      where: { id },
      data: {
        namaLengkap: encryptText(namaLengkap),
        jenisKelamin: formData.get("jenisKelamin") as JenisKelamin,
        foto: photoPath,
        nik: formData.get("nik")
          ? encryptText(formData.get("nik") as string)
          : null,
        nia: formData.get("nia")
          ? encryptText(formData.get("nia") as string)
          : null,
        email: (formData.get("email") as string) || null,
        tempatLahir: formData.get("tempatLahir")
          ? encryptText(formData.get("tempatLahir") as string)
          : null,
        tanggalLahir: formData.get("tanggalLahir")
          ? new Date(formData.get("tanggalLahir") as string)
          : null,
        alamatLengkap: formData.get("alamatLengkap")
          ? encryptText(formData.get("alamatLengkap") as string)
          : null,
        noHp: formData.get("noHp")
          ? encryptText(formData.get("noHp") as string)
          : null,
        hobi: formData.get("hobi")
          ? encryptText(formData.get("hobi") as string)
          : null,
        jabatan: formData.get("jabatan")
          ? encryptText(formData.get("jabatan") as string)
          : null,
        noRfid: formData.get("noRfid")
          ? encryptText(formData.get("noRfid") as string)
          : null,
        jenjangPendidikan:
          (formData.get("jenjangPendidikan") as string) || null,
        namaInstansiPendidikan: formData.get("namaInstansiPendidikan")
          ? encryptText(formData.get("namaInstansiPendidikan") as string)
          : null,
        perkaderans: {
          deleteMany: {},
          create: rawPerkaderans
            ? JSON.parse(rawPerkaderans).map((p: any) => ({
                namaPerkaderan: encryptText(p.namaPerkaderan),
                tanggal: new Date(p.tanggal),
                tempat: encryptText(p.tempat),
              }))
            : [],
        },
      },
    });

    createLog(
      "UPDATE",
      "ANGGOTA",
      `Mengupdate data anggota: ${namaLengkap}`,
      id,
    );
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/anggota", "page");
    revalidatePath(`/dashboard/anggota/${id}`, "page");
    return { success: "Data anggota berhasil diperbarui!" };
  } catch (error) {
    console.error(error);
    return { error: "Gagal memperbarui data anggota" };
  }
}

/**
 * Delete Member
 */
export async function deleteAnggota(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };
  try {
    const existing = await prisma.anggota.findUnique({ where: { id } });
    if (!existing) return { error: "Data anggota tidak ditemukan" };
    if (existing.foto) await deleteFromR2(existing.foto).catch(() => {});
    const nama = decryptText(existing.namaLengkap);
    await prisma.anggota.delete({ where: { id } });
    createLog("DELETE", "ANGGOTA", `Menghapus data anggota: ${nama}`, id);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/anggota", "page");
    return { success: "Data anggota berhasil dihapus!" };
  } catch (error) {
    return { error: "Gagal menghapus data anggota" };
  }
}

/**
 * Stats for Member Module
 */
export async function getAnggotaStats(userId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isCabang = user?.role === "SEKRETARIS_CABANG";
  let where: Prisma.AnggotaWhereInput = {};
  const active = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (isCabang) {
    if (userId && userId !== "ALL") where.userId = userId;
    if (active) where.periode = { nama: active.nama };
    else return { total: 0, lakiLaki: 0, perempuan: 0 };
  } else {
    if (!active) return null;
    where = { userId: session.user.id, periodeId: active.id };
  }

  const [total, lakiLaki, perempuan] = await Promise.all([
    prisma.anggota.count({ where }),
    prisma.anggota.count({ where: { ...where, jenisKelamin: "LAKI_LAKI" } }),
    prisma.anggota.count({ where: { ...where, jenisKelamin: "PEREMPUAN" } }),
  ]);
  return { total, lakiLaki, perempuan };
}

/**
 * Copy anggota to current period
 */
export async function copyAnggotaToCurrentPeriode(anggotaIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  const periodeAktif = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (!periodeAktif)
    return { error: "Silakan aktifkan periode tujuan terlebih dahulu." };

  try {
    const sourceAnggota = await prisma.anggota.findMany({
      where: { id: { in: anggotaIds } },
      include: { perkaderans: true },
    });

    const createdCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const item of sourceAnggota) {
        if (item.periodeId === periodeAktif.id) continue;
        await tx.anggota.create({
          data: {
            userId: session.user.id,
            periodeId: periodeAktif.id,
            namaLengkap: item.namaLengkap,
            nik: item.nik,
            nia: item.nia,
            email: item.email,
            foto: item.foto,
            jenisKelamin: item.jenisKelamin,
            tempatLahir: item.tempatLahir,
            tanggalLahir: item.tanggalLahir,
            alamatLengkap: item.alamatLengkap,
            noHp: item.noHp,
            hobi: item.hobi,
            jabatan: item.jabatan,
            noRfid: item.noRfid,
            jenjangPendidikan: item.jenjangPendidikan,
            namaInstansiPendidikan: item.namaInstansiPendidikan,
            perkaderans: {
              create: item.perkaderans.map((p) => ({
                namaPerkaderan: p.namaPerkaderan,
                tanggal: p.tanggal,
                tempat: p.tempat,
              })),
            },
          },
        });
        count++;
      }
      return count;
    });

    createLog(
      "CREATE",
      "ANGGOTA",
      `Menyalin ${createdCount} anggota ke periode: ${periodeAktif.nama}`,
    );
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/anggota", "page");
    return { success: `${createdCount} anggota berhasil disalin!` };
  } catch (error) {
    return { error: "Gagal menyalin data anggota." };
  }
}
