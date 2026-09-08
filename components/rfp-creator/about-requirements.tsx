/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AboutRequirementProps {
  data: {
    projectName?: string;
    purpose?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  values: any;
  disabled?: boolean;
  isLoggedIn?: boolean;
  orgSlug?: string;
}

export const AboutRequirements: React.FC<AboutRequirementProps> = ({
  data,
  onChange,
  errors,
  values,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-800">
            Project name <span className="text-rose-500">*</span>
          </Label>
          <Input
            name="projectName"
            placeholder="e.g., Office Network Upgrade Project"
            value={values?.projectName || data?.projectName || ""}
            onChange={onChange}
            disabled={disabled}
            className="h-10 text-sm font-mono border-slate-300 rounded-md bg-white shadow-2xs"
          />
          {errors.projectName && (
            <p className="text-xs text-rose-600 font-medium">{errors.projectName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-800">
            Purpose <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            name="purpose"
            placeholder="e.g., Upgrading existing network infrastructure to support remote work capabilities"
            value={data?.purpose || ""}
            onChange={onChange}
            rows={4}
            disabled={disabled}
            className="text-sm font-mono border-slate-300 rounded-md bg-white shadow-2xs resize-y"
          />
          {errors.purpose && (
            <p className="text-xs text-rose-600 font-medium">{errors.purpose}</p>
          )}
        </div>
      </div>
    </div>
  );
};
