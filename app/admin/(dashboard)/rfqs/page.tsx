import React from "react";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function AdminRFQsPage() {
  const rfqList = await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">All RFQs</h1>
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-6">No RFQs created yet.</TableCell>
              </TableRow>
            ) : (
              rfqList.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-medium">{rfq.title}</TableCell>
                  <TableCell>
                    <Badge variant={rfq.status === 'published' ? 'default' : 'secondary'}>
                      {rfq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rfq.category}</TableCell>
                  <TableCell>{rfq.quantity}</TableCell>
                  <TableCell>{rfq.createdAt ? format(new Date(rfq.createdAt), "PP") : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
