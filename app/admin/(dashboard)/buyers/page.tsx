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
import { format } from "date-fns";

export default async function AdminBuyersPage() {
  const buyersList = await db.select().from(users).where(eq(users.role, "user")).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Registered Buyers</h1>
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-6">No buyers registered yet.</TableCell>
              </TableRow>
            ) : (
              buyersList.map((buyer) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>{buyer.email}</TableCell>
                  <TableCell>{buyer.companyName || "-"}</TableCell>
                  <TableCell>{buyer.mobileNumber || "-"}</TableCell>
                  <TableCell>{format(new Date(buyer.createdAt), "PP")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
