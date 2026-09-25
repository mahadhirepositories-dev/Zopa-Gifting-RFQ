import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const authHandler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // If this is /get-session, support both native Better Auth sessions and buyer DB sessions
  if (url.pathname.endsWith("/get-session")) {
    try {
      const response = await authHandler.GET(request);
      if (response && response.status === 200) {
        const cloned = response.clone();
        try {
          const body = await cloned.json();
          if (body && body.user) {
            return response;
          }
        } catch {
          // If JSON parse fails, continue to fallback
        }
      }
    } catch (err) {
      console.warn("Better Auth get-session check:", err);
    }

    // Fallback: Check custom session token in database
    const sessionCookie =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (sessionCookie) {
      try {
        const rawToken = sessionCookie.includes(".")
          ? sessionCookie.substring(0, sessionCookie.lastIndexOf("."))
          : sessionCookie;

        const activeSessions = await db
          .select()
          .from(sessions)
          .where(eq(sessions.token, rawToken))
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

          if (userRows.length > 0) {
            const user = userRows[0];
            return NextResponse.json({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                mobileNumber: user.mobileNumber,
                companyName: user.companyName,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2,
                country: user.country,
                state: user.state,
                city: user.city,
                postalCode: user.postalCode,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              },
              session: {
                id: activeSessions[0].id,
                userId: user.id,
                expiresAt: activeSessions[0].expiresAt,
                token: activeSessions[0].token,
              },
            });
          }
        }
      } catch (err) {
        console.warn("DB session fallback error:", err);
      }
    }

    // Fallback: Check zopa_user_email cookie
    const emailCookie = request.cookies.get("zopa_user_email")?.value;
    if (emailCookie) {
      try {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.email, emailCookie.trim().toLowerCase()))
          .limit(1);

        if (userRows.length > 0) {
          const user = userRows[0];
          return NextResponse.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              mobileNumber: user.mobileNumber,
              companyName: user.companyName,
              addressLine1: user.addressLine1,
              addressLine2: user.addressLine2,
              country: user.country,
              state: user.state,
              city: user.city,
              postalCode: user.postalCode,
              image: user.image,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            session: {
              id: "fallback-session",
              userId: user.id,
              expiresAt: new Date(Date.now() + 86400000),
              token: "fallback-token",
            },
          });
        }
      } catch (err) {
        console.warn("Email cookie fallback error:", err);
      }
    }

    return NextResponse.json(null);
  }

  return authHandler.GET(request);
}

export async function POST(request: NextRequest) {
  return authHandler.POST(request);
}

