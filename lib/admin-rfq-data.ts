/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import {
  users,
  rfqs,
  rfqCompanies,
  rfqCategories,
  rfqRequirements,
  rfqScope,
  rfqBoqItems,
  rfqEvaluationCriteria,
  rfqFinancials,
  rfqGeneralTerms,
  rfqSpecialTerms,
  rfqDocuments,
  rfqContacts,
  rfqContactsMembers,
  rfqVendors,
  rfqVendorContacts,
  rfqDates,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const safeSelect = async <T>(queryFn: () => Promise<T[]>): Promise<T | null> => {
  try {
    const rows = await queryFn();
    return rows[0] || null;
  } catch (err) {
    console.warn("DB safeSelect warning:", err);
    return null;
  }
};

const parseJsonField = (val: any) => {
  if (!val) return null;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

/**
 * Fetches buyer profile and all RFQs created by this buyer
 */
export async function getBuyerWithRfqs(buyerId: string) {
  const buyer = await safeSelect(() =>
    db.select().from(users).where(eq(users.id, buyerId)).limit(1)
  );

  if (!buyer) return null;

  // Retrieve RFQs submitted by this buyer
  const buyerRfqs = await db
    .select()
    .from(rfqs)
    .where(eq(rfqs.userId, buyerId))
    .orderBy(desc(rfqs.createdAt));

  return {
    buyer,
    rfqs: buyerRfqs,
  };
}

/**
 * Fetches full RFQ bundle for comprehensive inspection
 */
export async function getAdminRfqDetails(rfqId: string) {
  const rfq = await safeSelect(() =>
    db.select().from(rfqs).where(eq(rfqs.id, rfqId)).limit(1)
  );

  if (!rfq) return null;

  // Creator User (if exists)
  let creatorUser = null;
  if (rfq.userId) {
    creatorUser = await safeSelect(() =>
      db.select().from(users).where(eq(users.id, rfq.userId!)).limit(1)
    );
  }

  // Company Information
  const company = await safeSelect(() =>
    db.select().from(rfqCompanies).where(eq(rfqCompanies.rfqId, rfqId)).limit(1)
  );

  // Category Information
  const category = await safeSelect(() =>
    db.select().from(rfqCategories).where(eq(rfqCategories.rfqId, rfqId)).limit(1)
  );

  // Requirement Information (About Requirement)
  const requirement = await safeSelect(() =>
    db.select().from(rfqRequirements).where(eq(rfqRequirements.rfqId, rfqId)).limit(1)
  );

  // Scope of Work (Deliverables)
  const scope = await safeSelect(() =>
    db.select().from(rfqScope).where(eq(rfqScope.rfqId, rfqId)).limit(1)
  );

  // Contact Information
  const contactMember = await safeSelect(() =>
    db.select().from(rfqContactsMembers).where(eq(rfqContactsMembers.rfqId, rfqId)).limit(1)
  );

  let contactDetails: typeof rfqContacts.$inferSelect | null = null;
  if (contactMember?.rfqContactId) {
    contactDetails = await safeSelect(() =>
      db.select().from(rfqContacts).where(eq(rfqContacts.id, contactMember.rfqContactId)).limit(1)
    );
  }

  if (!contactDetails && creatorUser?.email) {
    contactDetails = await safeSelect(() =>
      db.select().from(rfqContacts).where(eq(rfqContacts.contactEmail, creatorUser.email)).limit(1)
    );
  }

  // BOQ Items
  let boqItems: (typeof rfqBoqItems.$inferSelect)[] = [];
  try {
    boqItems = await db
      .select()
      .from(rfqBoqItems)
      .where(eq(rfqBoqItems.rfqId, rfqId));
  } catch (err) {
    console.warn("DB boq items lookup warning:", err);
  }

  // Evaluation Criteria
  let evaluationRows: (typeof rfqEvaluationCriteria.$inferSelect)[] = [];
  try {
    evaluationRows = await db
      .select()
      .from(rfqEvaluationCriteria)
      .where(eq(rfqEvaluationCriteria.rfqId, rfqId));
  } catch (err) {
    console.warn("DB evaluation criteria warning:", err);
  }

  // Financials
  const financials = await safeSelect(() =>
    db.select().from(rfqFinancials).where(eq(rfqFinancials.rfqId, rfqId)).limit(1)
  );

  // General Terms
  const generalTerms = await safeSelect(() =>
    db.select().from(rfqGeneralTerms).where(eq(rfqGeneralTerms.rfqId, rfqId)).limit(1)
  );

  // Special Terms
  const specialTerms = await safeSelect(() =>
    db.select().from(rfqSpecialTerms).where(eq(rfqSpecialTerms.rfqId, rfqId)).limit(1)
  );

  // Documents
  const documents = await safeSelect(() =>
    db.select().from(rfqDocuments).where(eq(rfqDocuments.rfqId, rfqId)).limit(1)
  );

  // Vendors config
  const vendorsConfig = await safeSelect(() =>
    db.select().from(rfqVendors).where(eq(rfqVendors.rfqId, rfqId)).limit(1)
  );

  // Invited Vendor Contacts for this RFQ
  let vendorContacts: (typeof rfqVendorContacts.$inferSelect)[] = [];
  try {
    vendorContacts = await db
      .select()
      .from(rfqVendorContacts)
      .where(eq(rfqVendorContacts.rfqId, rfqId))
      .orderBy(desc(rfqVendorContacts.createdAt));
  } catch (err) {
    console.warn("DB vendor contacts warning:", err);
  }

  // Project Dates
  const dates = await safeSelect(() =>
    db.select().from(rfqDates).where(eq(rfqDates.rfqId, rfqId)).limit(1)
  );

  return {
    rfq,
    creatorUser,
    company: {
      name: company?.name || creatorUser?.companyName || "Not provided",
      addressLine1: company?.addressLine1 || creatorUser?.addressLine1 || "",
      addressLine2: company?.addressLine2 || creatorUser?.addressLine2 || "",
      city: company?.city || creatorUser?.city || "",
      state: company?.state || creatorUser?.state || "",
      postalCode: company?.postalCode || creatorUser?.postalCode || "",
      country: company?.country || creatorUser?.country || "India",
      businessType: company?.businessType || "Corporate Gifting",
      isPhoneMasked: Boolean(company?.isPhoneMasked),
    },
    contact: {
      name: contactDetails?.contactName || creatorUser?.name || "Buyer Contact",
      email: contactDetails?.contactEmail || creatorUser?.email || "",
      phone: contactDetails?.contactPhone || creatorUser?.mobileNumber || "",
      department: contactDetails?.contactDepartment || "Procurement",
      addressLine1: contactDetails?.contactAddressLine1 || creatorUser?.addressLine1 || "",
      addressLine2: contactDetails?.contactAddressLine2 || creatorUser?.addressLine2 || "",
      city: contactDetails?.contactCity || creatorUser?.city || "",
      state: contactDetails?.contactState || creatorUser?.state || "",
      postalCode: contactDetails?.contactPostalCode || creatorUser?.postalCode || "",
      country: contactDetails?.contactCountry || creatorUser?.country || "India",
      logoUrl: contactDetails?.logoUrl || null,
      logoPreview: contactDetails?.logoData
        ? `data:${contactDetails.logoMimeType || "image/png"};base64,${contactDetails.logoData}`
        : null,
    },
    requirement: {
      projectName: requirement?.projectName || rfq.title || "Untitled Project",
      purpose: requirement?.purpose || "Corporate Gifting Procurement",
    },
    scope: {
      deliverables: parseJsonField(scope?.deliverables) || [],
    },
    category: {
      category: parseJsonField(category?.category) || rfq.category || "Corporate Gifting",
      subCategory: parseJsonField(category?.subCategory) || null,
      tags: parseJsonField(category?.tags) || [],
      serviceAreas: parseJsonField(category?.serviceAreas) || null,
    },
    boq: boqItems.map((item) => ({
      id: item.id,
      category: item.category || "General",
      description: item.description || "",
      uom: item.uom || "Unit",
      qty: item.qty ? Number(item.qty) : 0,
      targetPrice: item.targetPrice ? Number(item.targetPrice) : null,
      logoRequirement: item.logoRequirement || "without_logo",
      specification:
        item.specification && typeof item.specification === "object"
          ? (item.specification as any).text || JSON.stringify(item.specification)
          : String(item.specification || ""),
      remarks: item.remarks || "",
      attachmentUrl: item.attachmentUrl || null,
      attachmentName: item.attachmentName || null,
    })),
    evaluationCriteria: evaluationRows
      .map((r) => r.evaluation)
      .filter((e): e is string => Boolean(e)),
    financials: {
      pricingModel: financials?.pricingModel || financials?.budgetType || "Standard Quotation",
      currency: financials?.currency || "INR",
      pbgAmount: financials?.pbgAmount || "None",
      pbgNotes: financials?.pbgNotes || "",
      paymentTerms: parseJsonField(financials?.paymentTerms) || (financials?.paymentTerm ? [financials.paymentTerm] : []),
      financialNotes: financials?.financialNotes || "",
    },
    generalTerms: {
      deliveryTimeValue: generalTerms?.deliveryTimeValue || "",
      deliveryTimeUnit: generalTerms?.deliveryTimeUnit || "Days",
      deliveryLocations: parseJsonField(generalTerms?.deliveryLocations) || [],
      selectedTerms: parseJsonField(generalTerms?.selectedTerms) || [],
      customTerms: parseJsonField(generalTerms?.customTerms) || [],
    },
    specialTerms: {
      selectedTerms: parseJsonField(specialTerms?.selectedTerms) || [],
      customTerms: parseJsonField(specialTerms?.customTerms) || [],
    },
    documentsToShare: parseJsonField(documents?.documentsToShare) || documents?.documentsToShare || null,
    vendorSelection: {
      selectionMethod: vendorsConfig?.selectionMethod || "",
      vendorRequirements: parseJsonField(vendorsConfig?.vendorRequirements) || [],
      vendorSelectionProcess: vendorsConfig?.vendorSelectionProcess || "",
    },
    vendorContacts,
    dates: {
      startDate: dates?.startDate ? String(dates.startDate) : null,
      endDate: dates?.endDate ? String(dates.endDate) : null,
    },
  };
}
