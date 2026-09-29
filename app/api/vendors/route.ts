/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { giftingVendors } from "@/db/schema/gifting-vendor-schema";
import { rfqVendorContacts } from "@/db/schema/rfp-create";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Look in gifting_vendors
      const [vendor] = await db
        .select()
        .from(giftingVendors)
        .where(sql`LOWER(${giftingVendors.email}) = LOWER(${cleanEmail})`)
        .limit(1);

      if (vendor) {
        return NextResponse.json({
          id: String(vendor.id),
          name: vendor.name || vendor.companyName,
          email: vendor.email,
          companyName: vendor.companyName,
          mobileNo: vendor.mobileNo || "",
          category: vendor.category || "Gifting Items",
          isFromMaster: true,
          masterVendorId: String(vendor.id),
        });
      }

      // 2. Look in rfq_vendor_contacts
      const [contact] = await db
        .select()
        .from(rfqVendorContacts)
        .where(sql`LOWER(${rfqVendorContacts.email}) = LOWER(${cleanEmail})`)
        .limit(1);

      if (contact) {
        return NextResponse.json({
          id: String(contact.id),
          name: contact.name,
          email: contact.email,
          companyName: contact.companyName,
          mobileNo: contact.mobileNo,
          category: "Gifting Items",
          isFromMaster: false,
          masterVendorId: null,
        });
      }

      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Default list response if no email query
    const allVendors = await db.select().from(giftingVendors);
    return NextResponse.json(
      allVendors.map((v) => ({
        id: String(v.id),
        name: v.name || v.companyName,
        email: v.email,
        companyName: v.companyName,
        mobileNo: v.mobileNo || "",
        category: v.category || "Gifting Items",
        rating: v.rating ?? 5,
        status: v.status || "active",
      }))
    );
  } catch (error: any) {
    console.error("Error in /api/vendors GET:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if already in gifting_vendors
    const [existing] = await db
      .select()
      .from(giftingVendors)
      .where(sql`LOWER(${giftingVendors.email}) = LOWER(${email})`)
      .limit(1);

    if (existing) {
      return NextResponse.json({
        id: String(existing.id),
        name: existing.name || existing.companyName,
        email: existing.email,
        companyName: existing.companyName,
        mobileNo: existing.mobileNo || "",
        category: existing.category || "Gifting Items",
      });
    }

    const companyName = body.companyName || body.name || "Vendor";
    const name = body.name || body.contactName || email.split("@")[0];
    const mobileNo = body.mobileNo || body.phone || "";
    const category = body.category || "Gifting Items";

    const [newVendor] = await db
      .insert(giftingVendors)
      .values({
        companyName,
        name,
        email,
        mobileNo,
        category,
        rating: 5,
        status: "active",
      })
      .returning();

    return NextResponse.json(
      {
        id: String(newVendor.id),
        name: newVendor.name,
        email: newVendor.email,
        companyName: newVendor.companyName,
        mobileNo: newVendor.mobileNo,
        category: newVendor.category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in /api/vendors POST:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create vendor" },
      { status: 500 }
    );
  }
}
