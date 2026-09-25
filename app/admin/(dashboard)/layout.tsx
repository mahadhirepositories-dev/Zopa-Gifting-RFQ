import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  let session = await auth.api.getSession({
    headers: reqHeaders,
  });

  // Fallback: If auth.api.getSession is null, inspect cookie and database
  if (!session || !session.user) {
    const cookieHeader = reqHeaders.get("cookie") || "";
    const sessionTokenMatch = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
    const rawToken = sessionTokenMatch ? decodeURIComponent(sessionTokenMatch[1]) : null;

    if (rawToken) {
      const tokenToLookup = rawToken.includes(".")
        ? rawToken.substring(0, rawToken.lastIndexOf("."))
        : rawToken;

      const activeSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, tokenToLookup))
        .limit(1);

      if (activeSessions.length > 0 && new Date(activeSessions[0].expiresAt) > new Date()) {
        const userRows = await db
          .select()
          .from(users)
          .where(eq(users.id, activeSessions[0].userId))
          .limit(1);

        if (userRows.length > 0) {
          session = {
            user: userRows[0],
            session: activeSessions[0],
          } as any;
        }
      }
    }
  }

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    // If they are logged in but not an admin, redirect them out
    redirect("/");
  }

  const adminUser = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar user={adminUser} />
        <main className="flex-1 overflow-y-auto">
          <AdminHeader user={adminUser} />
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
