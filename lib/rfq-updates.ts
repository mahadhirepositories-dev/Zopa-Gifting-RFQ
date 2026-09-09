/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { rfqCompanies, rfqRequirements, rfqCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

interface CompanySourceData {
  companyName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  businessType?: string | null;
}

interface RequirementSourceData {
  projectName?: string | null;
  purpose?: string | null;
}

interface CategorySourceData {
  category?: string | string[] | null;
  subCategory?: string | string[] | null;
  tags?: string[] | string | null;
  serviceAreas?: string[] | string | null;
}

export async function upsertRfpCompany(rfpId: string, data: CompanySourceData) {
  const name = data.companyName?.trim();
  if (!name) return;

  const values = {
    rfpId,
    name,
    addressLine1: data.addressLine1?.trim() || "Not provided",
    addressLine2: data.addressLine2?.trim() || null,
    city: data.city?.trim() || "Unknown",
    state: data.state?.trim() || "Unknown",
    postalCode: data.postalCode?.trim() || "Unknown",
    country: data.country?.trim() || "Unknown",
    businessType: data.businessType ? String(data.businessType).trim() : null,
  };

  const [existing] = await db
    .select({ id: rfqCompanies.id })
    .from(rfqCompanies)
    .where(eq(rfqCompanies.rfpId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqCompanies)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqCompanies.rfpId, rfpId));
  } else {
    await db.insert(rfqCompanies).values(values);
  }
}

export async function upsertRfpRequirement(
  rfpId: string,
  data: RequirementSourceData,
) {
  const projectName = data.projectName?.trim();
  const purpose = data.purpose?.trim();

  if (!projectName && !purpose) return;

  const values = {
    rfpId,
    projectName: projectName || "Untitled Project",
    purpose: purpose || "Gifting Requirement",
  };

  const [existing] = await db
    .select({ id: rfqRequirements.id })
    .from(rfqRequirements)
    .where(eq(rfqRequirements.rfpId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqRequirements)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqRequirements.rfpId, rfpId));
  } else {
    await db.insert(rfqRequirements).values(values);
  }
}

export async function upsertRfpCategory(
  rfpId: string,
  data: CategorySourceData,
) {
  const formatField = (val: any): string => {
    if (!val) return "";
    if (Array.isArray(val)) return JSON.stringify(val);
    return String(val).trim();
  };

  const categoryStr = formatField(data.category) || "Corporate Gifting";
  const subCategoryStr = formatField(data.subCategory) || null;
  const tagsStr = formatField(data.tags) || null;
  const serviceAreasStr = formatField(data.serviceAreas) || null;

  const values = {
    rfpId,
    category: categoryStr,
    subCategory: subCategoryStr,
    tags: tagsStr,
    serviceAreas: serviceAreasStr,
  };

  const [existing] = await db
    .select({ id: rfqCategories.id })
    .from(rfqCategories)
    .where(eq(rfqCategories.rfpId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqCategories)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqCategories.rfpId, rfpId));
  } else {
    await db.insert(rfqCategories).values(values);
  }
}
