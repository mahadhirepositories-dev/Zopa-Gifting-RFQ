import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminUser } from "@/lib/auth-session";

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser(req);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Platform administrator privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existing) {
      // If user exists, upgrade their role to admin
      await db
        .update(users)
        .set({
          role: "admin",
          name: existing.name || nameClean,
          updatedAt: new Date(),
        })
        .where(eq(users.email, emailClean));
    } else {
      // If user does not exist, insert them as admin
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        name: nameClean,
        email: emailClean,
        emailVerified: false,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add admin error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
