import "dotenv/config";
import { createAndSetAuthSession } from "./lib/auth-session";
import { NextResponse } from "next/server";

async function login() {
  const mockResponse = NextResponse.json({ ok: true });
  const token = await createAndSetAuthSession("testadmin@zopapro.com", mockResponse);
  console.log("TOKEN:", token);
  process.exit(0);
}
login();
