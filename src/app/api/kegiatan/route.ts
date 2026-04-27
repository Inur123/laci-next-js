import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decryptText } from "@/lib/encryption"; // Gunakan nama fungsi yang benar

export async function GET(request: Request) {
  try {
    const origin = request.headers.get("origin") || "";

    const data = await prisma.agendaKegiatan.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        tanggalMulai: "asc",
      },
    });

    const response = NextResponse.json({
      success: true,
      data: data.map((item) => ({
        id: item.id,
        // Dekripsi data menggunakan decryptText
        judul: decryptText(item.judul),
        deskripsi: item.deskripsi ? decryptText(item.deskripsi) : null,
        lokasi: item.lokasi ? decryptText(item.lokasi) : null,
        warna: item.warna,
        tanggal_mulai: item.tanggalMulai,
        tanggal_selesai: item.tanggalSelesai,
        user: {
          name: item.user.name,
        },
      })),
    });

    // 4. Set Header CORS sesuai izin
    // Kalau domain terdaftar, kita kasih izin spesifik. Kalau tidak, kita tetap kasih (karena ini API publik Blogger)
    // Tapi amannya kita pakai "*" saja kalau kamu mau ini bisa dipasang di mana saja
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return response;
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handler untuk Preflight Request (Penting buat Browser)
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
