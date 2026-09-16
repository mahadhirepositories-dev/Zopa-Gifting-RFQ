/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value;
    const userEmailCookie = cookieStore.get("zopa_user_email")?.value;

    let userRecord: typeof users.$inferSelect | undefined;

    if (sessionToken) {
      const sessionRows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, sessionToken))
        .limit(1);

      if (sessionRows.length > 0 && sessionRows[0].expiresAt > new Date()) {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.id, sessionRows[0].userId))
          .limit(1);

        if (userRows.length > 0) {
          userRecord = userRows[0];
        }
      }
    }

    if (!userRecord && userEmailCookie) {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmailCookie.trim().toLowerCase()))
        .limit(1);

      if (userRows.length > 0) {
        userRecord = userRows[0];
      }
    }

    if (!userRecord) {
      return NextResponse.json(
        { success: false, role: "guest", error: "Not logged in" },
        { status: 401 }
      );
    }

    const role = (userRecord as any).role || "buyer";

    return NextResponse.json({
      success: true,
      role: role,
      userId: userRecord.id,
      email: userRecord.email,
      organization: {
        id: "default-org",
        name: userRecord.companyName || "Zopa Gifting",
        slug: "zopa-gifting",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/user/current-membership route:", error);
    return NextResponse.json(
      { success: false, role: "buyer", error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
