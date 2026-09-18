import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Query /api/vendor-response internally
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
    const res = await fetch(`${baseUrl}/api/vendor-response?responseId=${id}`);
    
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.companyInfo?.email || data?.data?.vendorEmail) {
        return NextResponse.json({
          email: data.data.companyInfo?.email || data.data.vendorEmail,
          vendorResponseId: id,
        });
      }
    }

    return NextResponse.json({
      email: null,
      vendorResponseId: id,
    });
  } catch (error) {
    console.error("Error in get-email route:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor email" },
      { status: 500 }
    );
  }
}
