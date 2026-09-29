/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function PUT(req: Request) {
  try {
    const adminUser = await getAdminUser(req);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Platform administrator privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, name, email } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "Admin ID, name, and email are required." },
        { status: 400 }
      );
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = name.trim();

    // Check if another user already has this email
    const [existingWithEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existingWithEmail && existingWithEmail.id !== id) {
      return NextResponse.json(
        { error: "Another user with this email address already exists." },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        name: nameClean,
        email: emailClean,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await getAdminUser(req);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Platform administrator privileges required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // ignore
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required." },
        { status: 400 }
      );
    }

    if (adminUser.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    const allAdmins = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));

    if (allAdmins.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last remaining platform administrator." },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
