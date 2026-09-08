/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FinancialsProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  disabled?: boolean;
}

export const Financials: React.FC<FinancialsProps> = ({
  data,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Financials & Budget</h2>
        <p className="text-xs text-slate-500 mt-0.5">Specify estimated budget limits and payment terms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Minimum Estimated Budget</Label>
          <Input
            placeholder="e.g. ₹5,00,000"
            value={data?.budgetMin || ""}
            onChange={(e) => onChange({ ...data, budgetMin: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Maximum Estimated Budget</Label>
          <Input
            placeholder="e.g. ₹10,00,000"
            value={data?.budgetMax || ""}
            onChange={(e) => onChange({ ...data, budgetMax: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Currency</Label>
          <Input
            placeholder="INR (₹)"
            value={data?.currency || "INR"}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Payment Terms</Label>
          <Input
            placeholder="e.g. 50% Advance, 50% on Delivery"
            value={data?.paymentTerms || data?.paymentTerm || ""}
            onChange={(e) => onChange({ ...data, paymentTerms: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
