import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    success: true,
    data: {
      vendorId: id,
      vendorName: "",
      companyName: "",
      email: "",
      totalRatings: 0,
      averageOverallRating: 5,
      averageResponseQualityRating: 5,
      averagePricingRating: 5,
      averageCommunicationRating: 5,
      averageDeliverySpeedRating: 5,
      recentRatings: [],
    },
  });
}
