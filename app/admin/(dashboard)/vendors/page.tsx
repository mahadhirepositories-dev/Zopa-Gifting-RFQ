import React from "react";
import { db } from "@/db";
import { giftingVendors } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminVendorsPage() {
  const vendorsList = await db.select().from(giftingVendors).orderBy(desc(giftingVendors.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Registered Vendors</h1>
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-6">No vendors registered yet.</TableCell>
              </TableRow>
            ) : (
              vendorsList.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.companyName}</TableCell>
                  <TableCell>{vendor.name || "-"}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.mobileNo || "-"}</TableCell>
                  <TableCell>{vendor.city ? `${vendor.city}, ${vendor.state}` : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
