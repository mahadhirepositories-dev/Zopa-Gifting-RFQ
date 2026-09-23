import { NextResponse } from "next/server";
import { createAndSetAuthSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const mobile = searchParams.get("mobile") || "";
  const company = searchParams.get("company") || "";
  const rfpId = searchParams.get("rfpId") || "074db83b-2fe4-4978-874c-a2d34e269a7c";

  // Clean Target RFP creation URL without query strings
  const targetUrl = new URL(`/rfq/${rfpId}/requirement`, request.url);
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
