/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface VendorSelectionProps {
  data: {
    selectionMethod?: string;
    vendorSelectionProcess?: string;
    vendorRequirements?: string[];
    additionalRequirements?: string;
  };
  onChange: (newData: any) => void;
  errors: {
    vendorSelectionProcess?: string;
    additionalRequirements?: string;
  };
  disabled?: boolean;
}

interface DbVendorSelection {
  id: number;
  methods: string;
  requirements: string;
  createdAt: Date;
  updatedAt: Date;
}

const SelectMethodSkeleton = () => (
  <div className="space-y-2">
    <Label>
      Selection Method <span className="text-destructive">*</span>
    </Label>
    <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
  </div>
);

const RequirementsSkeleton = () => (
  <div className="space-y-4">
    <Label>Vendor Requirements</Label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const VendorSelection: React.FC<VendorSelectionProps> = ({
  data,
  onChange,
  errors,
  disabled,
}) => {
  const safeData = data || {};
  const safeRequirements = Array.isArray(safeData.vendorRequirements)
    ? safeData.vendorRequirements
    : typeof safeData.vendorRequirements === "string"
      ? [safeData.vendorRequirements]
      : [];

  const defaultMethods = [
    "Lowest Price / Evaluated Cost",
    "Best Value & Quality Ratio",
    "Weighted Evaluation (Technical + Financial)",
    "Sole Source / Pre-Qualified Vendor",
    "Negotiated Selection",
  ];

  const defaultRequirements = [
    "References from similar clients",
    "Insurance coverage",
    "Compliance with industry standards",
    "Local presence",
    "Certified professionals",
    "Financial stability",
    "Previous experience in similar projects",
  ];

  const [selectionMethods, setSelectionMethods] =
    useState<string[]>(defaultMethods);
  const [commonRequirements, setCommonRequirements] =
    useState<string[]>(defaultRequirements);
  const [loading, setLoading] = useState(true);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    const fetchVendorSelectionData = async () => {
      try {
        const response = await fetch("/api/vendor-selections-frontend");
        if (response.ok) {
          const vendorData: DbVendorSelection[] = await response.json();
          if (Array.isArray(vendorData) && vendorData.length > 0) {
            const methods = [
              ...new Set(vendorData.map((item) => item.methods)),
            ].filter((method) => method && method !== "Not Specified");
            const requirements: string[] = [];
            vendorData.forEach((item) => {
              try {
                const parsedReqs = JSON.parse(item.requirements);
                if (Array.isArray(parsedReqs)) {
                  requirements.push(...parsedReqs);
                }
              } catch {
                if (item.requirements) requirements.push(item.requirements);
              }
            });
            const uniqueRequirements = [...new Set(requirements)];

            if (methods.length > 0) setSelectionMethods(methods);
            if (uniqueRequirements.length > 0)
              setCommonRequirements(uniqueRequirements);
          }
        }
      } catch (error) {
        console.warn("Using default vendor selection options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorSelectionData();
  }, []);

  const handleTextChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    onChange({ ...safeData, [name]: value });
  };

  const handleSelectionMethodChange = (value: string) => {
    onChange({ ...safeData, selectionMethod: value });
  };

  const handleRequirementToggle = (requirement: string, checked: boolean) => {
    const updatedRequirements = checked
      ? [...safeRequirements, requirement]
      : safeRequirements.filter((r) => r !== requirement);

    onChange({ ...safeData, vendorRequirements: updatedRequirements });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs font-mono text-gray-500 mb-6">
        Define the vendor selection criteria and process for this RFQ.
      </p>

      <div className="space-y-6">
        {/* Selection Method */}
        {loading ? (
          <SelectMethodSkeleton />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="selectionMethod" className="text-xs font-semibold text-black">
              Selection Method
            </Label>
            <Select
              value={safeData.selectionMethod || ""}
              onValueChange={handleSelectionMethodChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-full h-10 border border-gray-200 bg-white rounded-lg px-3 text-xs font-mono text-slate-800 shadow-2xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-gray-400">
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg z-50" position="popper">
                {selectionMethods.map((method) => (
                  <SelectItem key={method} value={method} className="text-xs font-mono">
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selection Process Description */}
        <div className="space-y-2">
          <Label htmlFor="vendorSelectionProcess" className="text-xs font-semibold text-black">
            Selection Process Description
          </Label>
          <Textarea
            id="vendorSelectionProcess"
            name="vendorSelectionProcess"
            value={safeData.vendorSelectionProcess || ""}
            onChange={handleTextChange}
            placeholder="Describe the process for selecting a vendor from submission through final selection..."
            rows={5}
            className={cn(
              "w-full border border-gray-200 bg-white rounded-lg p-3 text-xs font-mono text-slate-800 shadow-2xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-gray-400 placeholder:font-mono",
              errors?.vendorSelectionProcess &&
                "border-destructive focus-visible:ring-destructive",
            )}
            disabled={disabled}
          />
          {errors?.vendorSelectionProcess && (
            <p className="text-destructive text-xs mt-1">
              {errors.vendorSelectionProcess}
            </p>
          )}
        </div>

        {/* Vendor Requirements Checkboxes */}
        {loading ? (
          <RequirementsSkeleton />
        ) : (
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-black">
              Vendor Requirements
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              {commonRequirements.map((requirement) => {
                const isChecked = safeRequirements.includes(requirement);
                return (
                  <div
                    key={requirement}
                    className="flex items-center space-x-3 cursor-pointer py-0.5"
                    onClick={() => {
                      if (!disabled) {
                        handleRequirementToggle(requirement, !isChecked);
                      }
                    }}
                  >
                    <Checkbox
                      id={`requirement-${requirement}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleRequirementToggle(requirement, checked as boolean)
                      }
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor={`requirement-${requirement}`}
                      className="text-xs font-normal text-black cursor-pointer flex-1 select-none"
                    >
                      {requirement}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Requirements */}
        <div className="space-y-2">
          <Label htmlFor="additionalRequirements" className="text-xs font-semibold text-black">
            Additional Vendor Requirements
          </Label>
          <Textarea
            id="additionalRequirements"
            name="additionalRequirements"
            value={safeData.additionalRequirements || ""}
            onChange={handleTextChange}
            placeholder="List any other specific requirements for vendors..."
            rows={3}
            className={cn(
              "w-full border border-gray-200 bg-white rounded-lg p-3 text-xs font-mono text-slate-800 shadow-2xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-gray-400 placeholder:font-mono",
              errors?.additionalRequirements &&
                "border-destructive focus-visible:ring-destructive",
            )}
            disabled={disabled}
          />
          {errors?.additionalRequirements && (
            <p className="text-destructive text-xs mt-1">
              {errors.additionalRequirements}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
