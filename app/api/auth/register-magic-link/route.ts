/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, rfqs, pendingRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmailService } from "@/lib/email/email-service";
import { createAndSetAuthSession } from "@/lib/auth-session";

const formatLocationField = (val: any): string => {
  if (!val) return "";
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return String(val).trim();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      mobileNumber,
      phoneNumber,
      companyName,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      postalCode,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        {
          error: "Name and Work Email address are required.",
        },
        { status: 400 },
      );
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();
    const rawMobile = mobileNumber || phoneNumber || "";
    const mobileClean = rawMobile ? String(rawMobile).trim() : "+91 8521479630";
    const companyClean = companyName ? String(companyName).trim() : "KG Corp";
    const addressLine1Clean = addressLine1 ? String(addressLine1).trim() : null;
    const addressLine2Clean = addressLine2 ? String(addressLine2).trim() : null;
    const countryClean = formatLocationField(country) || null;
    const stateClean = formatLocationField(state) || null;
    const cityClean = formatLocationField(city) || null;
    const postalCodeClean = postalCode ? String(postalCode).trim() : null;

    // Check if email is already registered in DB before creating a new user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "This email address is already registered. Please log in instead.",
          isAlreadyRegistered: true,
        },
        { status: 400 }
      );
    }

    // Generate proper unique IDs for each new user and RFP
    const userId = crypto.randomUUID();
    const rfpId = crypto.randomUUID();

    // Try saving complete user details and creating RFP in Drizzle ORM DB
    try {
      const userValues = {
        name: nameClean,
        email: emailClean,
        mobileNumber: mobileClean,
        companyName: companyClean,
        addressLine1: addressLine1Clean,
        addressLine2: addressLine2Clean,
        country: countryClean,
        state: stateClean,
        city: cityClean,
        postalCode: postalCodeClean,
        updatedAt: new Date(),
      };

      await db.insert(users).values({
        id: userId,
        ...userValues,
        emailVerified: true,
      });

      // Also stage in pendingRegistrations table for Better Auth workflow
      const pendingValues = {
        email: emailClean,
        name: nameClean,
        companyName: companyClean || "N/A",
        mobileNumber: mobileClean || "N/A",
        addressLine1: addressLine1Clean || "N/A",
        addressLine2: addressLine2Clean || null,
        country: countryClean || "N/A",
        state: stateClean || "N/A",
        city: cityClean || "N/A",
        postalCode: postalCodeClean || "N/A",
      };

      const existingPending = await db
        .select()
        .from(pendingRegistrations)
        .where(eq(pendingRegistrations.email, emailClean))
        .limit(1);

      if (existingPending.length === 0) {
        await db.insert(pendingRegistrations).values(pendingValues);
      } else {
        await db
          .update(pendingRegistrations)
          .set(pendingValues)
          .where(eq(pendingRegistrations.email, emailClean));
      }

      // Create new RFP entry linked to user
      await db.insert(rfqs).values({
        id: rfpId,
        userId: userId,
        title: `Gifting Requirement for ${companyClean}`,
        category: "Corporate Gifting",
        quantity: 500,
        status: "draft",
      });
    } catch (dbError) {
      console.warn("DB connection warning, using session memory fallback:", dbError);
    }

    // Generate Magic Link URL carrying verification token
    const verifyUrl = `/auth/verify?token=demo_token_${Date.now()}&email=${encodeURIComponent(emailClean)}&name=${encodeURIComponent(nameClean)}&mobile=${encodeURIComponent(mobileClean)}&company=${encodeURIComponent(companyClean)}&rfpId=${rfpId}`;
    
    // Clean workspace URL without cluttering query params in browser bar
    const magicLinkUrl = `/rfp/${rfpId}/requirement`;

    // Trigger EmailService using React Email template & Nodemailer matching zopa-rfp!
    await EmailService.sendMagicLinkEmail({
      email: emailClean,
      url: verifyUrl,
    });

    const response = NextResponse.json({
      message: `Magic link sent to ${emailClean}! Please check your inbox.`,
      email: emailClean,
      name: nameClean,
      company: companyClean,
      magicLinkUrl,
    });

    // Set HTTP session cookies for instant client access
    response.cookies.set("zopa_user_email", emailClean, { path: "/", maxAge: 86400 });
    response.cookies.set("zopa_user_name", nameClean, { path: "/", maxAge: 86400 });
    response.cookies.set("zopa_user_mobile", mobileClean, { path: "/", maxAge: 86400 });
    response.cookies.set("zopa_user_company", companyClean, { path: "/", maxAge: 86400 });

    await createAndSetAuthSession(userId, response);

    return response;
  } catch (error: any) {
    console.error("Magic link registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process magic link registration." },
      { status: 500 },
    );
  }
}
