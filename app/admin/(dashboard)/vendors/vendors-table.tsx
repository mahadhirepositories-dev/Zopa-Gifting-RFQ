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
import { Search, Eye, Building2, Phone, Mail, MapPin, Tag, Star, Award } from "lucide-react";

interface Vendor {
  id: number | string;
  companyName: string;
  name: string | null;
  email: string;
  mobileNo: string | null;
  category: string | null;
  tags?: string | null;
  description?: string | null;
  city: string | null;
  state: string | null;
  country?: string | null;
  serviceAreas?: string | null;
  rating?: number | null;
  status: string | null;
  createdAt?: Date | string | null;
}

interface VendorsTableProps {
  initialVendors: Vendor[];
}

function ProductCell({ product }: { product: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!product) return <span className="text-slate-400 text-xs">-</span>;

  const isLong = product.length > 25;

  return (
    <div className="w-[180px] max-w-[180px] overflow-hidden">
      {!expanded ? (
        <div className="flex flex-col items-start gap-1">
          <p
            className="text-xs text-slate-700 font-medium truncate w-full"
            title={product}
          >
            {product}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer"
            >
              Show more
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1.5">
          <div className="text-xs text-slate-700 font-medium leading-relaxed max-h-32 overflow-y-auto whitespace-normal break-words bg-slate-50 p-2 rounded border border-slate-200 w-full">
            {product}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
}

export function VendorsTable({ initialVendors }: VendorsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = initialVendors.filter((vendor) => {
    const term = search.toLowerCase();
    return (
      vendor.companyName?.toLowerCase().includes(term) ||
      (vendor.name || "").toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      (vendor.mobileNo || "").toLowerCase().includes(term) ||
      (vendor.category || "").toLowerCase().includes(term) ||
      (vendor.city || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search vendors by company, contact, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredVendors.length} of {initialVendors.length} vendors
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px] min-w-[160px]">Company Name</TableHead>
              <TableHead className="w-[110px]">Category</TableHead>
              <TableHead className="w-[180px] max-w-[180px]">Product</TableHead>
              <TableHead className="w-[130px]">Contact Person</TableHead>
              <TableHead className="w-[180px]">Email</TableHead>
              <TableHead className="w-[130px]">Mobile</TableHead>
              <TableHead className="w-[140px]">Location</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-slate-500 py-10 text-sm"
                >
                  {search ? "No vendors matching your search." : "No registered vendors found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-slate-50/70">
                  <TableCell className="w-[180px] min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm truncate max-w-[130px]" title={vendor.companyName}>
                        {vendor.companyName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[110px] text-xs font-medium text-slate-600 whitespace-nowrap">
                    Gifting Items
                  </TableCell>
                  <TableCell className="w-[180px] max-w-[180px] overflow-hidden whitespace-normal align-top">
                    <ProductCell product={vendor.category} />
                  </TableCell>
                  <TableCell className="w-[130px] text-sm font-medium text-slate-700 truncate max-w-[130px]" title={vendor.name || ""}>
                    {vendor.name || "-"}
                  </TableCell>
                  <TableCell className="w-[180px] text-sm text-slate-600 truncate max-w-[180px]" title={vendor.email}>
                    {vendor.email}
                  </TableCell>
                  <TableCell className="w-[130px] text-sm text-slate-600 whitespace-nowrap">
                    {vendor.mobileNo || "-"}
                  </TableCell>
                  <TableCell className="w-[140px] text-xs text-slate-500 truncate max-w-[140px]" title={vendor.city ? `${vendor.city}, ${vendor.state || ""}` : ""}>
                    {vendor.city ? `${vendor.city}, ${vendor.state || ""}` : "-"}
                  </TableCell>
                  <TableCell className="w-[90px]">
                    <Badge
                      variant="outline"
                      className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-semibold capitalize"
                    >
                      {vendor.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[80px] text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVendor(vendor)}
                      className="text-xs gap-1.5 h-8 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vendor Details Dialog */}
      <Dialog
        open={!!selectedVendor}
        onOpenChange={(open) => !open && setSelectedVendor(null)}
      >
        {selectedVendor && (
          <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                {selectedVendor.companyName}
              </DialogTitle>
              <DialogDescription>
                Detailed corporate gifting vendor supplier profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid gap-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Contact Person
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedVendor.name || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedVendor.email}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Mobile Number
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedVendor.mobileNo || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Location
                  </span>
                  <span className="font-medium text-slate-800">
                    {[selectedVendor.city, selectedVendor.state, selectedVendor.country]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Tag className="w-4 h-4 text-slate-400" />
                    Category
                  </span>
                  <span className="font-medium text-slate-800">
                    Gifting Items
                  </span>
                </div>

                {selectedVendor.category && (
                  <div className="flex items-start justify-between gap-3 p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-500 flex items-center gap-2 font-medium shrink-0">
                      <Tag className="w-4 h-4 text-slate-400" />
                      Product
                    </span>
                    <span className="font-medium text-slate-800 text-right max-w-[280px] break-words">
                      {selectedVendor.category}
                    </span>
                  </div>
                )}

                {selectedVendor.serviceAreas && (
                  <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                    <span className="text-slate-500 flex items-center gap-2 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Service Areas
                    </span>
                    <span className="font-medium text-slate-800">
                      {selectedVendor.serviceAreas}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Rating
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedVendor.rating || 5} / 5
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Supplier Status
                  </span>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold text-[11px] capitalize">
                    {selectedVendor.status || "active"}
                  </Badge>
                </div>
              </div>

              {selectedVendor.description && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    About / Description:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedVendor.description}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
