/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Label } from "@/components/ui/label";

interface VendorSelectionProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const VendorSelection: React.FC<VendorSelectionProps> = ({
  data,
  onChange,
  disabled,
}) => {
  const methods = [
    { id: "all", title: "Open Bidding", desc: "Share RFQ with all verified corporate gifting vendors" },
    { id: "invite", title: "Invite Only", desc: "Share RFQ only with specific selected vendors" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Vendor Selection Mode</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select how you want to invite vendors to bid on this RFQ.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map((m) => {
          const isSelected = data?.selectionMethod === m.id || (!data?.selectionMethod && m.id === "all");

          return (
            <div
              key={m.id}
              onClick={() => !disabled && onChange({ ...data, selectionMethod: m.id })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <Label className="text-sm font-bold text-slate-900 cursor-pointer">{m.title}</Label>
              </div>
              <p className="text-xs text-slate-500 mt-2">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
