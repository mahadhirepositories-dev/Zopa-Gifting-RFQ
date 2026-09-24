/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  rfqs,
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
  rfqContacts,
  rfqContactsMembers,
  users,
  sessions,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionCookie } from "better-auth/cookies";
import {
  upsertRfpRequirement,
  upsertRfpCompany,
  upsertRfpCategory,
  upsertRfpScope,
  upsertRfpBoq,
  upsertRfpEvaluationCriteria,
  upsertRfpFinancials,
  upsertRfpGeneralTerms,
  upsertRfpSpecialTerms,
  upsertRfpDocuments,
  upsertRfpVendors,
  upsertRfpVendorContacts,
  upsertRfpDates,
} from "@/lib/rfq-updates";
import {
  scopeSchema
} from "@/lib/validations/rfq-creator-schema";

async function getSessionUser(request: NextRequest) {
  const sessionToken =
    getSessionCookie(request) ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (sessionToken) {
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (
      activeSessions.length > 0 &&
      new Date(activeSessions[0].expiresAt) > new Date()
    ) {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, activeSessions[0].userId))
        .limit(1);

      if (userRows.length > 0) return userRows[0];
    }
  }

  const emailCookie = request.cookies.get("zopa_user_email")?.value;
  if (emailCookie) {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, emailCookie.trim().toLowerCase()))
      .limit(1);

    if (userRows.length > 0) return userRows[0];
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser(request);
    const { id } = await params;
    let targetRfpId = id;
    let targetRfq: typeof rfqs.$inferSelect | undefined;

    if (user) {
      // Check if RFQ exists for user in DB
      const [rfq] = await db
        .select()
        .from(rfqs)
        .where(and(eq(rfqs.id, id), eq(rfqs.userId, user.id)))
        .limit(1);

      if (rfq) {
        targetRfq = rfq;
      } else {
        await ensureRfqExists(id, user);
        targetRfpId = id;
        const [createdRfq] = await db
          .select()
          .from(rfqs)
          .where(eq(rfqs.id, id))
          .limit(1);
        targetRfq = createdRfq;
      }
    } else {
      // Guest access for preview
      const [rfq] = await db
        .select()
        .from(rfqs)
        .where(eq(rfqs.id, id))
        .limit(1);
      targetRfq = rfq;
    }

    if (!targetRfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 },
      );
    }

    const safeSelect = async (queryFn: () => Promise<any[]>) => {
      try {
        const rows = await queryFn();
        return rows[0] || null;
      } catch {
        return null;
      }
    };

    const categoryRow = await safeSelect(() =>
      db
        .select()
        .from(rfqCategories)
        .where(eq(rfqCategories.rfqId, targetRfpId))
        .limit(1),
    );

    const requirement = await safeSelect(() =>
      db
        .select()
        .from(rfqRequirements)
        .where(eq(rfqRequirements.rfqId, targetRfpId))
        .limit(1),
    );

    const scopeRow = await safeSelect(() =>
      db
        .select()
        .from(rfqScope)
        .where(eq(rfqScope.rfqId, targetRfpId))
        .limit(1),
    );

    const company = await safeSelect(() =>
      db
        .select()
        .from(rfqCompanies)
        .where(eq(rfqCompanies.rfqId, targetRfpId))
        .limit(1),
    );

    const contactMember = await safeSelect(() =>
      db
        .select()
        .from(rfqContactsMembers)
        .where(eq(rfqContactsMembers.rfqId, targetRfpId))
        .limit(1),
    );

    let contactDetails: typeof rfqContacts.$inferSelect | null = null;
    if (contactMember?.rfqContactId) {
      contactDetails = await safeSelect(() =>
        db
          .select()
          .from(rfqContacts)
          .where(eq(rfqContacts.id, contactMember.rfqContactId))
          .limit(1),
      );
    }

    if (!contactDetails && user?.email) {
      contactDetails = await safeSelect(() =>
        db
          .select()
          .from(rfqContacts)
          .where(eq(rfqContacts.contactEmail, user.email))
          .limit(1),
      );
    }

    let boqRows: (typeof rfqBoqItems.$inferSelect)[] = [];
    try {
      boqRows = await db
        .select()
        .from(rfqBoqItems)
        .where(eq(rfqBoqItems.rfqId, targetRfpId));
    } catch (err) {
      console.warn("DB boq items lookup warning:", err);
    }

    let evaluationRows: (typeof rfqEvaluationCriteria.$inferSelect)[] = [];
    try {
      evaluationRows = await db
        .select()
        .from(rfqEvaluationCriteria)
        .where(eq(rfqEvaluationCriteria.rfqId, targetRfpId));
    } catch (err) {
      console.warn("DB evaluation criteria lookup warning:", err);
    }

    const evaluationList = evaluationRows
      .map((row) => row.evaluation)
      .filter((e): e is string => Boolean(e));

    const parseField = (val: string | null) => {
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    };

    const formattedRfpUniqueId = targetRfpId.startsWith("RFP-")
      ? targetRfpId
      : `RFP-${targetRfpId.substring(0, 8).toUpperCase()}`;

    return NextResponse.json({
      rfpId: targetRfpId,
      rfpUniqueId: formattedRfpUniqueId,
      rfpuniqId: formattedRfpUniqueId,
      creatorEmail: user?.email || contactDetails?.contactEmail || "",
      creatorUserId: targetRfq?.userId || user?.id || "",
      rfpsData: targetRfq || { status: "draft" },
      categorySelection: categoryRow
        ? {
            category: parseField(categoryRow.category),
            subCategory: parseField(categoryRow.subCategory),
            tags: parseField(categoryRow.tags),
            serviceAreas: parseField(categoryRow.serviceAreas),
          }
        : null,
      requirement: requirement
        ? {
            projectName: requirement.projectName || "",
            purpose: requirement.purpose || "",
            rfpTitle: requirement.rfpTitle || "",
            briefRfp: requirement.briefRfp || "",
            isPhoneMasked: company?.isPhoneMasked || false,
          }
        : { isPhoneMasked: company?.isPhoneMasked || false },
      scope: {
        deliverables: scopeRow ? parseField(scopeRow.deliverables) || [] : [],
      },
      boq: boqRows.map((row) => ({
        id: row.id,
        category: row.category || "",
        description: row.description || "",
        uom: row.uom || "",
        qty: row.qty != null ? String(row.qty) : "",
        targetPrice: row.targetPrice != null ? String(row.targetPrice) : "",
        logoRequirement: row.logoRequirement || "without_logo",
        specification:
          row.specification && typeof row.specification === "object"
            ? ((row.specification as any).text ?? "")
            : ((row.specification as any) ?? ""),
        remarks: row.remarks || "",
        isVisible: row.isVisible ?? false,
        itemRef: row.itemRef ?? undefined,
        attachmentUrl: row.attachmentUrl || null,
        attachmentName: row.attachmentName || null,
        attachments: row.attachmentUrl
          ? [
              {
                fileName: row.attachmentName || "Attachment",
                fileType: row.attachmentType || "application/octet-stream",
                fileSize: row.attachmentSize || 0,
                fileUrl: row.attachmentUrl,
              },
            ]
          : [],
      })),
      evaluation: evaluationList,
      evaluationCriteria: evaluationList,
      financials: await safeSelect(() =>
        db
          .select()
          .from(rfqFinancials)
          .where(eq(rfqFinancials.rfqId, targetRfpId))
          .limit(1),
      ).then((fin) =>
        fin
          ? {
              budgetType: fin.pricingModel || fin.budgetType || "",
              priceModel: fin.pricingModel || fin.budgetType || "",
              currency: fin.currency || "",
              paymentTerm: fin.paymentTerm || "",
              paymentMilestones: fin.paymentTerms || [],
              pbgAmount: fin.pbgAmount || "",
              pbgNotes: fin.pbgNotes || "",
              financialNotes: fin.financialNotes || "",
            }
          : {
              budgetType: "",
              currency: "",
              paymentTerm: "",
              paymentMilestones: [],
              pbgAmount: "",
              pbgNotes: "",
              financialNotes: "",
            },
      ),
      generalTerms: await safeSelect(() =>
        db
          .select()
          .from(rfqGeneralTerms)
          .where(eq(rfqGeneralTerms.rfqId, targetRfpId))
          .limit(1),
      ).then((gt) =>
        gt
          ? {
              selectedTerms: gt.selectedTerms || [],
              customTerms: gt.customTerms || [],
              deliveryTimeValue: gt.deliveryTimeValue || "",
              deliveryTimeUnit: gt.deliveryTimeUnit || "",
              deliveryLocations: gt.deliveryLocations || [],
            }
          : null,
      ),
      specialTerms: await safeSelect(() =>
        db
          .select()
          .from(rfqSpecialTerms)
          .where(eq(rfqSpecialTerms.rfqId, targetRfpId))
          .limit(1),
      ).then((st) =>
        st
          ? {
              selectedTerms: st.selectedTerms || [],
              customTerms: st.customTerms || [],
            }
          : null,
      ),
      documents: await safeSelect(() =>
        db
          .select()
          .from(rfqDocuments)
          .where(eq(rfqDocuments.rfqId, targetRfpId))
          .limit(1),
      ).then((doc) => (doc ? parseField(doc.documentsToShare) || doc.documentsToShare : null)),
      documentsToShare: await safeSelect(() =>
        db
          .select()
          .from(rfqDocuments)
          .where(eq(rfqDocuments.rfqId, targetRfpId))
          .limit(1),
      ).then((doc) => (doc ? parseField(doc.documentsToShare) || doc.documentsToShare : null)),
      vendors: await safeSelect(() =>
        db
          .select()
          .from(rfqVendors)
          .where(eq(rfqVendors.rfqId, targetRfpId))
          .limit(1),
      ).then((v) =>
        v
          ? {
              selectionMethod: v.selectionMethod || "",
              vendorRequirements: parseField(v.vendorRequirements) || [],
              vendorSelectionProcess: v.vendorSelectionProcess || "",
            }
          : null,
      ),
      vendorContacts: await db
        .select()
        .from(rfqVendorContacts)
        .where(eq(rfqVendorContacts.rfqId, targetRfpId))
        .catch(() => []),
      vendorcontacts: await db
        .select()
        .from(rfqVendorContacts)
        .where(eq(rfqVendorContacts.rfqId, targetRfpId))
        .catch(() => []),
      rfpDates: await safeSelect(() =>
        db
          .select()
          .from(rfqDates)
          .where(eq(rfqDates.rfqId, targetRfpId))
          .limit(1),
      ).then((d) =>
        d
          ? {
              startDate: d.startDate || "",
              endDate: d.endDate || "",
            }
          : null,
      ),
      dates: await safeSelect(() =>
        db
          .select()
          .from(rfqDates)
          .where(eq(rfqDates.rfqId, targetRfpId))
          .limit(1),
      ).then((d) =>
        d
          ? {
              startDate: d.startDate || "",
              endDate: d.endDate || "",
            }
          : null,
      ),
      company: {
        name: company?.name || user?.companyName || user?.name || "",
        addressLine1: company?.addressLine1 || user?.addressLine1 || "",
        addressLine2: company?.addressLine2 || user?.addressLine2 || "",
        city: company?.city || user?.city || "",
        state: company?.state || user?.state || "",
        postalCode: company?.postalCode || user?.postalCode || "",
        country: company?.country || user?.country || "India",
        businessType: company?.businessType || "",
        isPhoneMasked: company?.isPhoneMasked || false,
      },
      contact: {
        contactName: contactDetails?.contactName || user?.name || "",
        contactEmail: contactDetails?.contactEmail || user?.email || "",
        contactPhone: contactDetails?.contactPhone || user?.mobileNumber || "",
        contactTitle: contactDetails?.contactTitle || "",
        contactDepartment: contactDetails?.contactDepartment || "",
        logoUrl: contactDetails?.logoUrl || null,
        logoPath: contactDetails?.logoPath || null,
        logoPreview: contactDetails?.logoData
          ? `data:${contactDetails.logoMimeType || "image/png"};base64,${contactDetails.logoData}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching RFQ data:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQ details." },
      { status: 500 },
    );
  }
}


async function ensureRfqExists(id: string, user: typeof users.$inferSelect) {
  const [existing] = await db
    .select({ id: rfqs.id, userId: rfqs.userId })
    .from(rfqs)
    .where(eq(rfqs.id, id))
    .limit(1);

  if (existing) {
    if (existing.userId !== user.id) {
      throw Object.assign(new Error("RFQ belongs to a different user."), {
        statusCode: 403,
      });
    }
    return; 
  }
  await db.insert(rfqs).values({
    id,
    userId: user.id,
    title: "",
    category: "Corporate Gifting",
    quantity: 500,
    status: "draft",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    try {
      await ensureRfqExists(id, user);
    } catch (err: any) {
      if (err.statusCode === 403) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
      throw err;
    }

    if (body.categorySelection || body.category) {
      await upsertRfpCategory(id, body.categorySelection || body.category);
    }

    if (body.requirement) {
      await upsertRfpRequirement(id, body.requirement);
    }

    if (body.scope) {
      const parsed = scopeSchema.safeParse(body.scope);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid scope of work data.",
            issues: parsed.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }
      await upsertRfpScope(id, parsed.data);
    }

    if (body.boq) {
      await upsertRfpBoq(id, Array.isArray(body.boq) ? body.boq : []);
    }

    if (body.evaluationCriteria || body.evaluation) {
      await upsertRfpEvaluationCriteria(
        id,
        body.evaluationCriteria || body.evaluation,
      );
    }

    if (body.financials) {
      await upsertRfpFinancials(id, body.financials);
    }

    if (body.company) {
      await upsertRfpCompany(id, body.company);
    }

    if (body.generalTerms) {
      await upsertRfpGeneralTerms(id, body.generalTerms);
    }

    if (body.specialTerms) {
      await upsertRfpSpecialTerms(id, body.specialTerms);
    }

    if (body.documents) {
      await upsertRfpDocuments(id, body.documents);
    }

    if (body.vendors) {
      await upsertRfpVendors(id, body.vendors);
    }

    if (body.vendorcontacts || body.vendorContacts) {
      const contactsToSave =
        Array.isArray(body.vendorContacts) && body.vendorContacts.length > 0
          ? body.vendorContacts
          : Array.isArray(body.vendorcontacts) && body.vendorcontacts.length > 0
            ? body.vendorcontacts
            : body.vendorcontacts || body.vendorContacts || [];
      await upsertRfpVendorContacts(id, contactsToSave);
    }

    if (body.dates || body.rfpDates) {
      await upsertRfpDates(id, body.dates || body.rfpDates);
    }

    if (body.status) {
      await db
        .update(rfqs)
        .set({ status: String(body.status), updatedAt: new Date() })
        .where(eq(rfqs.id, id));
    }

    return NextResponse.json({
      success: true,
      message: "RFQ updated successfully.",
    });
  } catch (error) {
    console.error("Error updating RFQ data:", error);
    return NextResponse.json(
      { error: "Failed to update RFQ data." },
      { status: 500 },
    );
  }
}
