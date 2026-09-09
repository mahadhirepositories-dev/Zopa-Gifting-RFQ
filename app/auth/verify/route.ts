import { NextResponse } from "next/server";
import { createAndSetAuthSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const mobile = searchParams.get("mobile") || "";
  const company = searchParams.get("company") || "";
  const rfpId = searchParams.get("rfpId") || "09ed3409-08c3-4af6-96e8-3ea87eb451cf";

  // Clean Target RFP creation URL without query strings
  const targetUrl = new URL(`/rfp/${rfpId}/category`, request.url);
  const response = NextResponse.redirect(targetUrl);

  // Store session cookies for seamless user experience
  if (email) response.cookies.set("zopa_user_email", email, { path: "/", maxAge: 86400 });
  if (name) response.cookies.set("zopa_user_name", name, { path: "/", maxAge: 86400 });
  if (mobile) response.cookies.set("zopa_user_mobile", mobile, { path: "/", maxAge: 86400 });
  if (company) response.cookies.set("zopa_user_company", company, { path: "/", maxAge: 86400 });

  if (email) {
    await createAndSetAuthSession(email, response);
  }

  return response;
}
