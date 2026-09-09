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
}
export interface AboutRequirementsHandle {
  validate: () => boolean;
}

export const AboutRequirements = forwardRef<
  AboutRequirementsHandle,
  AboutRequirementProps
>(({ data, onChange, errors, values, disabled }, ref) => {
  const projectName = values?.projectName || data?.projectName || "";
  const purpose = values?.purpose || data?.purpose || "";

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

  const projectNameError =
    errors.projectName ||
    (touched.projectName ? validation.errors.projectName : undefined);
  const purposeError =
    errors.purpose || (touched.purpose ? validation.errors.purpose : undefined);

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

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-800">
            Purpose <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            name="purpose"
            placeholder="e.g., Upgrading existing network infrastructure to support remote work capabilities"
            value={purpose}
            onChange={handleFieldChange}
            rows={4}
            disabled={disabled}
            className="text-sm font-mono border-slate-300 rounded-md bg-white shadow-2xs resize-y"
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
