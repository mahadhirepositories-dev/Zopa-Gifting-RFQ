import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams.path || [];
    if (pathParts.length === 0) {
      return NextResponse.json({ error: "File path not specified" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "public", "uploads", ...pathParts);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const fileName = pathParts[pathParts.length - 1] || "";
    const ext = fileName.toLowerCase().split(".").pop() || "";

    let contentType = "application/octet-stream";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "svg") contentType = "image/svg+xml";
    else if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "doc") contentType = "application/msword";
    else if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === "xls") contentType = "application/vnd.ms-excel";
    else if (ext === "xlsx") contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else if (ext === "csv") contentType = "text/csv";
    else if (ext === "txt") contentType = "text/plain";
    else if (ext === "zip") contentType = "application/zip";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
