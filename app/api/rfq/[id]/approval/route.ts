import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqs, rfqApprovals, rfqApprovalRecommendations } from "@/db/schema";
import { EmailService } from "@/lib/email/email-service";
import { eq } from "drizzle-orm";

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
    const {
      comments,
      approvalLevel = "level1",
      level1ApproverEmail,
      level2ApproverEmail,
      recommendedVendors = [],
    } = body;

    if (!level1ApproverEmail) {
      return NextResponse.json(
        { error: "Level 1 approver email is required" },
        { status: 400 }
      );
    }

    // Fetch existing RFQ details
    const [existingRfq] = await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.id, rfqId))
      .limit(1);

    if (!existingRfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    // Insert new approval record
    const [newApproval] = await db
      .insert(rfqApprovals)
      .values({
        rfqId,
        status: "pending_approval",
        approvalLevel,
        level1ApproverEmail,
        level2ApproverEmail: level2ApproverEmail || null,
        level1Status: "pending",
        level2Status: "pending",
        buyerComments: comments || "",
      })
      .returning();

    // Insert recommendations if provided
    if (Array.isArray(recommendedVendors) && recommendedVendors.length > 0) {
      for (const rec of recommendedVendors) {
        if (rec.vendorResponseId) {
          await db.insert(rfqApprovalRecommendations).values({
            rfqId,
            approvalId: newApproval.id,
            vendorResponseId: rec.vendorResponseId,
            reason: rec.reason || rec.remarks || "",
            status: "recommended",
            recommenderRole: "buyer",
          });
        }
      }
    }

    // Update RFQ status to pending_approval
    await db
      .update(rfqs)
      .set({
        status: "pending_approval",
        updatedAt: new Date(),
      })
      .where(eq(rfqs.id, rfqId));

    // Determine first vendor response ID for email deep link
    const firstResponseId =
      recommendedVendors.length > 0 && recommendedVendors[0].vendorResponseId
        ? recommendedVendors[0].vendorResponseId
        : "VR-8357";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const approvalUrl = `${baseUrl}/rfq/buyer_preview/${rfqId}?response=${firstResponseId}`;

    // Send email to Level 1 approver
    try {
      await EmailService.sendApprovalRequestEmail({
        approverEmail: level1ApproverEmail,
        rfqId,
        approvalUrl,
        projectName: existingRfq.title || "Gifting Project",
        buyerComments: comments,
        recommendedVendors,
        approvalLevel: "Level 1",
      });
    } catch (emailErr) {
      console.error("Failed to send approval email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      approval: newApproval,
      approvalUrl,
    });
  } catch (error) {
    console.error("Error creating approval cycle:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
