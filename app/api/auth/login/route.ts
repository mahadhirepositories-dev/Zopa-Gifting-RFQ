/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, rfqs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmailService } from "@/lib/email/email-service";
import { createAndSetAuthSession } from "@/lib/auth-session";
import { upsertRfpCompany } from "@/lib/rfq-updates";
import { isWorkEmail } from "@/lib/validations/work-email";

export async function GET() {
  return NextResponse.json(
    { message: "Auth login endpoint. Please send a POST request with email to login." },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Work Email is required for Magic Link login." },
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

    // Check if user exists in DB
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: "This email is not registered. Please register first to continue.",
          isNotRegistered: true,
          email: emailClean,
        },
        { status: 400 },
      );
    }

    const user = existing[0];

    let redirectTarget = "/";

    if (user.role === "admin") {
      redirectTarget = "/admin";
    } else {
      redirectTarget = "/dashboard";
    }

    const response = NextResponse.json({
      message: `Login successful!`,
      email: emailClean,
      name: user.name,
      company: user.companyName,
      magicLinkUrl: redirectTarget,
      redirectUrl: redirectTarget,
    });

    response.cookies.set("zopa_user_email", emailClean, {
      path: "/",
      maxAge: 86400,
    });
    response.cookies.set("zopa_user_name", user.name || "", {
      path: "/",
      maxAge: 86400,
    });
    if (user.mobileNumber)
      response.cookies.set("zopa_user_mobile", user.mobileNumber, {
        path: "/",
        maxAge: 86400,
      });
    if (user.companyName)
      response.cookies.set("zopa_user_company", user.companyName, {
        path: "/",
        maxAge: 86400,
      });

    await createAndSetAuthSession(user.id, response);

    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process login." },
      { status: 500 },
    );
  }
}
