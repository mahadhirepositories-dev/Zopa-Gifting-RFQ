/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentName = formData.get("documentName") as string | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    // Create date-based directory structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // Determine upload type (vendor-image, documents, or vendor-reply)
    const uploadType =
      type === "boq" ? "vendor-image" : documentName ? "documents" : "vendor-reply";

    // Create directory path under public/uploads/
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      String(year),
      month,
      day,
      uploadType
    );

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Get file extension
    const originalName = file.name;
    const fileExt = originalName.includes(".")
      ? originalName.split(".").pop()
      : "png";

    // Create a unique filename
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(uploadDir, fileName);

    // Convert the file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write the file to disk
    await writeFile(filePath, buffer);

    // Generate the public URL path
    const fileUrl = `/uploads/${year}/${month}/${day}/${uploadType}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      name: originalName,
      fileName: originalName,
      fileSize: file.size,
      fileType: file.type,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Error uploading file in vendor-upload API:", error);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
