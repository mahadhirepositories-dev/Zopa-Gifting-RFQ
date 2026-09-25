"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Search, Eye, Building, Phone, Mail, Calendar, ShieldCheck } from "lucide-react";

interface Buyer {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  mobileNumber: string | null;
  createdAt: Date | string;
  image?: string | null;
  emailVerified?: boolean | null;
}

interface BuyersTableProps {
  initialBuyers: Buyer[];
}

export function BuyersTable({ initialBuyers }: BuyersTableProps) {
  const [search, setSearch] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const filteredBuyers = initialBuyers.filter((buyer) => {
    const term = search.toLowerCase();
    return (
      buyer.name?.toLowerCase().includes(term) ||
      buyer.email?.toLowerCase().includes(term) ||
      (buyer.companyName || "").toLowerCase().includes(term) ||
      (buyer.mobileNumber || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search buyers by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredBuyers.length} of {initialBuyers.length} buyers
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[280px]">Buyer Name & Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuyers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-slate-500 py-10 text-sm"
                >
                  {search ? "No buyers matching your search." : "No registered buyers found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredBuyers.map((buyer) => {
                const initial = (buyer.name || buyer.email || "B").charAt(0).toUpperCase();
                return (
                  <TableRow key={buyer.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage src={buyer.image || undefined} alt={buyer.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {buyer.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {buyer.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {buyer.companyName || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {buyer.mobileNumber || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {buyer.createdAt ? format(new Date(buyer.createdAt), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBuyer(buyer)}
                        className="text-xs gap-1.5 h-8 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Buyer Details Dialog */}
      <Dialog open={!!selectedBuyer} onOpenChange={(open) => !open && setSelectedBuyer(null)}>
        {selectedBuyer && (
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Buyer Details
              </DialogTitle>
              <DialogDescription>
                Full registered buyer profile information.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Avatar className="h-12 w-12 border border-slate-300">
                  <AvatarImage src={selectedBuyer.image || undefined} alt={selectedBuyer.name} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-base">
                    {(selectedBuyer.name || selectedBuyer.email || "B").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-semibold text-slate-900 text-base truncate">
                    {selectedBuyer.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedBuyer.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Building className="w-4 h-4 text-slate-400" />
                    Company Name
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedBuyer.companyName || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Mobile Number
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedBuyer.mobileNumber || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Registration Date
                  </span>
                  <span className="font-medium text-slate-700">
                    {selectedBuyer.createdAt
                      ? format(new Date(selectedBuyer.createdAt), "PPP")
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verification Status
                  </span>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold text-[11px]">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
