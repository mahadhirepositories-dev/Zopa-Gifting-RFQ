import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Creates a valid Better Auth session in the DB and attaches the
 * `better-auth.session_token` cookie to the NextResponse.
 */
export async function createAndSetAuthSession(
  emailOrUserId: string,
  response: NextResponse
) {
  try {
    let user;

    // Check if input is user ID or email address
    if (emailOrUserId.includes("@")) {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.email, emailOrUserId.trim().toLowerCase()))
        .limit(1);

      if (userRows.length > 0) {
        user = userRows[0];
      }
    } else {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, emailOrUserId))
        .limit(1);

      if (userRows.length > 0) {
        user = userRows[0];
      }
    }

    if (!user) {
      console.warn("Could not find user to create auth session for:", emailOrUserId);
      return null;
    }

    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Insert session into DB
    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      token: sessionToken,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-better-auth.session_token"
      : "better-auth.session_token";

    response.cookies.set(cookieName, sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60,
    });

    return sessionToken;
  } catch (error) {
    console.error("Error creating auth session:", error);
    return null;
  }
}
