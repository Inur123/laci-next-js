"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  generateEncryptedFilename,
} from "@/lib/encryption";
import { revalidatePath, revalidateTag } from "next/cache";

// FS Imports Removed
import { Organisasi, JenisSurat, ArsipSurat, Prisma } from "@prisma/client";
import { createLog } from "@/lib/log-activity";
import { uploadToR2, deleteFromR2, downloadFromR2 } from "@/lib/storage-r2";

// Type untuk form data
export type ArsipSuratFormData = {
  organisasi: Organisasi | null;
  noSurat: string;
  jenisSurat: JenisSurat;
  tanggal: Date;
  pengirimPenerima: string;
  deskripsi?: string;
  perihal: string;
  file?: File;
};

/**
 * Get all arsip surat for current user's active periode with filtering
 */
/**
 * Get all arsip surat for current user's active periode with filtering
 */
export async function getArsipSurats(
  query?: string,
  organisasiFilter?: string,
  jenisSuratFilter?: string,
  page: number = 1,
  limit: number = 10,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get active periode
  const periodeAktif = await prisma.periode.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  if (!periodeAktif) return { data: [], total: 0, totalPages: 0 };

  // Build DB filter for non-encrypted fields
  const whereClause: Prisma.ArsipSuratWhereInput = {
    userId: session.user.id,
    periodeId: periodeAktif.id,
  };

  if (
    organisasiFilter &&
    organisasiFilter !== "ALL" &&
    Object.values(Organisasi).includes(organisasiFilter as Organisasi)
  ) {
    whereClause.organisasi = organisasiFilter as Organisasi;
  }

  if (
    jenisSuratFilter &&
    jenisSuratFilter !== "ALL" &&
    Object.values(JenisSurat).includes(jenisSuratFilter as JenisSurat)
  ) {
    whereClause.jenisSurat = jenisSuratFilter as JenisSurat;
  }

  // OPTIMIZATION: If NO search query, use DB pagination
  if (!query) {
    const [total, arsipSurats] = await Promise.all([
      prisma.arsipSurat.count({ where: whereClause }),
      prisma.arsipSurat.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Decrypt data
    const decryptedArsip = arsipSurats.map((arsip: ArsipSurat) => ({
      ...arsip,
      noSurat: decryptText(arsip.noSurat),
      pengirimPenerima: decryptText(arsip.pengirimPenerima),
      deskripsi: arsip.deskripsi ? decryptText(arsip.deskripsi) : null,
      perihal: decryptText(arsip.perihal),
    }));

    return {
      data: decryptedArsip,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // If query exists, we must fetch ALL matches (by org/type) then filter in memory
  // This is unavoidable with encrypted searchable fields unless we use blind indexing
  const arsipSurats = await prisma.arsipSurat.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: 500, // Safety limit for in-memory search
  });

  // Decrypt data
  const decryptedArsip = arsipSurats.map((arsip: ArsipSurat) => ({
    ...arsip,
    noSurat: decryptText(arsip.noSurat),
    pengirimPenerima: decryptText(arsip.pengirimPenerima),
    deskripsi: arsip.deskripsi ? decryptText(arsip.deskripsi) : null,
    perihal: decryptText(arsip.perihal),
  }));

  // Filter keys that are encrypted (in-memory) if query exists
  const lowerQuery = query.toLowerCase();
  const filtered = decryptedArsip.filter(
    (item: ArsipSurat) =>
      item.noSurat.toLowerCase().includes(lowerQuery) ||
      item.perihal.toLowerCase().includes(lowerQuery) ||
      item.pengirimPenerima.toLowerCase().includes(lowerQuery) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(lowerQuery)),
  );

  // Manual pagination for filtered results
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get statistics for arsip surat
 */
export async function getArsipStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const periodeAktif = await prisma.periode.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  if (!periodeAktif) return null;

  const whereBase = {
    userId: session.user.id,
    periodeId: periodeAktif.id,
  };

  const [total, masuk, keluar, ipnu, ippnu, bersama] = await Promise.all([
    prisma.arsipSurat.count({ where: whereBase }),
    prisma.arsipSurat.count({
      where: { ...whereBase, jenisSurat: "MASUK" },
    }),
    prisma.arsipSurat.count({
      where: { ...whereBase, jenisSurat: "KELUAR" },
    }),
    prisma.arsipSurat.count({
      where: { ...whereBase, organisasi: "IPNU" },
    }),
    prisma.arsipSurat.count({
      where: { ...whereBase, organisasi: "IPPNU" },
    }),
    prisma.arsipSurat.count({
      where: { ...whereBase, organisasi: "BERSAMA" },
    }),
  ]);

  return {
    total,
    masuk,
    keluar,
    ipnu,
    ippnu,
    bersama,
  };
}

/**
 * Get single arsip surat by ID
 */
export async function getArsipSuratById(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const arsip = await prisma.arsipSurat.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      periode: true,
    },
  });

  if (!arsip) return null;

  // Decrypt data
  return {
    ...arsip,
    noSurat: decryptText(arsip.noSurat),
    pengirimPenerima: decryptText(arsip.pengirimPenerima),
    deskripsi: arsip.deskripsi ? decryptText(arsip.deskripsi) : null,
    perihal: decryptText(arsip.perihal),
  };
}

/**
 * Create new arsip surat with encryption
 */
export async function createArsipSurat(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  // Get active periode
  const periodeAktif = await prisma.periode.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  });

  if (!periodeAktif) {
    return {
      error:
        "Tidak ada periode aktif. Silakan aktifkan periode terlebih dahulu.",
    };
  }

  // Extract form data
  const rawOrganisasi = formData.get("organisasi")?.toString();
  const organisasi = (
    rawOrganisasi ? rawOrganisasi : null
  ) as Organisasi | null;
  const noSurat = formData.get("noSurat") as string;
  const jenisSurat = formData.get("jenisSurat") as JenisSurat;
  const tanggal = new Date(formData.get("tanggal") as string);
  const pengirimPenerima = formData.get("pengirimPenerima") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const perihal = formData.get("perihal") as string;
  const file = formData.get("file") as File | null;
  if (file && file instanceof File && file.size > 2 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 2MB" };
  }

  // Handle file upload and encryption
  let encryptedFilePath: string | null = null;
  if (file && file instanceof File && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Encrypt file
    const encryptedBuffer = encryptFile(buffer);
    const encryptedFilename = generateEncryptedFilename(file.name);

    // Upload to R2 (Cloudflare)
    // Path: arsip/<filename>
    const r2Key = `arsip/${encryptedFilename}`;

    try {
      await uploadToR2(encryptedBuffer, r2Key, file.type);
      encryptedFilePath = r2Key;
    } catch (uploadError) {
      console.error("R2 Upload Error:", uploadError);
      return { error: "Gagal mengupload file ke storage cloud" };
    }
  }

  // Encrypt sensitive data
  const encryptedData = {
    userId: session.user.id,
    periodeId: periodeAktif.id,
    organisasi,
    noSurat: encryptText(noSurat),
    jenisSurat,
    tanggal,
    pengirimPenerima: encryptText(pengirimPenerima),
    deskripsi: deskripsi ? encryptText(deskripsi) : null,
    perihal: encryptText(perihal),
    file: encryptedFilePath,
  };

  try {
    const arsip = await prisma.arsipSurat.create({
      data: encryptedData,
    });

    // Log activity
    createLog(
      "CREATE",
      "ARSIP_SURAT",
      `Membuat arsip surat: ${noSurat}`,
      arsip.id,
    );

    revalidatePath("/dashboard/arsip/surat", "page");
    revalidatePath("/dashboard", "layout"); 

    return { success: "Arsip surat berhasil dibuat!", data: arsip };
  } catch (error) {
    console.error("Database error:", error);
    return { error: `Gagal menyimpan: ${(error as Error).message}` };
  }
}

/**
 * Update arsip surat
 */
export async function updateArsipSurat(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  try {
    const existing = await prisma.arsipSurat.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) return { error: "Arsip surat tidak ditemukan" };

    const rawOrganisasi = formData.get("organisasi")?.toString();
    const organisasi = (
      rawOrganisasi ? rawOrganisasi : null
    ) as Organisasi | null;
    const noSurat = formData.get("noSurat") as string;
    const jenisSurat = formData.get("jenisSurat") as JenisSurat;
    const tanggal = new Date(formData.get("tanggal") as string);
    const pengirimPenerima = formData.get("pengirimPenerima") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const perihal = formData.get("perihal") as string;
    const file = formData.get("file") as File | null;
    if (file && file instanceof File && file.size > 2 * 1024 * 1024) {
      return { error: "Ukuran file maksimal 2MB" };
    }

    let encryptedFilePath = existing.file;
    if (file && file instanceof File && file.size > 0) {
      if (existing.file) {
        // Old file deletion logic
        try {
          // If it's a new R2 path (simple string), delete from R2
          if (!existing.file.startsWith("/storage")) {
            await deleteFromR2(existing.file);
          }
          // Note: If migrating from local storage, old files won't be deleted automatically
          // from server file system because we lack fs access in serverless environment.
        } catch (e) {
          console.error("Error deleting old file:", e);
        }
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const encryptedBuffer = encryptFile(buffer);
      const encryptedFilename = generateEncryptedFilename(file.name);

      const r2Key = `arsip/${encryptedFilename}`;
      await uploadToR2(encryptedBuffer, r2Key, file.type);

      encryptedFilePath = r2Key;
    }

    await prisma.arsipSurat.update({
      where: { id },
      data: {
        organisasi,
        noSurat: encryptText(noSurat),
        jenisSurat,
        tanggal,
        pengirimPenerima: encryptText(pengirimPenerima),
        deskripsi: deskripsi ? encryptText(deskripsi) : null,
        perihal: encryptText(perihal),
        file: encryptedFilePath,
      },
    });

    // Log activity
    createLog(
      "UPDATE",
      "ARSIP_SURAT",
      `Mengupdate arsip surat: ${noSurat}`,
      id,
    );

    revalidatePath("/dashboard/arsip/surat", "page");
    revalidatePath(`/dashboard/arsip/surat/${id}`, "page");
    revalidatePath("/dashboard", "layout"); 

    return { success: "Arsip surat berhasil diperbarui!" };
  } catch (error) {
    console.error("Update error:", error);
    return { error: "Gagal memperbarui arsip surat" };
  }
}

/**
 * Delete arsip surat
 */
export async function deleteArsipSurat(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  try {
    const arsip = await prisma.arsipSurat.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!arsip) return { error: "Arsip surat tidak ditemukan" };

    if (arsip.file) {
      try {
        // Delete from R2 (assuming new format)
        // Old local files won't be deleted, but that's acceptable in migration
        if (!arsip.file.startsWith("/storage")) {
          await deleteFromR2(arsip.file);
        }
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    }

    // Get noSurat before deleting for log
    const noSuratDecrypted = decryptText(arsip.noSurat);

    await prisma.arsipSurat.delete({
      where: { id },
    });

    // Log activity
    createLog(
      "DELETE",
      "ARSIP_SURAT",
      `Menghapus arsip surat: ${noSuratDecrypted}`,
      id,
    );

    revalidatePath("/dashboard/arsip/surat", "page");
    revalidatePath("/dashboard", "layout"); 
    return { success: "Arsip surat berhasil dihapus!" };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Gagal menghapus arsip surat" };
  }
}

/**
 * Download and decrypt file
 */
export async function downloadArsipFile(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const arsip = await prisma.arsipSurat.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!arsip || !arsip.file) throw new Error("File tidak ditemukan");

  // Download from R2
  // If it's an old file (starts with /storage), it will fail in Vercel.
  // Assuming all new files are R2 keys.

  let encryptedBuffer: Buffer;

  if (arsip.file.startsWith("/storage") || arsip.file.startsWith("/uploads")) {
    // Fallback for legacy local files (won't work in Vercel but keeps type safety)
    // In migration, these files should have been moved or will be broken.
    throw new Error(
      "File LAMA (lokal) tidak dapat diakses di Cloud. Silakan upload ulang file.",
    );
  } else {
    // R2 Download
    encryptedBuffer = await downloadFromR2(arsip.file);
  }
  return decryptFile(encryptedBuffer);
}

/**
 * Parse tanggal dari berbagai format:
 * - ISO: 2025-01-15
 * - DD/MM/YYYY: 15/01/2025
 * - Format Indonesia: "15 Januari 2025"
 */
function parseFlexibleDate(raw: string): Date | null {
  const s = raw.trim();

  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [d, m, y] = s.split("/");
    return new Date(`${y}-${m}-${d}`);
  }

  // Format Indonesia: "15 Februari 2026"
  const BULAN: Record<string, string> = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };
  const parts = s.toLowerCase().split(" ");
  if (parts.length === 3) {
    const month = BULAN[parts[1]];
    if (month) {
      const d = new Date(`${parts[2]}-${month}-${parts[0].padStart(2, "0")}`);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Fallback
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Bulk import arsip surat dari Excel (tanpa file lampiran)
 */
export async function bulkImportArsipSurat(
  rows: Array<{
    noSurat: string;
    jenisSurat: string;
    organisasi?: string;
    tanggal: string; // YYYY-MM-DD atau DD/MM/YYYY
    pengirimPenerima: string;
    perihal: string;
    deskripsi?: string;
  }>,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Belum terautentikasi" };

  const periodeAktif = await prisma.periode.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (!periodeAktif)
    return {
      error: "Tidak ada periode aktif. Aktifkan periode terlebih dahulu.",
    };

  let success = 0;
  let failed = 0;
  const failedRows: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowLabel = `Baris ${i + 2}`; // +2: header on row 1

    try {
      // Validasi field wajib
      if (!row.noSurat?.trim()) {
        failed++;
        failedRows.push(`${rowLabel}: No. Surat kosong`);
        continue;
      }
      if (!row.jenisSurat?.trim()) {
        failed++;
        failedRows.push(`${rowLabel}: Jenis Surat kosong`);
        continue;
      }
      if (!row.tanggal?.trim()) {
        failed++;
        failedRows.push(`${rowLabel}: Tanggal kosong`);
        continue;
      }
      if (!row.pengirimPenerima?.trim()) {
        failed++;
        failedRows.push(`${rowLabel}: Pengirim/Penerima kosong`);
        continue;
      }
      if (!row.perihal?.trim()) {
        failed++;
        failedRows.push(`${rowLabel}: Perihal kosong`);
        continue;
      }

      // Validasi Jenis Surat enum
      const jenisSuratUpper = row.jenisSurat.trim().toUpperCase();
      if (!Object.values(JenisSurat).includes(jenisSuratUpper as JenisSurat)) {
        failed++;
        failedRows.push(
          `${rowLabel}: Jenis Surat tidak valid "${row.jenisSurat}" (harus MASUK atau KELUAR)`,
        );
        continue;
      }

      // Validasi Organisasi enum (opsional)
      let organisasi: Organisasi | null = null;
      if (row.organisasi?.trim()) {
        const orgUpper = row.organisasi.trim().toUpperCase();
        if (Object.values(Organisasi).includes(orgUpper as Organisasi)) {
          organisasi = orgUpper as Organisasi;
        }
        // Jika tidak valid, biarkan null (tidak gagal)
      }

      // Parse tanggal — mendukung: YYYY-MM-DD, DD/MM/YYYY, "15 Februari 2026"
      const tanggal = parseFlexibleDate(row.tanggal);

      if (!tanggal) {
        failed++;
        failedRows.push(
          `${rowLabel}: Format tanggal tidak dikenali "${row.tanggal}"`,
        );
        continue;
      }

      await prisma.arsipSurat.create({
        data: {
          userId: session.user.id,
          periodeId: periodeAktif.id,
          noSurat: encryptText(row.noSurat.trim()),
          jenisSurat: jenisSuratUpper as JenisSurat,
          organisasi,
          tanggal,
          pengirimPenerima: encryptText(row.pengirimPenerima.trim()),
          perihal: encryptText(row.perihal.trim()),
          deskripsi: row.deskripsi?.trim()
            ? encryptText(row.deskripsi.trim())
            : null,
          file: null,
        },
      });

      success++;
    } catch (err) {
      failed++;
      failedRows.push(`${rowLabel}: ${(err as Error).message}`);
    }
  }

  // Log activity
  if (success > 0) {
    createLog(
      "CREATE",
      "ARSIP_SURAT",
      `Import Excel: ${success} arsip surat berhasil diimport`,
    );
    revalidatePath("/dashboard/arsip/surat", "page");
    revalidatePath("/dashboard", "layout"); 
  }

  return { success, failed, failedRows };
}
