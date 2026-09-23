import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rfqVendorContacts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, rfpId, emailSent, whatsappSent } = body;

    if (!rfpId || !email) {
      return NextResponse.json(
        { error: "rfpId and email are required" },
        { status: 400 },
      );
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (emailSent !== undefined) {
      updates.email_sent = Boolean(emailSent);
    }
    if (whatsappSent !== undefined) {
      updates.whatsapp_sent = Boolean(whatsappSent);
    }

    await db
      .update(rfqVendorContacts)
      .set(updates)
      .where(
        and(
          eq(rfqVendorContacts.rfqId, rfpId),
          sql`LOWER(${rfqVendorContacts.email}) = LOWER(${String(email).trim()})`,
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating vendor email status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update vendor email status" },
      { status: 500 },
    );
  }
}
