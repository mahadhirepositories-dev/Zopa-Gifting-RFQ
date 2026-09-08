/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SpecialTermsProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  selectedSubCategory?: number;
  disabled?: boolean;
  boqItems?: any[];
  projectName?: string;
}

export const SpecialTerms: React.FC<SpecialTermsProps> = ({
  data,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Special Terms & Clauses</h2>
        <p className="text-xs text-slate-500 mt-0.5">Include any custom conditions, NDA requirements, or quality penalties.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Special Conditions & Notes</Label>
        <Textarea
          placeholder="e.g. Sample approval required prior to mass manufacturing. 1% penalty per day of delay."
          value={data?.generalTerms || data?.specialTerms || ""}
          onChange={(e) => onChange({ ...data, generalTerms: e.target.value })}
          rows={5}
          disabled={disabled}
          className="text-xs sm:text-sm"
        />
      </div>
    </div>
  );
};
