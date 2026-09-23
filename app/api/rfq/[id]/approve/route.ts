import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqs, rfqApprovals, users, rfqContacts } from "@/db/schema";
import { EmailService } from "@/lib/email/email-service";
import { eq, desc } from "drizzle-orm";
import { ensureApprovalTablesExist } from "@/lib/db-approval-init";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureApprovalTablesExist();
    const resolvedParams = await params;
    const rfqId = resolvedParams.id;
    if (!rfqId) {
      return NextResponse.json({ error: "Missing RFQ ID" }, { status: 400 });
    }

    let comments = "";
    let approverEmail = "";
    let action = "approve";
    let requestBody: any = {};
    try {
      requestBody = await request.json();
      comments = requestBody.comments || requestBody.reason || "";
      approverEmail = requestBody.approverEmail || requestBody.email || "";
      if (requestBody.action) action = requestBody.action;
    } catch {
      // Body may be empty or optional
    }

    // 1. Fetch current RFQ record
    const [existingRfq] = await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.id, rfqId))
      .limit(1);

    if (!existingRfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    // Prevent duplicate approval/rejection or repeated status updates after completion
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

    let approvalStatusVal = "approved";
    let rfqStatusVal = "Approved";

    if (action === "reject") {
      approvalStatusVal = "rejected";
      rfqStatusVal = "Rejected";
    } else if (action === "request-revision" || action === "requote") {
      approvalStatusVal = "revision_requested";
      rfqStatusVal = "Re-quote Requested";
    }

    // 2. Fetch latest approval record
    const [latestApproval] = await db
      .select()
      .from(rfqApprovals)
      .where(eq(rfqApprovals.rfqId, rfqId))
      .orderBy(desc(rfqApprovals.createdAt))
      .limit(1);

    const now = new Date();
    
    let isL1ApprovingL2Workflow = false;
    if (action === "approve" && latestApproval?.approvalLevel === "level2" && latestApproval?.level1Status === "pending") {
      isL1ApprovingL2Workflow = true;
      approvalStatusVal = "pending_approval";
      rfqStatusVal = "pending_approval";
    }

    if (latestApproval) {
      const updateData: any = {
        updatedAt: now,
      };
      
      if (latestApproval.approvalLevel === "level2" && latestApproval.level1Status === "approved" && !isL1ApprovingL2Workflow) {
        updateData.status = approvalStatusVal;
        updateData.level2Status = action === "approve" ? "approved" : (action === "reject" ? "rejected" : "revision_requested");
        updateData.level2ReviewedAt = now;
        updateData.level2Comments = comments || latestApproval.level2Comments || `Action: ${action}`;
      } else {
        updateData.status = approvalStatusVal;
        updateData.level1Status = action === "approve" ? "approved" : (action === "reject" ? "rejected" : "revision_requested");
        updateData.level1ReviewedAt = now;
        updateData.level1Comments = comments || latestApproval.level1Comments || `Action: ${action}`;
      }

      await db
        .update(rfqApprovals)
        .set(updateData)
        .where(eq(rfqApprovals.id, latestApproval.id));
    } else {
      await db.insert(rfqApprovals).values({
        rfqId,
        status: approvalStatusVal,
        approvalLevel: "level1",
        level1Status: approvalStatusVal,
        level1ReviewedAt: now,
        level1Comments: comments || `Action: ${action}`,
        level1ApproverEmail: approverEmail || "approver@zopapro.com",
      });
    }

    // 3. Update RFQ status in database
    await db
      .update(rfqs)
      .set({
        status: rfqStatusVal,
        updatedAt: now,
      })
      .where(eq(rfqs.id, rfqId));

    // Determine buyer email for notification
    let buyerEmail = requestBody.buyerEmail || requestBody.email;
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

    console.log(`[RFQ Approval API] Triggering decision email (${rfqStatusVal}) to buyer: ${buyerEmail}`);

    // Send email to buyer
    try {
      if (isL1ApprovingL2Workflow) {
        // Only L1 approved so far, do not send final buyer decision email
        console.log(`[RFQ Approval API] Skipping buyer decision email because Level 2 is still pending.`);
      } else if (action === "request-revision" || action === "requote") {
        await EmailService.sendRevisionRequestEmail({
          buyerEmail,
          rfqId,
          projectName: existingRfq.title,
          comments,
        });
      } else {
        await EmailService.sendApprovalDecisionEmail({
          buyerEmail,
          rfqId,
          status: rfqStatusVal,
          projectName: existingRfq.title,
          comments,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send buyer decision email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      alreadyApproved: false,
      message: `RFQ status updated to ${rfqStatusVal} successfully.`,
      rfqStatus: rfqStatusVal,
    });
  } catch (error) {
    console.error("Error processing RFQ decision:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
