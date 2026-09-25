import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { AddAdminForm } from "./add-admin-form";
import { Shield } from "lucide-react";

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

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[320px]">Admin Name & Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-slate-500 py-10 text-sm"
                >
                  No admin users found.
                </TableCell>
              </TableRow>
            ) : (
              adminList.map((admin) => {
                const initial = (admin.name || admin.email || "A")
                  .charAt(0)
                  .toUpperCase();
                return (
                  <TableRow key={admin.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage
                            src={admin.image || undefined}
                            alt={admin.name}
                          />
                          <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {admin.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {admin.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[11px] font-semibold"
                      >
                        <Shield className="w-3 h-3 text-blue-600" />
                        Administrator
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {admin.createdAt
                        ? format(new Date(admin.createdAt), "dd MMM yyyy")
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
