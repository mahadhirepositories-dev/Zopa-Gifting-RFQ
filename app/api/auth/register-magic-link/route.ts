/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, pendingRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { isWorkEmail } from "@/lib/validations/work-email";

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
    if (!isWorkEmail(emailClean)) {
      return NextResponse.json(
        {
          error: "Please enter a valid work email address. Personal domains (Gmail, Yahoo, Outlook, etc.) are not allowed.",
        },
        { status: 400 },
      );
    }
    const nameClean = name.trim();
    const rawMobile = mobileNumber || phoneNumber || "";
    const mobileClean = rawMobile ? String(rawMobile).trim() : null;
    const companyClean = companyName ? String(companyName).trim() : "KG Corp";
    const addressLine1Clean = addressLine1 ? String(addressLine1).trim() : null;
    const addressLine2Clean = addressLine2 ? String(addressLine2).trim() : null;
    const countryClean = formatLocationField(country) || null;
    const stateClean = formatLocationField(state) || null;
    const cityClean = formatLocationField(city) || null;
    const postalCodeClean = postalCode ? String(postalCode).trim() : null;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "This email is already registered. Please log in to continue.",
          isAlreadyRegistered: true,
          email: emailClean,
        },
        { status: 400 },
      );
    }

    // Stage the registration data in pendingRegistrations.
    // When the user clicks the magic link, better-auth creates the user
    // and the databaseHooks.user.create.before hook in lib/auth.ts
    // merges this staged data into the new user record.
    try {
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
      console.warn(
        "DB connection warning, pending registration staging failed:",
        dbError,
      );
    }

    // Send magic link email via better-auth — NO session is created here.
    // The user account and session are only created when the link is clicked.
    // better-auth will auto-create the user (disableSignUp is not set), and
    // the databaseHooks.user.create.before hook merges the pending data.
    await auth.api.signInMagicLink({
      body: {
        email: emailClean,
        name: nameClean,
        callbackURL: "/dashboard",
      },
      headers: request.headers,
    });

    return NextResponse.json({
      status: "magic_link_sent",
      message: `A magic link has been sent to ${emailClean}. Please check your email and click the link to complete registration.`,
      email: emailClean,
      name: nameClean,
      company: companyClean,
    });
  } catch (error: any) {
    console.error("Magic link registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process magic link registration." },
      { status: 500 },
    );
  }
}
