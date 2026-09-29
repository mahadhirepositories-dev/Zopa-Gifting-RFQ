/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
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

    // Determine the redirect target based on user role
    const callbackURL = user.role === "admin" ? "/admin" : "/dashboard";

    // Send magic link email via better-auth — NO session is created here.
    // The session is only created when the user clicks the link.
    await auth.api.signInMagicLink({
      body: {
        email: emailClean,
        callbackURL,
      },
      headers: request.headers,
    });

    return NextResponse.json({
      status: "magic_link_sent",
      message: `A magic link has been sent to ${emailClean}. Please check your email and click the link to sign in.`,
      email: emailClean,
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process login." },
      { status: 500 },
    );
  }
}
