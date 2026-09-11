/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import {
  rfqCompanies,
  rfqRequirements,
  rfqCategories,
  rfqScope,
  rfqBoqItems,
  rfqEvaluationCriteria,
  rfqFinancials,
  rfqGeneralTerms,
  rfqSpecialTerms,
  rfqDocuments,
  rfqVendors,
  rfqVendorContacts,
  rfqDates,
} from "@/db/schema";
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
  const name = (data.companyName || (data as any).name)?.trim();
  if (!name) return;

  const values = {
    rfqId: rfpId,
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
    .where(eq(rfqCompanies.rfqId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqCompanies)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqCompanies.rfqId, rfpId));
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
    rfqId: rfpId,
    projectName: projectName || "Untitled Project",
    purpose: purpose || "Gifting Requirement",
  };

  const [existing] = await db
    .select({ id: rfqRequirements.id })
    .from(rfqRequirements)
    .where(eq(rfqRequirements.rfqId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqRequirements)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqRequirements.rfqId, rfpId));
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
    rfqId: rfpId,
    category: categoryStr,
    subCategory: subCategoryStr,
    tags: tagsStr,
    serviceAreas: serviceAreasStr,
  };

  const [existing] = await db
    .select({ id: rfqCategories.id })
    .from(rfqCategories)
    .where(eq(rfqCategories.rfqId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqCategories)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(rfqCategories.rfqId, rfpId));
  } else {
    await db.insert(rfqCategories).values(values);
  }
}

export async function upsertRfpScope(
  rfpId: string,
  scope: { deliverables?: string[] },
) {
  const deliverables = JSON.stringify(scope.deliverables ?? []);

  const [existing] = await db
    .select({ id: rfqScope.id })
    .from(rfqScope)
    .where(eq(rfqScope.rfqId, rfpId))
    .limit(1);

  if (existing) {
    await db
      .update(rfqScope)
      .set({ deliverables, updatedAt: new Date() })
      .where(eq(rfqScope.rfqId, rfpId));
  } else {
    await db.insert(rfqScope).values({ rfqId: rfpId, deliverables });
  }
}

export async function upsertRfpBoq(rfpId: string, boqItems: any[]) {
  if (!Array.isArray(boqItems)) return;
  await db.delete(rfqBoqItems).where(eq(rfqBoqItems.rfqId, rfpId));

  for (const item of boqItems) {
    if (!item.description && !item.itemName && !item.category) continue;

    const desc = item.description || item.itemName || "";
    const qtyVal = String(item.qty || item.quantity || "1");
    const targetPriceClean = item.targetPrice
      ? String(item.targetPrice).replace(/[^0-9.]/g, "")
      : null;
    const targetPriceVal =
      targetPriceClean && !isNaN(Number(targetPriceClean))
        ? targetPriceClean
        : null;
    const att =
      Array.isArray(item.attachments) && item.attachments.length > 0
        ? item.attachments[0]
        : null;

    await db.insert(rfqBoqItems).values({
      rfqId: rfpId,
      ...(item.itemRef ? { itemRef: item.itemRef } : {}),
      category: item.category || "General",
      description: desc,
      qty: qtyVal,
      uom: item.uom || "Unit",
      specification:
        typeof item.specification === "object" && item.specification !== null
          ? item.specification
          : { text: item.specification || "" },
      targetPrice: targetPriceVal,
      remarks: item.remarks || null,
      isVisible: item.isVisible !== false,
      attachmentUrl: att?.fileUrl || att?.url || null,
      attachmentName: att?.fileName || att?.name || null,
      attachmentType: att?.fileType || att?.type || null,
      attachmentSize: att?.fileSize ? Number(att.fileSize) : null,
    });
  }
}

export async function upsertRfpEvaluationCriteria(
  rfpId: string,
  rawCriteria: any,
) {
  let criteriaList: any[] = [];
  if (Array.isArray(rawCriteria)) {
    criteriaList = rawCriteria;
  } else if (typeof rawCriteria === "object" && rawCriteria !== null) {
    if (Array.isArray(rawCriteria.criteria)) criteriaList = rawCriteria.criteria;
    else if (Array.isArray(rawCriteria.evaluationCriteria)) criteriaList = rawCriteria.evaluationCriteria;
    else if (Array.isArray(rawCriteria.evaluation)) criteriaList = rawCriteria.evaluation;
  }

  if (!criteriaList.length) return;

  try {
    await db
      .delete(rfqEvaluationCriteria)
      .where(eq(rfqEvaluationCriteria.rfqId, rfpId));

    for (const item of criteriaList) {
      const text = typeof item === "string" ? item : item?.criteria || item?.label || item?.evaluation || String(item);
      if (typeof text === "string" && text.trim()) {
        await db.insert(rfqEvaluationCriteria).values({
          rfqId: rfpId,
          evaluation: text.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.warn("Error upserting RFP evaluation criteria:", error);
  }
}

export async function upsertRfpFinancials(rfpId: string, data: any) {
  if (!data || typeof data !== "object") return;

  try {
    const values = {
      rfqId: rfpId,
      rfpId: rfpId,
      pricingModel: data.budgetType || data.priceModel || null,
      budgetType: data.budgetType || data.priceModel || null,
      currency: data.currency || null,
      paymentTerm: data.paymentTerm || null,
      paymentTerms: Array.isArray(data.paymentMilestones)
        ? data.paymentMilestones
        : Array.isArray(data.paymentTerms)
          ? data.paymentTerms
          : [],
      pbgAmount: data.pbgAmount || null,
      pbgNotes: data.pbgNotes || null,
      financialNotes: data.financialNotes || null,
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqFinancials.id })
      .from(rfqFinancials)
      .where(eq(rfqFinancials.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqFinancials)
        .set(values)
        .where(eq(rfqFinancials.rfqId, rfpId));
    } else {
      await db.insert(rfqFinancials).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP financials:", error);
  }
}

export async function upsertRfpGeneralTerms(rfpId: string, data: any) {
  if (!data || typeof data !== "object") return;
  try {
    const values = {
      rfqId: rfpId,
      selectedTerms: data.selectedTerms || [],
      customTerms: data.customTerms || [],
      deliveryTimeValue: data.deliveryTimeValue ? String(data.deliveryTimeValue) : null,
      deliveryTimeUnit: data.deliveryTimeUnit || null,
      deliveryLocations: data.deliveryLocations || [],
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqGeneralTerms.id })
      .from(rfqGeneralTerms)
      .where(eq(rfqGeneralTerms.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqGeneralTerms)
        .set(values)
        .where(eq(rfqGeneralTerms.rfqId, rfpId));
    } else {
      await db.insert(rfqGeneralTerms).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP general terms:", error);
  }
}

export async function upsertRfpSpecialTerms(rfpId: string, data: any) {
  if (!data || typeof data !== "object") return;
  try {
    const values = {
      rfqId: rfpId,
      selectedTerms: data.selectedTerms || [],
      customTerms: data.customTerms || [],
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqSpecialTerms.id })
      .from(rfqSpecialTerms)
      .where(eq(rfqSpecialTerms.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqSpecialTerms)
        .set(values)
        .where(eq(rfqSpecialTerms.rfqId, rfpId));
    } else {
      await db.insert(rfqSpecialTerms).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP special terms:", error);
  }
}

export async function upsertRfpDocuments(rfpId: string, data: any) {
  if (!data) return;
  try {
    const docsStr = typeof data === "string" ? data : JSON.stringify(data);
    const values = {
      rfqId: rfpId,
      documentsToShare: docsStr,
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqDocuments.id })
      .from(rfqDocuments)
      .where(eq(rfqDocuments.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqDocuments)
        .set(values)
        .where(eq(rfqDocuments.rfqId, rfpId));
    } else {
      await db.insert(rfqDocuments).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP documents:", error);
  }
}

export async function upsertRfpVendors(rfpId: string, data: any) {
  if (!data || typeof data !== "object") return;
  try {
    const values = {
      rfqId: rfpId,
      selectionMethod: data.selectionMethod || null,
      vendorRequirements:
        typeof data.vendorRequirements === "string"
          ? data.vendorRequirements
          : JSON.stringify(data.vendorRequirements || []),
      vendorSelectionProcess:
        typeof data.vendorSelectionProcess === "string"
          ? data.vendorSelectionProcess
          : data.vendorSelectionProcess
            ? String(data.vendorSelectionProcess)
            : "",
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqVendors.id })
      .from(rfqVendors)
      .where(eq(rfqVendors.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqVendors)
        .set(values)
        .where(eq(rfqVendors.rfqId, rfpId));
    } else {
      await db.insert(rfqVendors).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP vendors:", error);
  }
}

export async function upsertRfpVendorContacts(rfpId: string, contacts: any[]) {
  if (!Array.isArray(contacts)) return;
  try {
    await db.delete(rfqVendorContacts).where(eq(rfqVendorContacts.rfqId, rfpId));

    for (const c of contacts) {
      if (!c.name && !c.email) continue;
      await db.insert(rfqVendorContacts).values({
        rfqId: rfpId,
        name: c.name || "Vendor",
        email: c.email || "",
        mobileNo: c.mobileNo || c.phone || "",
        companyName: c.companyName || c.company || "Vendor Company",
        countryCode: c.countryCode || "+91",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.warn("Error upserting RFP vendor contacts:", error);
  }
}

export async function upsertRfpDates(rfpId: string, data: any) {
  if (!data || typeof data !== "object") return;
  try {
    const values = {
      rfqId: rfpId,
      startDate: data.startDate ? String(data.startDate).slice(0, 10) : null,
      endDate: data.endDate ? String(data.endDate).slice(0, 10) : null,
      originalEndDate: data.originalEndDate ? String(data.originalEndDate).slice(0, 10) : (data.endDate ? String(data.endDate).slice(0, 10) : null),
      updatedAt: new Date(),
    };

    const [existing] = await db
      .select({ id: rfqDates.id })
      .from(rfqDates)
      .where(eq(rfqDates.rfqId, rfpId))
      .limit(1);

    if (existing) {
      await db
        .update(rfqDates)
        .set(values)
        .where(eq(rfqDates.rfqId, rfpId));
    } else {
      await db.insert(rfqDates).values(values);
    }
  } catch (error) {
    console.warn("Error upserting RFP dates:", error);
  }
}