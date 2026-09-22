/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { giftingVendors as localGiftingVendors } from "@/db/schema/gifting-vendor-schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let rawVendors: any[] = [];
    const apiKey = process.env.ZOPA_GIFTING_RFQ_API_KEY;

    if (apiKey) {
      // 1. Fetch from zopa-rfp external API securely using the API key
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch("https://flux.zopapro.com/api/external/gifting-vendors", {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json"
          },
          signal: controller.signal,
          next: { revalidate: 60 } // cache for 60 seconds
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          rawVendors = await response.json();
        } else {
          console.warn(`[gifting-vendor API] Warning: External API returned status ${response.status}: ${await response.text().catch(() => '')}`);
        }
      } catch (err) {
        console.warn("[gifting-vendor API] Warning: Failed fetching from external API:", err);
      }
    } else {
      console.warn("[gifting-vendor API] Warning: ZOPA_GIFTING_RFQ_API_KEY is not set. Skipping external API fetch.");
    }

    // 2. Fallback to local database giftingVendors schema
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
        mobileNo: v.phoneNumber || v.phone_number || v.mobileNo || v.phone || "",
        countryCode: v.country_code || v.countryCode || "+91",
        category: parseValue(v.category),
        description: parseValue(v.description),
        tags: parseValue(v.tags),
        serviceAreas: parseValue(v.service_areas || v.serviceAreas),
        city: parseValue(v.city),
        state: parseValue(v.state),
        country: parseValue(v.country),
        logoUrl: v.logo_url || v.logoUrl || null,
        approvalStatus: v.approvalStatus || v.approval_status || "approved",
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
