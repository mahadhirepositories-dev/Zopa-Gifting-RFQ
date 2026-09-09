import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(
  ip: string,
  windowMs = 5 * 60 * 1000,
  maxRequests = 30,
): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (time) => now - time < windowMs,
  );

  if (timestamps.length >= maxRequests) {
    return false; 
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true; 
}


function getAuthToken(request: NextRequest): string | undefined {
  return (
    getSessionCookie(request) ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}


export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestId = crypto.randomUUID();


  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  if (
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/register-magic-link" ||
    pathname === "/api/auth/sign-in/magic-link"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkRateLimit(ip, 5 * 60 * 1000, 30)) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "Too many authentication attempts. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            "Retry-After": "300",
          },
        },
      );
    }
  }

  // 3. Check authentication status
  const authToken = getAuthToken(request);
  const isAuthenticated = Boolean(authToken);

  // 4. Identify Public and Protected Routes
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth/verify") ||
    pathname.startsWith("/vendor-registration") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/public/");

  const isProtectedPage =
    pathname.startsWith("/rfp") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/select-organization");

  const isProtectedApiRoute = pathname.startsWith("/api/") && !isPublicRoute;

  // 5. Guard Protected API Routes (Return 401 JSON)
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication required. Please log in to access this API.",
      },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
      },
    );
  }

  // 6. Guard Protected Page Routes (Redirect to login)
  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("mode", "login");
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Redirect Authenticated Users visiting homepage or login page directly to Category step
  if (isAuthenticated && (pathname === "/" || pathname === "/login")) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl.startsWith("/") && callbackUrl !== "/") {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    const defaultRfpId = "09ed3409-08c3-4af6-96e8-3ea87eb451cf";
    return NextResponse.redirect(
      new URL(`/rfp/${defaultRfpId}/category`, request.url),
    );
  }

  // 8. Forward request with tracking and security headers
  const response = NextResponse.next();
  response.headers.set("X-Request-ID", requestId);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("x-authenticated", isAuthenticated ? "true" : "false");

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
