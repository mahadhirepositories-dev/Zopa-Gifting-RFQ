/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GeneralTermsProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedSubCategory?: number;
  disabled?: boolean;
  boqItems?: any[];
  projectName?: string;
}

export const GeneralTerms: React.FC<GeneralTermsProps> = ({
  data,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">General Terms & Delivery Requirements</h2>
        <p className="text-xs text-slate-500 mt-0.5">Specify delivery timelines and standard compliance terms.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Required Delivery Timeline</Label>
          <Input
            placeholder="e.g. 15 Days from PO Release"
            value={data?.deliveryTimeValue ? `${data.deliveryTimeValue} ${data.deliveryTimeUnit || "days"}` : ""}
            onChange={(e) => onChange({ ...data, deliveryTimeValue: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Primary Delivery Location(s)</Label>
          <Input
            placeholder="e.g. Mumbai, Bangalore, Delhi"
            value={Array.isArray(data?.deliveryLocations) ? data.deliveryLocations.join(", ") : data?.deliveryLocations || ""}
            onChange={(e) => onChange({ ...data, deliveryLocations: [e.target.value] })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
