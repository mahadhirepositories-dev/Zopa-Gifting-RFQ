import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const authHandler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // Intercept /get-session to resolve session automatically if cookie is missing but zopa_user_email exists
  if (url.pathname.endsWith("/get-session")) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    let validSessionInDb = false;
    if (sessionCookie) {
      try {
        const activeSessions = await db
          .select()
          .from(sessions)
          .where(eq(sessions.token, sessionCookie))
          .limit(1);

        if (activeSessions.length > 0 && new Date(activeSessions[0].expiresAt) > new Date()) {
          validSessionInDb = true;
        }
      } catch (err) {
        console.warn("Error checking existing session cookie:", err);
      }
    }

    if (!validSessionInDb) {
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
            const sessionToken = crypto.randomUUID();
            const sessionId = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await db.insert(sessions).values({
              id: sessionId,
              userId: user.id,
              token: sessionToken,
              expiresAt: expiresAt,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            const sessionData = {
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
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              },
              session: {
                id: sessionId,
                userId: user.id,
                expiresAt: expiresAt,
                token: sessionToken,
              },
            };

            const isProd = process.env.NODE_ENV === "production";
            const cookieName = isProd
              ? "__Secure-better-auth.session_token"
              : "better-auth.session_token";

            const response = NextResponse.json(sessionData);
            response.cookies.set(cookieName, sessionToken, {
              path: "/",
              httpOnly: true,
              sameSite: "lax",
              secure: isProd,
              maxAge: 30 * 24 * 60 * 60,
            });
            return response;
          }
        } catch (err) {
          console.error("Error auto-establishing fallback session for get-session:", err);
        }
      }
    }
  }

  return authHandler.GET(request);
}

export async function POST(request: NextRequest) {
  return authHandler.POST(request);
}
