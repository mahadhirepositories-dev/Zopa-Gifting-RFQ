import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqApprovalRecommendations, rfqApprovals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rfqId = resolvedParams.id;
    if (!rfqId) {
      return NextResponse.json({ error: "Missing RFQ ID" }, { status: 400 });
    }

    const body = await request.json();
    const { vendorResponseId, reason = "", approvalId: bodyApprovalId } = body;

    if (!vendorResponseId) {
      return NextResponse.json(
        { error: "vendorResponseId is required" },
        { status: 400 }
      );
    }

    let approvalId = bodyApprovalId;
    if (!approvalId) {
      const [latest] = await db
        .select()
        .from(rfqApprovals)
        .where(eq(rfqApprovals.rfqId, rfqId))
        .orderBy(desc(rfqApprovals.createdAt))
        .limit(1);
      if (latest) {
        approvalId = latest.id;
      }
    }

    const [recommendation] = await db
      .insert(rfqApprovalRecommendations)
      .values({
        rfqId,
        approvalId: approvalId || null,
        vendorResponseId,
        reason,
        status: "recommended",
        recommenderRole: "buyer",
      })
      .returning();

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
