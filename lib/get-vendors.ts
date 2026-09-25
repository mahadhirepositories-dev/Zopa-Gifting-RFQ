import { db } from "@/db";
import { giftingVendors as localGiftingVendors } from "@/db/schema/gifting-vendor-schema";

export interface NormalizedVendor {
  id: number | string;
  name: string;
  companyName: string;
  email: string;
  mobileNo: string;
  countryCode?: string;
  category: string;
  tags: string;
  description: string;
  city: string;
  state: string;
  country: string;
  serviceAreas: string;
  rating?: number | null;
  status: string;
  logoUrl?: string | null;
}

export async function fetchGiftingVendors(): Promise<NormalizedVendor[]> {
  let rawVendors: any[] = [];
  const apiKey = process.env.ZOPA_GIFTING_RFQ_API_KEY;

  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        "https://flux.zopapro.com/api/external/gifting-vendors",
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          next: { revalidate: 60 },
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json)) {
          rawVendors = json;
        } else if (Array.isArray(json?.data)) {
          rawVendors = json.data;
        } else if (Array.isArray(json?.vendors)) {
          rawVendors = json.vendors;
        } else {
          rawVendors = [];
        }
      } else {
        console.warn(
          `[fetchGiftingVendors] External API returned status ${response.status}`
        );
      }
    } catch (err) {
      console.warn("[fetchGiftingVendors] Failed fetching from external API:", err);
    }
  }

  // Fallback to local database
  if (!rawVendors || rawVendors.length === 0) {
    try {
      rawVendors = await db.select().from(localGiftingVendors);
    } catch (err) {
      console.warn("[fetchGiftingVendors] Local DB query skipped:", err);
    }
  }

  const parseValue = (val: any) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (rawVendors || []).map((v: any, index: number) => ({
    id: v.id ?? index + 1,
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
    rating: typeof v.rating === "number" ? v.rating : 5,
    logoUrl: v.logo_url || v.logoUrl || null,
    status: v.approvalStatus || v.approval_status || v.status || "active",
  }));
}

export async function getGiftingVendorsCount(): Promise<number> {
  const vendors = await fetchGiftingVendors();
  return vendors.length;
}
