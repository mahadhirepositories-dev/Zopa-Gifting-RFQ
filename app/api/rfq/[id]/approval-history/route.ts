import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqApprovals, rfqApprovalRecommendations, vendorResponses, vendorCompanyDetails, rfqs, users, rfqContacts, rfqContactsMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureApprovalTablesExist } from "@/lib/db-approval-init";

export async function GET(
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

    // Get latest approval record for this RFQ
    const [currentApprovalRecord] = await db
      .select()
      .from(rfqApprovals)
      .where(eq(rfqApprovals.rfqId, rfqId))
      .orderBy(desc(rfqApprovals.createdAt))
      .limit(1);

    // Fetch buyer email
    let buyerEmail = "Buyer";
    const [rfqRecord] = await db
      .select({ userId: rfqs.userId })
      .from(rfqs)
      .where(eq(rfqs.id, rfqId))
      .limit(1);

    if (rfqRecord?.userId) {
      const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, rfqRecord.userId)).limit(1);
      if (u?.email) buyerEmail = u.email;
    }
    if (buyerEmail === "Buyer") {
      const [member] = await db.select().from(rfqContactsMembers).where(eq(rfqContactsMembers.rfqId, rfqId)).limit(1);
      if (member?.rfqContactId) {
        const [c] = await db.select({ contactEmail: rfqContacts.contactEmail }).from(rfqContacts).where(eq(rfqContacts.id, member.rfqContactId)).limit(1);
        if (c?.contactEmail) buyerEmail = c.contactEmail;
      }
    }

    // Get recommendations
    const recommendationsRecords = await db
      .select()
      .from(rfqApprovalRecommendations)
      .where(eq(rfqApprovalRecommendations.rfqId, rfqId));

    // Enrich recommendations with company names if possible
    const enrichedRecommendations = await Promise.all(
      recommendationsRecords.map(async (rec) => {
        const [resp] = await db
          .select({
            id: vendorResponses.id,
            vendorResponseId: vendorResponses.vendorResponseId,
          })
          .from(vendorResponses)
          .where(eq(vendorResponses.vendorResponseId, rec.vendorResponseId))
          .limit(1);

        let companyName = "Recommended Vendor";
        if (resp) {
          const [details] = await db
            .select({ companyName: vendorCompanyDetails.companyName })
            .from(vendorCompanyDetails)
            .where(eq(vendorCompanyDetails.vendorResponseInternalId, resp.id))
            .limit(1);
          if (details?.companyName) {
            companyName = details.companyName;
          }
        }

        return {
          id: rec.id,
          rfpId: rec.rfqId,
          approvalId: rec.approvalId,
          vendorResponseId: rec.vendorResponseId,
          reason: rec.reason,
          status: rec.status,
          recommenderRole: rec.recommenderRole === "buyer" ? buyerEmail : rec.recommenderRole,
          createdAt: rec.createdAt,
          vendorResponse: {
            vendorResponseId: rec.vendorResponseId,
            companyDetails: {
              companyName,
            },
          },
        };
      })
    );

    // Deduplicate enriched recommendations by vendorResponseId
    const uniqueRecommendations = Array.from(
      new Map(
        enrichedRecommendations.map((rec) => [rec.vendorResponseId, rec])
      ).values()
    );

    let currentApproval = null;
    if (currentApprovalRecord) {
      currentApproval = {
        id: currentApprovalRecord.id,
        rfpId: currentApprovalRecord.rfqId,
        status: currentApprovalRecord.status,
        approvalLevel: currentApprovalRecord.approvalLevel,
        currentLevel: currentApprovalRecord.level1Status === "pending" ? 1 : (currentApprovalRecord.approvalLevel === "level2" ? 2 : 1),
        requiredLevels: currentApprovalRecord.approvalLevel === "level2" ? 2 : 1,
        level1ApproverEmail: currentApprovalRecord.level1ApproverEmail,
        level2ApproverEmail: currentApprovalRecord.level2ApproverEmail,
        level1Status: currentApprovalRecord.level1Status,
        level2Status: currentApprovalRecord.level2Status,
        buyerComments: currentApprovalRecord.buyerComments,
        level1Comments: currentApprovalRecord.level1Comments,
        level2Comments: currentApprovalRecord.level2Comments,
        level1ReviewedAt: currentApprovalRecord.level1ReviewedAt,
        level2ReviewedAt: currentApprovalRecord.level2ReviewedAt,
        createdAt: currentApprovalRecord.createdAt,
        updatedAt: currentApprovalRecord.updatedAt,
        requestedBy: buyerEmail, // Inject buyer email here!
      };
    }

    return NextResponse.json({
      currentApproval,
      recommendations: uniqueRecommendations,
      history: currentApprovalRecord ? [currentApproval] : [],
    });
  } catch (error) {
    console.error("Error fetching approval history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
