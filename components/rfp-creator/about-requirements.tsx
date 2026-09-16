/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  requirementSchema,
  type RequirementFieldErrors,
} from "@/lib/validations/rfq-creator-schema";

interface AboutRequirementProps {
  data: {
    projectName?: string;
    purpose?: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  errors: Record<string, string>;
  values: any;
  disabled?: boolean;
  isLoggedIn?: boolean;
  orgSlug?: string;
  companyName?: string;
}
export interface AboutRequirementsHandle {
  validate: () => boolean;
}

const PURPOSE_OPTIONS = [
  "For Employees",
  "For Clients",
  "For Senior Management",
];

export const AboutRequirements = forwardRef<
  AboutRequirementsHandle,
  AboutRequirementProps
>(({ data, onChange, errors, values, disabled, companyName }, ref) => {
  const projectName = values?.projectName || data?.projectName || "";
  const purpose = values?.purpose || data?.purpose || "";
  const registeredCompany = companyName || values?.companyName || "KG Corp";

  const validation = useMemo(() => {
    const result = requirementSchema.safeParse({ projectName, purpose });

    if (result.success) {
      return { errors: {} as RequirementFieldErrors, isValid: true };
    }

    const fieldErrors: RequirementFieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof RequirementFieldErrors;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { errors: fieldErrors, isValid: false };
  }, [projectName, purpose]);

  const [touched, setTouched] = useState<{
    projectName: boolean;
    purpose: boolean;
  }>({
    projectName: false,
    purpose: false,
  });

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        setTouched({ projectName: true, purpose: true });
        return validation.isValid;
      },
    }),
    [validation.isValid],
  );

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    if (name === "projectName" || name === "purpose") {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
    onChange(e);
  };

  const handlePurposeSelect = (selectedPurpose: string) => {
    setTouched((prev) => ({ ...prev, purpose: true }));
    // Synthesize change event
    const event = {
      target: {
        name: "purpose",
        value: selectedPurpose,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const projectNameError =
    errors.projectName ||
    (touched.projectName ? validation.errors.projectName : undefined);
  const purposeError =
    errors.purpose || (touched.purpose ? validation.errors.purpose : undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Auto-populated Registered Company Name */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registered Company Name
          </Label>
          <Input
            value={registeredCompany}
            disabled
            readOnly
            className="h-10 text-sm font-semibold border-slate-300 rounded-md bg-slate-100 text-slate-800 shadow-none cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-500">
            Automatically loaded from company registration details.
          </p>
        </div>

        {/* Project Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-800">
            Project name <span className="text-rose-500">*</span>
          </Label>
          <Input
            name="projectName"
            placeholder="e.g., Diwali Employee Gift Hampers 2026"
            value={projectName}
            onChange={handleFieldChange}
            disabled={disabled}
            className="h-10 text-sm font-mono border-slate-300 rounded-md bg-white shadow-2xs"
          />
          {projectNameError && (
            <p className="text-xs text-rose-600 font-medium">
              {projectNameError}
            </p>
          )}
        </div>

        {/* Purpose Options */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-800">
            Purpose <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PURPOSE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => handlePurposeSelect(option)}
                className={`p-3 text-left border rounded-lg transition-all text-xs font-semibold flex items-center justify-between ${
                  purpose === option
                    ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{option}</span>
                {purpose === option && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </button>
            ))}
          </div>

          <Textarea
            name="purpose"
            placeholder="Selected purpose or custom details (e.g. For Employees - Onboarding Swag Kits)"
            value={purpose}
            onChange={handleFieldChange}
            rows={3}
            disabled={disabled}
            className="text-sm font-mono border-slate-300 rounded-md bg-white shadow-2xs resize-y mt-2"
          />
          {purposeError && (
            <p className="text-xs text-rose-600 font-medium">{purposeError}</p>
          )}
        </div>
      </div>
    </div>
  );
});

AboutRequirements.displayName = "AboutRequirements";

