/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  rfqs,
  rfqRequirements,
  rfqCategories,
  rfqCompanies,
  rfqVendorContacts,
  vendorResponses,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view your dashboard." },
        { status: 401 },
      );
    }

    // Fetch all RFQs belonging to this user
    const userRfqs = await db
      .select({
        id: rfqs.id,
        title: rfqs.title,
        category: rfqs.category,
        quantity: rfqs.quantity,
        status: rfqs.status,
        createdAt: rfqs.createdAt,
        updatedAt: rfqs.updatedAt,
        projectName: rfqRequirements.projectName,
        purpose: rfqRequirements.purpose,
        companyName: rfqCompanies.name,
      })
      .from(rfqs)
      .leftJoin(rfqRequirements, eq(rfqRequirements.rfqId, rfqs.id))
      .leftJoin(rfqCompanies, eq(rfqCompanies.rfqId, rfqs.id))
      .where(eq(rfqs.userId, user.id))
      .orderBy(desc(rfqs.createdAt));

    // Get counts of vendor contacts and responses for each RFQ
    const rfqIds = userRfqs.map((r) => r.id);

    let vendorCountsMap: Record<string, number> = {};
    let responseCountsMap: Record<string, number> = {};

    if (rfqIds.length > 0) {
      try {
        const vendorCountRows = await db
          .select({
            rfqId: rfqVendorContacts.rfqId,
            count: sql<number>`count(*)::int`,
          })
          .from(rfqVendorContacts)
          .where(sql`${rfqVendorContacts.rfqId} IN ${rfqIds}`)
          .groupBy(rfqVendorContacts.rfqId);

        vendorCountRows.forEach((row) => {
          vendorCountsMap[row.rfqId] = row.count;
        });

        // Also check vendor_responses count for total invited vendors as fallback
        const allVendorResponsesRows = await db
          .select({
            rfpId: vendorResponses.rfpId,
            count: sql<number>`count(*)::int`,
          })
          .from(vendorResponses)
          .where(sql`${vendorResponses.rfpId} IN ${rfqIds}`)
          .groupBy(vendorResponses.rfpId);

        allVendorResponsesRows.forEach((row) => {
          vendorCountsMap[row.rfpId] = Math.max(
            vendorCountsMap[row.rfpId] || 0,
            row.count
          );
        });
      } catch (err) {
        console.warn("Could not query vendor counts:", err);
      }

      try {
        // Only count actual submitted quotes from vendors, ignoring initial draft invite records
        const responseCountRows = await db
          .select({
            rfpId: vendorResponses.rfpId,
            count: sql<number>`count(*)::int`,
          })
          .from(vendorResponses)
          .where(
            and(
              sql`${vendorResponses.rfpId} IN ${rfqIds}`,
              sql`LOWER(COALESCE(${vendorResponses.status}, 'draft')) != 'draft'`
            )
          )
          .groupBy(vendorResponses.rfpId);

        responseCountRows.forEach((row) => {
          responseCountsMap[row.rfpId] = row.count;
        });
      } catch (err) {
        console.warn("Could not query response counts:", err);
      }
    }

    const formattedRfqs = userRfqs.map((rfq) => {
      const formattedRfpUniqueId = rfq.id.startsWith("RFP-")
        ? rfq.id
        : `RFP-${rfq.id.substring(0, 8).toUpperCase()}`;

      return {
        id: rfq.id,
        rfpUniqueId: formattedRfpUniqueId,
        title: rfq.projectName || rfq.title || "Corporate Gifting RFQ",
        purpose: rfq.purpose || "",
        category: rfq.category || "Gifting Items",
        quantity: rfq.quantity,
        status: rfq.status || "draft",
        companyName: rfq.companyName || user.companyName || "",
        createdAt: rfq.createdAt,
        updatedAt: rfq.updatedAt,
        vendorsCount: vendorCountsMap[rfq.id] || 0,
        responsesCount: responseCountsMap[rfq.id] || 0,
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
      },
      rfqs: formattedRfqs,
    });
  } catch (error: any) {
    console.error("Error fetching buyer RFQs:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch RFQs." },
      { status: 500 },
    );
  }
}
