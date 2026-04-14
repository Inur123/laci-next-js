import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  downloadBerkasPimpinanFile,
  getBerkasPimpinanById,
} from "@/app/actions/berkas-pimpinan-actions";
import { getOriginalExtension } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Get berkas info
    const berkas = await getBerkasPimpinanById(id);

    if (!berkas || !berkas.file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Download and decrypt file
    const decryptedBuffer = await downloadBerkasPimpinanFile(id);

    // Get original extension and construct new filename based on Nama
    const encryptedFilename = berkas.file.split("/").pop() || "";
    const extension = getOriginalExtension(encryptedFilename);

    // Sanitize Nama for filename
    const sanitizedNama = berkas.nama.replace(/[/\\?%*:|"<>]/g, "-");
    const downloadFilename = `${sanitizedNama}.${extension}`;

    // Map extension to content type
    const contentTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    const contentType =
      contentTypes[extension || ""] || "application/octet-stream";
    const isPreview = request.nextUrl.searchParams.get("preview") === "true";

    // Return decrypted file
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${downloadFilename}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
