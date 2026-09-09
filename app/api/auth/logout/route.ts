import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionCookie } from "better-auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const sessionToken =
      getSessionCookie(request) ||
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (sessionToken) {
      try {
        await db.delete(sessions).where(eq(sessions.token, sessionToken));
      } catch (err) {
        console.warn("DB session cleanup error during logout:", err);
      }
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    // Expire all session cookies on server response
    const cookiesToClear = [
      "better-auth.session_token",
      "__Secure-better-auth.session_token",
      "zopa_user_email",
      "zopa_user_name",
      "zopa_user_mobile",
      "zopa_user_company",
    ];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Failed to logout session" },
      { status: 500 },
    );
  }
}
