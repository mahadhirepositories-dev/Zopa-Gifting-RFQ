/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vendorResponses,
  vendorCompanyDetails,
  vendorResponseRevisions,
} from "@/db/schema/vendor-response-schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rfpId,
      vendorResponseId: requestedResponseId,
      vendorId = "vendor_default",
      vendorEmail: inputVendorEmail,
      status = "submitted",
      companyInfo,
      companydetails,
      scopeAgreement,
      scopeRemarks,
      boqQuotes,
      evalCompliance,
      paymentRemarks,
      generalAgreement,
      generalRemarks,
      specialAgreement,
      specialRemarks,
      specialNote,
      attachments = [],
      grandTotal,
    } = body;

    if (!rfpId) {
      return NextResponse.json(
        { error: "rfpId is required" },
        { status: 400 }
      );
    }

    const companyData = companyInfo || companydetails || {};
    const email = inputVendorEmail || companyData.email || "vendor@example.com";

    // 1. Check if vendor response already exists by responseId OR by rfpId
    let existingResponse = null;
    if (requestedResponseId) {
      existingResponse = await db.query.vendorResponses.findFirst({
        where: eq(vendorResponses.vendorResponseId, requestedResponseId),
      });
    }

    if (!existingResponse && rfpId) {
      existingResponse = await db.query.vendorResponses.findFirst({
        where: eq(vendorResponses.rfpId, rfpId),
      });
    }

    let internalId: number;
    let actualVendorResponseId: string;

    if (existingResponse) {
      internalId = existingResponse.id;
      actualVendorResponseId = existingResponse.vendorResponseId;
      await db
        .update(vendorResponses)
        .set({
          status,
          vendorEmail: email,
          updatedAt: new Date(),
        })
        .where(eq(vendorResponses.id, internalId));
    } else {
      actualVendorResponseId =
        requestedResponseId ||
        `VR-${Math.floor(1000 + Math.random() * 9000)}`;

      const [inserted] = await db
        .insert(vendorResponses)
        .values({
          vendorResponseId: actualVendorResponseId,
          rfpId,
          vendorId: String(vendorId),
          vendorEmail: email,
          status,
        })
        .returning();
      internalId = inserted.id;
    }

    // 2. Upsert Vendor Company Details
    const existingCompanyDetails = await db.query.vendorCompanyDetails.findFirst({
      where: eq(vendorCompanyDetails.vendorResponseInternalId, internalId),
    });

    const formattedCompanyDetails = {
      vendorResponseInternalId: internalId,
      companyName: companyData.companyName || "Unknown Company",
      addressLine1: companyData.addressLine1 || "Address 1",
      addressLine2: companyData.addressLine2 || "",
      city: companyData.city || "Unknown",
      state: companyData.state || "Unknown",
      postalCode: companyData.postalCode || "000000",
      country: companyData.country || "India",
      phone: companyData.phone || "0000000000",
      email: companyData.email || email,
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

    // 3. Insert Revision Record (Always increment max revision if previous status was submitted)
    const revisions = await db.query.vendorResponseRevisions.findMany({
      where: eq(
        vendorResponseRevisions.vendorResponseInternalId,
        internalId
      ),
      orderBy: [desc(vendorResponseRevisions.revisionNumber)],
    });

    let nextRevNum = 0;
    if (revisions.length > 0) {
      const maxRevNum = Math.max(...revisions.map((r) => r.revisionNumber));
      if (existingResponse?.status === "submitted" || status === "submitted") {
        nextRevNum = maxRevNum + 1;
      } else {
        nextRevNum = maxRevNum;
      }
    }

    // Mark previous revisions as not current
    await db
      .update(vendorResponseRevisions)
      .set({ isCurrent: false })
      .where(
        eq(
          vendorResponseRevisions.vendorResponseInternalId,
          internalId
        )
      );

    const revisionData = {
      vendorResponseInternalId: internalId,
      revisionNumber: nextRevNum,
      isCurrent: true,
      scopeOfWork: { agreement: scopeAgreement || "agree", remarks: scopeRemarks || "" },
      boqDetails: boqQuotes || body.boqDetails || [],
      evaluationCriteria: evalCompliance || body.evaluation || [],
      financialTerms: { remarks: paymentRemarks || "" },
      generalTerms: { agreement: generalAgreement || "agree", remarks: generalRemarks || "" },
      specialTerms: { agreement: specialAgreement || "agree", remarks: specialRemarks || "" },
      buyerNotes: { note: specialNote || "" },
      otherInformation: { grandTotal: grandTotal || "0.00" },
      attachments: attachments || [],
      updatedAt: new Date(),
    };

    await db.insert(vendorResponseRevisions).values(revisionData);

    return NextResponse.json({
      success: true,
      message: "Vendor response stored in database successfully.",
      vendorResponseId: actualVendorResponseId,
      revisionNumber: nextRevNum,
      data: {
        id: internalId,
        vendorResponseId: actualVendorResponseId,
        rfpId,
        status,
        revisionNumber: nextRevNum,
        companyInfo: formattedCompanyDetails,
        boqQuotes,
        grandTotal,
      },
    });
  } catch (error: any) {
    console.error("Error saving vendor response to DB:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process vendor response." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId =
      searchParams.get("responseId") || searchParams.get("response");
    const rfpId = searchParams.get("rfpId");
    const revParam = searchParams.get("revision") || searchParams.get("rev");

    let response = null;

    if (responseId) {
      response = await db.query.vendorResponses.findFirst({
        where: eq(vendorResponses.vendorResponseId, responseId),
        with: {
          companyDetails: true,
          revisions: {
            orderBy: [desc(vendorResponseRevisions.revisionNumber)],
          },
        },
      });
    }

    if (!response && rfpId) {
      response = await db.query.vendorResponses.findFirst({
        where: eq(vendorResponses.rfpId, rfpId),
        with: {
          companyDetails: true,
          revisions: {
            orderBy: [desc(vendorResponseRevisions.revisionNumber)],
          },
        },
      });
    }

    if (response) {
      let selectedRev = response.revisions.find((r) => r.isCurrent) || response.revisions[0];
      if (revParam !== null && revParam !== undefined && revParam !== "") {
        const revNum = parseInt(revParam, 10);
        const found = response.revisions.find((r) => r.revisionNumber === revNum);
        if (found) selectedRev = found;
      }

      const latestRevNum = response.revisions.length > 0
        ? Math.max(...response.revisions.map((r) => r.revisionNumber))
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          ...response,
          vendorResponseId: response.vendorResponseId,
          companyInfo: response.companyDetails,
          companyDetails: response.companyDetails,
          revisionNumber: selectedRev?.revisionNumber ?? 0,
          latestRevisionNumber: latestRevNum,
          boqQuotes: selectedRev?.boqDetails || {},
          evalCompliance: selectedRev?.evaluationCriteria || [],
          scopeAgreement: (selectedRev?.scopeOfWork as any)?.agreement || "agree",
          scopeRemarks: (selectedRev?.scopeOfWork as any)?.remarks || "",
          paymentRemarks: (selectedRev?.financialTerms as any)?.remarks || "",
          generalAgreement: (selectedRev?.generalTerms as any)?.agreement || "agree",
          generalRemarks: (selectedRev?.generalTerms as any)?.remarks || "",
          specialAgreement: (selectedRev?.specialTerms as any)?.agreement || "agree",
          specialRemarks: (selectedRev?.specialTerms as any)?.remarks || "",
          specialNote: (selectedRev?.buyerNotes as any)?.note || "",
          otherInformation: (selectedRev?.otherInformation as any) || {},
          grandTotal: (selectedRev?.otherInformation as any)?.grandTotal || "0.00",
          status: response.status,
          revisions: response.revisions.map((r) => ({
            id: r.id,
            revisionNumber: r.revisionNumber,
            isCurrent: r.isCurrent,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            grandTotal: (r.otherInformation as any)?.grandTotal || "0.00",
          })),
        },
      });
    }

    if (rfpId) {
      const responses = await db.query.vendorResponses.findMany({
        where: eq(vendorResponses.rfpId, rfpId),
        with: {
          companyDetails: true,
          revisions: {
            orderBy: [desc(vendorResponseRevisions.revisionNumber)],
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: responses,
      });
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error: any) {
    console.error("Error in vendor-response GET API:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor response." },
      { status: 500 }
    );
  }
}
