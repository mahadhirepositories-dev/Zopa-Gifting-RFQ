/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boqItemRef = searchParams.get("boqItemRef");

    if (!boqItemRef) {
      return NextResponse.json(
        { error: "boqItemRef is required." },
        { status: 400 },
      );
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error fetching BOQ attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const boqItemRef = formData.get("boqItemRef") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 },
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "images");
    await mkdir(uploadDir, { recursive: true });

    const timePrefix = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timePrefix}-${safeFileName}`;
    const filePath = join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/images/${fileName}`;
    const attachment = {
      id: Math.floor(Date.now() + Math.random() * 1000),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl,
      boqItemRef: boqItemRef || "",
    };

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading BOQ attachment:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload attachment." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Attachment ID is required." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, message: "Attachment deleted." });
  } catch (error: any) {
    console.error("Error deleting BOQ attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment." },
      { status: 500 },
    );
  }
}
