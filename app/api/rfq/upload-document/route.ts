import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save inside /public/uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const originalName = file.name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = join(uploadsDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      name: originalName,
      fileName: uniqueFileName,
      url: fileUrl,
      path: fileUrl,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Error in /api/rfq/upload-document:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload document file." },
      { status: 500 }
    );
  }
}
