/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, rfqs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmailService } from "@/lib/email/email-service";
import { createAndSetAuthSession } from "@/lib/auth-session";
import { upsertRfpCompany } from "@/lib/rfq-updates";

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

    // Check if user exists in DB
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please register first.",
        },
        { status: 404 },
      );
    }

    const user = existing[0];
    let rfpId = crypto.randomUUID();

    try {
      const userRfqs = await db
        .select()
        .from(rfqs)
        .where(eq(rfqs.userId, user.id))
        .limit(1);

      if (userRfqs.length > 0) {
        rfpId = userRfqs[0].id;
      } else {
        await db.insert(rfqs).values({
          id: rfpId,
          userId: user.id,
          title: "",
          category: "Corporate Gifting",
          quantity: 500,
          status: "draft",
        });
      }
      await upsertRfpCompany(rfpId, {
        companyName: user.companyName,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
      });
    } catch (dbErr) {
      console.warn("DB RFP/company sync warning during login:", dbErr);
    }

    const verifyUrl = `/auth/verify?token=demo_token_${Date.now()}&email=${encodeURIComponent(emailClean)}&name=${encodeURIComponent(user.name)}&mobile=${encodeURIComponent(user.mobileNumber || "")}&company=${encodeURIComponent(user.companyName || "")}&rfpId=${rfpId}`;
    const magicLinkUrl = `/rfq/${rfpId}/requirement`;

    try {
      await EmailService.sendMagicLinkEmail({
        email: emailClean,
        url: verifyUrl,
      });
    } catch (emailErr) {
      console.warn("Email service warning during login:", emailErr);
    }

    const response = NextResponse.json({
      message: `Magic link sent to ${emailClean}! Please check your inbox.`,
      email: emailClean,
      name: user.name,
      company: user.companyName,
      magicLinkUrl,
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
