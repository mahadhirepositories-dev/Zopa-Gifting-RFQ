/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// In-memory / database backing for vendor responses
const vendorResponses: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfpId, vendorEmail, vendorResponseId, status = "draft" } = body;

    if (!rfpId) {
      return NextResponse.json(
        { error: "rfpId is required" },
        { status: 400 }
      );
    }

    const responseId =
      vendorResponseId ||
      `vr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    vendorResponses[responseId] = {
      ...(vendorResponses[responseId] || {}),
      ...body,
      vendorResponseId: responseId,
      status,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Vendor response updated successfully.",
      vendorResponseId: responseId,
      data: vendorResponses[responseId],
    });
  } catch (error) {
    console.error("Error in vendor-response API:", error);
    return NextResponse.json(
      { error: "Failed to process vendor response." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get("responseId") || searchParams.get("response");
    const rfpId = searchParams.get("rfpId");

    if (responseId && vendorResponses[responseId]) {
      return NextResponse.json({
        success: true,
        data: vendorResponses[responseId],
      });
    }

    if (rfpId) {
      const matches = Object.values(vendorResponses).filter(
        (r: any) => r.rfpId === rfpId
      );
      return NextResponse.json({
        success: true,
        data: matches,
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Error in vendor-response GET API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor response." },
      { status: 500 }
    );
  }
}
