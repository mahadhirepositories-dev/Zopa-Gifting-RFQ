import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AddAdminForm } from "./add-admin-form";
import { AdminUsersTable } from "./admin-users-table";

export default async function AdminUsersPage() {
  const adminList = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Users
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Authorized platform administrators with full access to this portal.
          </p>
        </div>
        <AddAdminForm />
      </div>

      <AdminUsersTable admins={adminList} />
    </div>
  );
}
