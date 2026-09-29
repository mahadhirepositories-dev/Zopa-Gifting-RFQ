import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

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
    
    // Always clear/update both cookie variants to prevent old session bleed
    response.cookies.set("better-auth.session_token", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set("__Secure-better-auth.session_token", sessionToken, {
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


/**
 * Resolves the authenticated user from Better Auth session, session token cookie, or email cookie
 */
export async function getSessionUser(request?: Request | any) {
  // 1. Try Better Auth getSession API first
  try {
    let reqHeaders: Headers | undefined;
    if (request?.headers && typeof request.headers.get === "function") {
      reqHeaders = request.headers;
    } else {
      reqHeaders = await headers();
    }

    if (reqHeaders) {
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });

      if (session?.user?.id) {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.id, session.user.id))
          .limit(1);

        if (userRows.length > 0) return userRows[0];
        return session.user as any;
      }
    }
  } catch (err) {
    console.warn("[getSessionUser] auth.api.getSession fallback:", err);
  }

  // 2. Try better-auth session token lookup in database
  let sessionToken: string | undefined;

  // Check request headers/cookies if request is provided
  if (request) {
    try {
      sessionToken = getSessionCookie(request) || undefined;
    } catch {
      // ignore
    }

    if (!sessionToken && typeof request.cookies?.get === "function") {
      sessionToken =
        request.cookies.get("__Secure-better-auth.session_token")?.value ||
        request.cookies.get("better-auth.session_token")?.value;
    }
  }

  // Fallback to Next.js cookies() for Server Components
  if (!sessionToken) {
    try {
      const cookieStore = await cookies();
      sessionToken =
        cookieStore.get("__Secure-better-auth.session_token")?.value ||
        cookieStore.get("better-auth.session_token")?.value;
    } catch {
      // ignore
    }
  }

  // Fallback to Next.js headers()
  if (!sessionToken) {
    try {
      const nextHeaders = await headers();
      sessionToken = getSessionCookie(nextHeaders) || undefined;
      if (!sessionToken) {
        const cookieHeader = nextHeaders.get("cookie") || "";
        const secureMatch = cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
        const standardMatch = cookieHeader.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/);
        const match = secureMatch || standardMatch;
        if (match) sessionToken = decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }

  if (sessionToken) {
    const rawToken = sessionToken.trim();
    // Strip Better Auth HMAC signature if present (format: token.signature)
    const tokenToLookup = rawToken.includes(".")
      ? rawToken.substring(0, rawToken.lastIndexOf("."))
      : rawToken;

    const activeSessions = await db
      .select()
      .from(sessions)
      .where(
        or(
          eq(sessions.token, rawToken),
          eq(sessions.token, tokenToLookup)
        )
      )
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

  // 3. Fallback: zopa_user_email cookie
  let emailCookie: string | undefined;
  try {
    if (typeof request?.cookies?.get === "function") {
      emailCookie = request.cookies.get("zopa_user_email")?.value;
    }
  } catch {
    // ignore
  }

  if (!emailCookie) {
    try {
      const cookieStore = await cookies();
      emailCookie = cookieStore.get("zopa_user_email")?.value;
    } catch {
      // ignore
    }
  }

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

/**
 * Resolves the authenticated user and verifies they have the 'admin' role.
 */
export async function getAdminUser(request?: Request | any) {
  const user = await getSessionUser(request);
  if (!user) {
    return null;
  }
  const role = String(user.role || "").toLowerCase().trim();
  if (role !== "admin" && role !== "superadmin") {
    return null;
  }
  return user;
}
