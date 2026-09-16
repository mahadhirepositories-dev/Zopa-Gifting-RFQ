/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import postgres from "postgres";
import { db } from "@/db";
import { giftingVendors as localGiftingVendors } from "@/db/schema/gifting-vendor-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Database connection details for "zopa-rfp" database
    const user = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD || "12345";
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || 5432;
    const dbName = process.env.VENDOR_DB_NAME || "zopa-rfp";

    const vendorDbUrl =
      process.env.VENDOR_DATABASE_URL ||
      `postgres://${user}:${password}@${host}:${port}/${dbName}`;

    let rawVendors: any[] = [];

    // 1. Fetch from "zopa-rfp" database gifting_vendors table
    try {
      const sql = postgres(vendorDbUrl, { max: 5 });
      rawVendors = await sql`
        SELECT 
          id,
          name,
          company_name,
          email,
          phone_number,
          country_code,
          category,
          description,
          tags,
          service_areas,
          city,
          state,
          country,
          logo_url,
          approval_status
        FROM gifting_vendors
      `;
      await sql.end();
    } catch (err) {
      console.warn("[gifting-vendor API] Warning: Failed querying zopa-rfp database:", err);
    }

    // 2. Fallback to master_vendor_contacts in zopa-rfp if gifting_vendors returned 0 rows
    if (!rawVendors || rawVendors.length === 0) {
      try {
        const sql = postgres(vendorDbUrl, { max: 5 });
        rawVendors = await sql`
          SELECT 
            id,
            name,
            company_name,
            email,
            phone_number,
            country_code,
            category,
            description,
            tags,
            service_areas,
            city,
            state,
            country,
            logo_url,
            approval_status
          FROM master_vendor_contacts
        `;
        await sql.end();
      } catch (err) {
        console.warn("[gifting-vendor API] Warning: Failed querying master_vendor_contacts:", err);
      }
    }

    // 3. Fallback to local database giftingVendors schema
    if (!rawVendors || rawVendors.length === 0) {
      try {
        rawVendors = await db.select().from(localGiftingVendors);
      } catch (err) {
        console.warn("[gifting-vendor API] Local DB query skipped:", err);
      }
    }

    // Normalize vendor object properties for the frontend Master Vendor Table
    let vendors = (rawVendors || []).map((v: any) => {
      // Normalize array/JSON fields if stored as JSONB array or string
      const parseValue = (val: any) => {
        if (!val) return "";
        if (Array.isArray(val)) return val.join(", ");
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      };

      return {
        id: v.id,
        name: v.name || "",
        companyName: v.company_name || v.companyName || v.name || "Vendor",
        email: v.email || "",
        mobileNo: v.phone_number || v.mobileNo || v.phone || "",
        countryCode: v.country_code || v.countryCode || "+91",
        category: parseValue(v.category),
        description: parseValue(v.description),
        tags: parseValue(v.tags),
        serviceAreas: parseValue(v.service_areas || v.serviceAreas),
        city: parseValue(v.city),
        state: parseValue(v.state),
        country: parseValue(v.country),
        logoUrl: v.logo_url || v.logoUrl || null,
        approvalStatus: v.approval_status || "approved",
      };
    });

    // Apply search and category filtering if requested
    if (category) {
      const catLower = category.toLowerCase();
      vendors = vendors.filter((v) =>
        (v.category || "").toLowerCase().includes(catLower)
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      vendors = vendors.filter(
        (v) =>
          (v.companyName || "").toLowerCase().includes(searchLower) ||
          (v.name || "").toLowerCase().includes(searchLower) ||
          (v.category || "").toLowerCase().includes(searchLower) ||
          (v.tags || "").toLowerCase().includes(searchLower) ||
          (v.description || "").toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(vendors, { status: 200 });
  } catch (error: any) {
    console.error("[gifting-vendor API] Internal Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch gifting vendors from database" },
      { status: 500 }
    );
  }
}
