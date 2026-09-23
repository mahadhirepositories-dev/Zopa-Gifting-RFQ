/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CombinedCompanyContactProps {
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  values: any;
  disabled?: boolean;
  rfpId?: string | null;
}

export const CombinedCompanyContact: React.FC<CombinedCompanyContactProps> = ({
  data,
  onChange,
  errors,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Company & Contact Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">Enter your organization details for vendor quotes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Company Name <span className="text-rose-500">*</span></Label>
          <Input
            name="name"
            placeholder="e.g. Acme Corp"
            value={data?.companyName || data?.name || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Contact Person Name</Label>
          <Input
            name="contactName"
            placeholder="e.g. John Doe"
            value={data?.contactName || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Work Email <span className="text-rose-500">*</span></Label>
          <Input
            name="contactEmail"
            type="email"
            placeholder="john@company.com"
            value={data?.contactEmail || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Phone Number</Label>
          <Input
            name="contactPhone"
            placeholder="+91 9876543210"
            value={data?.contactPhone || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Address Line 1</Label>
          <Input
            name="addressLine1"
            placeholder="Street address or P.O. Box"
            value={data?.companyAddressLine1 || data?.addressLine1 || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Client Type</Label>
          <Input
            name="businessType"
            placeholder="e.g. Retail Store, IT Services, Manufacturing"
            value={data?.businessType ?? ""}
            onChange={onChange}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
