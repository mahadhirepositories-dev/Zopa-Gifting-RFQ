import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email } = body;

    if (!email || !name) {
      return new Response("Missing fields", { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
      // If user exists, just upgrade their role to admin
      await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
    } else {
      // If user does not exist, insert them as admin
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        name,
        email,
        emailVerified: false, // Since they haven't logged in yet
        role: "admin",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add admin error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
