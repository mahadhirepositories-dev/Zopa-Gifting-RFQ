/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
    const res = await fetch(`${baseUrl}/api/vendor-response?responseId=${id}`);

    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        return NextResponse.json({
          vendorResponse: data.data,
          buyerData: null,
        });
      }
    }

    return NextResponse.json(
      { error: "Vendor response not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in vendor-reply-response route:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor response" },
      { status: 500 }
    );
  }
}
