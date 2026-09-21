import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqs, rfqApprovals, users, rfqContacts, rfqApprovalRecommendations } from "@/db/schema";
import { EmailService } from "@/lib/email/email-service";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const approvalIdStr = resolvedParams.id;
    const approvalId = parseInt(approvalIdStr, 10);

    const body = await request.json().catch(() => ({}));
    const { action = "approve", comments = "" } = body;

    // Fetch approval record by ID or rfqId
    let [approval] = isNaN(approvalId)
      ? []
      : await db.select().from(rfqApprovals).where(eq(rfqApprovals.id, approvalId)).limit(1);

    if (!approval) {
      // Try searching by rfqId
      const [byRfq] = await db
        .select()
        .from(rfqApprovals)
        .where(eq(rfqApprovals.rfqId, approvalIdStr))
        .limit(1);
      approval = byRfq;
    }

    if (!approval) {
      return NextResponse.json({ error: "Approval record not found" }, { status: 404 });
    }

    // Fetch RFQ record
    const [existingRfq] = await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.id, approval.rfqId))
      .limit(1);

    if (!existingRfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    // Stop permanently if already approved or rejected
    if (action === "approve" && (existingRfq.status === "Approved" || existingRfq.status === "approved")) {
      return NextResponse.json({
        success: true,
        alreadyApproved: true,
        message: "RFQ recommendation is already approved.",
        rfqStatus: "Approved",
      });
    }

    if (action === "reject" && (existingRfq.status === "Rejected" || existingRfq.status === "rejected")) {
      return NextResponse.json({
        success: true,
        alreadyRejected: true,
        message: "RFQ recommendation is already rejected.",
        rfqStatus: "Rejected",
      });
    }

    const now = new Date();
    let approvalStatusVal = "approved";
    let rfqStatusVal = "Approved";
    
    let isL1ApprovingL2Workflow = false;

    if (action === "reject") {
      approvalStatusVal = "rejected";
      rfqStatusVal = "Rejected";
    } else if (action === "request-revision" || action === "requote") {
      approvalStatusVal = "revision_requested";
      rfqStatusVal = "Re-quote Requested";
    } else if (action === "approve") {
      if (approval.approvalLevel === "level2" && approval.level1Status === "pending") {
        isL1ApprovingL2Workflow = true;
        approvalStatusVal = "pending_approval"; // Still pending overall
        rfqStatusVal = "pending_approval";
      }
    }

    const updateData: any = {
      updatedAt: now,
    };
    
    if (approval.approvalLevel === "level2" && approval.level1Status === "approved" && !isL1ApprovingL2Workflow) {
      // This is L2 approver acting
      updateData.status = approvalStatusVal;
      updateData.level2Status = action === "approve" ? "approved" : (action === "reject" ? "rejected" : "revision_requested");
      updateData.level2ReviewedAt = now;
      updateData.level2Comments = comments || approval.level2Comments || `Action: ${action}`;
    } else {
      // This is L1 approver acting (or it's a 1-level workflow)
      updateData.status = approvalStatusVal;
      updateData.level1Status = action === "approve" ? "approved" : (action === "reject" ? "rejected" : "revision_requested");
      updateData.level1ReviewedAt = now;
      updateData.level1Comments = comments || approval.level1Comments || `Action: ${action}`;
    }

    // Update approval record
    await db
      .update(rfqApprovals)
      .set(updateData)
      .where(eq(rfqApprovals.id, approval.id));

    // Update RFQ status
    await db
      .update(rfqs)
      .set({
        status: rfqStatusVal,
        updatedAt: now,
      })
      .where(eq(rfqs.id, approval.rfqId));

    if (isL1ApprovingL2Workflow && approval.level2ApproverEmail) {
      // Send email to Level 2 approver
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      let responseId = body.selectedVendor;
      if (!responseId) {
        const [rec] = await db
          .select()
          .from(rfqApprovalRecommendations)
          .where(eq(rfqApprovalRecommendations.approvalId, approval.id))
          .limit(1);
        if (rec) responseId = rec.vendorResponseId;
      }
      
      const approvalUrl = responseId 
        ? `${baseUrl}/rfq/buyer_preview/${approval.rfqId}?response=${responseId}`
        : `${baseUrl}/rfq/buyer_preview/${approval.rfqId}`;

      try {
        await EmailService.sendApprovalRequestEmail({
          approverEmail: approval.level2ApproverEmail,
          rfqId: approval.rfqId,
          approvalUrl,
          projectName: existingRfq.title || "Gifting Project",
          buyerComments: comments,
          recommendedVendors: body.selectedVendors || [],
          approvalLevel: "Level 2",
        });
      } catch (emailErr) {
        console.error("Failed to send Level 2 approval email:", emailErr);
      }

      return NextResponse.json({
        success: true,
        message: `Level 1 approved. Approval request sent to Level 2 approver.`,
        rfqStatus: rfqStatusVal,
      });
    }

    // Determine buyer email for notification
    let buyerEmail = body.buyerEmail || body.email;
    if (!buyerEmail && existingRfq.userId) {
      const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, existingRfq.userId)).limit(1);
      if (u?.email) buyerEmail = u.email;
    }

    if (!buyerEmail) {
      const [c] = await db.select().from(rfqContacts).limit(1);
      if (c?.contactEmail) buyerEmail = c.contactEmail;
    }

    if (!buyerEmail) {
      buyerEmail = process.env.ADMIN_EMAIL_TO || "buyer@zopapro.com";
    }

    console.log(`[Approval API] Triggering decision email (${rfqStatusVal}) to buyer: ${buyerEmail}`);

    // Send decision notification email to buyer
    try {
      if (action === "request-revision" || action === "requote") {
        await EmailService.sendRevisionRequestEmail({
          buyerEmail,
          rfqId: approval.rfqId,
          projectName: existingRfq.title,
          comments,
        });
      } else {
        await EmailService.sendApprovalDecisionEmail({
          buyerEmail,
          rfqId: approval.rfqId,
          status: rfqStatusVal,
          projectName: existingRfq.title,
          comments,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send buyer notification email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: `RFQ status updated to ${rfqStatusVal} successfully`,
      rfqStatus: rfqStatusVal,
    });
  } catch (error) {
    console.error("Error in /api/approvals/[id]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context);
}
