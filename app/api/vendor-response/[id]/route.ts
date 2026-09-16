/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vendorResponses,
  vendorCompanyDetails,
  vendorResponseRevisions,
} from "@/db/schema/vendor-response-schema";
import { rfqs } from "@/db/schema/rfp-create";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendorResponseData = await db.query.vendorResponses.findFirst({
      where: isNaN(Number(id))
        ? eq(vendorResponses.vendorResponseId, id)
        : eq(vendorResponses.id, Number(id)),
      with: {
        revisions: {
          orderBy: [desc(vendorResponseRevisions.revisionNumber)],
        },
        companyDetails: true,
      },
    });

    if (!vendorResponseData) {
      return NextResponse.json(
        { error: "Vendor response not found" },
        { status: 404 }
      );
    }

    const rfpData = await db.query.rfqs.findFirst({
      where: eq(rfqs.id, vendorResponseData.rfpId),
    });

    const currentRev =
      vendorResponseData.revisions.find((r) => r.isCurrent) ||
      vendorResponseData.revisions[0];

    return NextResponse.json({
      vendorResponse: {
        ...vendorResponseData,
        companyInfo: vendorResponseData.companyDetails,
        ...currentRev,
      },
      buyerData: rfpData,
    });
  } catch (error) {
    console.error("Error retrieving vendor response:", error);
    return NextResponse.json(
      { error: "Failed to retrieve vendor response" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingResponse = await db.query.vendorResponses.findFirst({
      where: isNaN(Number(id))
        ? eq(vendorResponses.vendorResponseId, id)
        : eq(vendorResponses.id, Number(id)),
      with: {
        revisions: {
          orderBy: [desc(vendorResponseRevisions.revisionNumber)],
        },
      },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "Vendor response not found" },
        { status: 404 }
      );
    }

    const internalId = existingResponse.id;
    const status = body.status || "submitted";

    // 1. Update status
    await db
      .update(vendorResponses)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(vendorResponses.id, internalId));

    // 2. Upsert company details
    const companyData = body.companyInfo || body.companydetails || {};
    const existingCompanyDetails = await db.query.vendorCompanyDetails.findFirst(
      {
        where: eq(vendorCompanyDetails.vendorResponseInternalId, internalId),
      }
    );

    const formattedCompanyDetails = {
      vendorResponseInternalId: internalId,
      companyName: companyData.companyName || "",
      addressLine1: companyData.addressLine1 || "Address 1",
      addressLine2: companyData.addressLine2 || "",
      city: companyData.city || "Unknown",
      state: companyData.state || "Unknown",
      postalCode: companyData.postalCode || "000000",
      country: companyData.country || "India",
      phone: companyData.phone || "0000000000",
      email: companyData.email || existingResponse.vendorEmail,
      businessType: companyData.businessType || "General",
      logoUrl: companyData.logoUrl || body.logoUrl || null,
      updatedAt: new Date(),
    };

    if (existingCompanyDetails) {
      await db
        .update(vendorCompanyDetails)
        .set(formattedCompanyDetails)
        .where(eq(vendorCompanyDetails.id, existingCompanyDetails.id));
    } else {
      await db.insert(vendorCompanyDetails).values(formattedCompanyDetails);
    }

    // 3. Create new revision
    const nextRevNum =
      existingResponse.revisions.length > 0
        ? existingResponse.revisions[0].revisionNumber + 1
        : 0;

    await db
      .update(vendorResponseRevisions)
      .set({ isCurrent: false })
      .where(
        eq(vendorResponseRevisions.vendorResponseInternalId, internalId)
      );

    const newRevision = {
      vendorResponseInternalId: internalId,
      revisionNumber: nextRevNum,
      isCurrent: true,
      scopeOfWork: body.scopeOfWork || { agreement: body.scopeAgreement || "agree", remarks: body.scopeRemarks || "" },
      boqDetails: body.boqDetails || body.boqQuotes || [],
      evaluationCriteria: body.evaluation || body.evalCompliance || [],
      financialTerms: body.financialTerms || { remarks: body.paymentRemarks || "" },
      generalTerms: body.generalTerms || { agreement: body.generalAgreement || "agree", remarks: body.generalRemarks || "" },
      specialTerms: body.specialTerms || { agreement: body.specialAgreement || "agree", remarks: body.specialRemarks || "" },
      buyerNotes: body.buyerNotes || { note: body.specialNote || "" },
      otherInformation: body.otherInformation || { grandTotal: body.grandTotal || "0.00" },
      attachments: body.attachments || [],
      updatedAt: new Date(),
    };

    await db.insert(vendorResponseRevisions).values(newRevision);

    return NextResponse.json({
      success: true,
      message: "Vendor response updated successfully.",
      vendorResponseId: existingResponse.vendorResponseId,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/vendor-response/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update vendor response" },
      { status: 500 }
    );
  }
}
