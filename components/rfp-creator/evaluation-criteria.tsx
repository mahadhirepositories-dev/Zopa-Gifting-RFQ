/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";

interface EvaluationCriteriaProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const EvaluationCriteria: React.FC<EvaluationCriteriaProps> = ({
  data,
  onChange,
  disabled,
}) => {
  const criteriaList = [
    { key: "pricingWeight", label: "Commercial / Pricing Weightage", default: "50%" },
    { key: "qualityWeight", label: "Sample Quality & Packaging Weightage", default: "30%" },
    { key: "timelineWeight", label: "Delivery Timeline Weightage", default: "20%" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Evaluation Criteria</h2>
        <p className="text-xs text-slate-500 mt-0.5">Define how vendor bids will be scored and compared.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {criteriaList.map((c) => (
          <div key={c.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <Label className="text-xs font-bold text-slate-700">{c.label}</Label>
            <input
              type="text"
              defaultValue={data?.[c.key] || c.default}
              onChange={(e) => onChange({ ...(data || {}), [c.key]: e.target.value })}
              disabled={disabled}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
