/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

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

    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
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
