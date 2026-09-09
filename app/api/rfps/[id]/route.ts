/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  rfqs,
  rfqCompanies,
  rfqRequirements,
  rfqCategories,
  users,
  sessions,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionCookie } from "better-auth/cookies";
import {
  upsertRfpRequirement,
  upsertRfpCompany,
  upsertRfpCategory,
} from "@/lib/rfq-updates";

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
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Check if RFQ exists for user in DB
    const [rfq] = await db
      .select()
      .from(rfqs)
      .where(and(eq(rfqs.id, id), eq(rfqs.userId, user.id)))
      .limit(1);

    if (!rfq) {
      // Check if user has ANY rfq
      const [anyUserRfq] = await db
        .select()
        .from(rfqs)
        .where(eq(rfqs.userId, user.id))
        .limit(1);

      if (!anyUserRfq) {
        return NextResponse.json(
          { error: "No RFQ found for user.", exists: false },
          { status: 404 },
        );
      }
    }

    // Fetch Category, Requirement and Company details
    const [categoryRow] = await db
      .select()
      .from(rfqCategories)
      .where(eq(rfqCategories.rfpId, id))
      .limit(1);

    const [requirement] = await db
      .select()
      .from(rfqRequirements)
      .where(eq(rfqRequirements.rfpId, id))
      .limit(1);

    const [company] = await db
      .select()
      .from(rfqCompanies)
      .where(eq(rfqCompanies.rfpId, id))
      .limit(1);

    const parseField = (val: string | null) => {
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    };

    return NextResponse.json({
      rfpId: id,
      rfpsData: rfq || { status: "draft" },
      categorySelection: categoryRow
        ? {
            category: parseField(categoryRow.category),
            subCategory: parseField(categoryRow.subCategory),
            tags: parseField(categoryRow.tags),
            serviceAreas: parseField(categoryRow.serviceAreas),
          }
        : null,
      requirement: requirement || {
        projectName:
          rfq?.title ||
          `Gifting Requirement for ${user.companyName || user.name}`,
        purpose: "Annual employee & client gift hampers",
      },
      company: company || {
        name: user.companyName || user.name,
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        city: user.city || "",
        state: user.state || "",
        postalCode: user.postalCode || "",
        country: user.country || "India",
        businessType: "",
      },
      contact: {
        contactName: user.name,
        contactEmail: user.email,
        contactPhone: user.mobileNumber || "",
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

// Ensures a parent `rfqs` row exists for this id before any child table
// (category/requirement/company) tries to insert against it as a foreign
// key. Without this, saving any section for an RFP whose parent row was
// never created (e.g. a client-generated id that never went through a
// creation endpoint) fails with a 23503 FK violation on first save.
async function ensureRfqExists(id: string, user: typeof users.$inferSelect) {
  const [existing] = await db
    .select({ id: rfqs.id, userId: rfqs.userId })
    .from(rfqs)
    .where(eq(rfqs.id, id))
    .limit(1);

  if (existing) {
    if (existing.userId !== user.id) {
      // Row exists but belongs to someone else — don't silently create a
      // duplicate or let this user write into it.
      throw Object.assign(new Error("RFQ belongs to a different user."), {
        statusCode: 403,
      });
    }
    return; // already exists and owned by this user — nothing to do
  }

  // No parent row yet — create a minimal draft so child inserts have
  // something to reference. Section data (requirement/company/category)
  // will fill in the real details via the upserts below.
  await db.insert(rfqs).values({
    id,
    userId: user.id,
    title: `Gifting Requirement for ${user.companyName || user.name}`,
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

    if (body.company) {
      await upsertRfpCompany(id, body.company);
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
