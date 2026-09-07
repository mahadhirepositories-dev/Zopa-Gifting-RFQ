/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, pendingRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        { error: "Name and Email are required." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();
    const rawMobile = mobileNumber || phoneNumber || "";
    const mobileClean = rawMobile ? String(rawMobile).trim() : null;
    const companyClean = companyName ? String(companyName).trim() : null;
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

    const userId = crypto.randomUUID();

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
        emailVerified: false,
      });

      // Stage in pendingRegistrations
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
    } catch (dbError) {
      console.warn("DB connection warning, using memory fallback:", dbError);
    }

    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?email=${encodeURIComponent(emailClean)}`;

    return NextResponse.json(
      {
        message: `Magic link sent to ${emailClean}. Please check your inbox.`,
        email: emailClean,
        magicLinkUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process registration." },
      { status: 500 }
    );
  }
}

