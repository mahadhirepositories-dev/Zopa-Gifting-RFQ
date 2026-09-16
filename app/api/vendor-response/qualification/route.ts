/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendorResponses } from "@/db/schema/vendor-response-schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorResponseId, qualificationStatus } = body;

    if (!vendorResponseId || !qualificationStatus) {
      return NextResponse.json(
        { error: "vendorResponseId and qualificationStatus are required" },
        { status: 400 }
      );
    }

    // Dynamically ensure qualification_status column exists in vendor_responses table
    try {
      await db.execute(
        sql`ALTER TABLE vendor_responses ADD COLUMN IF NOT EXISTS qualification_status text DEFAULT 'qualified';`
      );
    } catch (e) {
      console.warn("Column migration check warning:", e);
    }

    // Update qualificationStatus
    await db
      .update(vendorResponses)
      .set({
        qualificationStatus: qualificationStatus,
        updatedAt: new Date(),
      })
      .where(eq(vendorResponses.vendorResponseId, vendorResponseId));

    return NextResponse.json({
      success: true,
      message: `Vendor ${qualificationStatus} successfully`,
      vendorResponseId,
      qualificationStatus,
    });
  } catch (error: any) {
    console.error("Error updating qualification status:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update qualification status" },
      { status: 500 }
    );
  }
}
