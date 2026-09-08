/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RFPDatesProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  rfpId?: string;
  isEditMode?: boolean;
}

export const RFPDates: React.FC<RFPDatesProps> = ({
  data,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">RFP Key Dates & Deadlines</h2>
        <p className="text-xs text-slate-500 mt-0.5">Set start date and bid submission deadline for vendors.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">RFQ Issue Date</Label>
          <Input
            type="date"
            value={data?.startDate || ""}
            onChange={(e) => onChange({ ...data, startDate: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Bid Submission Deadline</Label>
          <Input
            type="date"
            value={data?.endDate || ""}
            onChange={(e) => onChange({ ...data, endDate: e.target.value })}
            disabled={disabled}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
