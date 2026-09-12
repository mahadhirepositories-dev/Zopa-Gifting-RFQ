/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SingleSelectOptimized } from "@/components/single-select-optimized";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface DispatchLocation {
  name: string;
  state: string;
  latitude: string;
  longitude: string;
}

const parseDispatchLocation = (cityValue: string): DispatchLocation | null => {
  const parts = cityValue.split("|");
  if (parts.length === 4) {
    return {
      name: parts[0],
      state: parts[1],
      latitude: parts[2],
      longitude: parts[3],
    };
  }
  return null;
};

interface GeneralTermsData {
  deliveryTimeValue?: number;
  deliveryTimeUnit?: string;
  deliveryLocations?: string[];
  selectedTerms?: string[];
}

interface GeneralTermsProps {
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  errors: FieldErrors<VendorReplyFormData>;
  buyerData: {
    generalTerms?: GeneralTermsData;
  };
  citiesOptions: { value: string; label: string }[];
  priorityCities: string[];
  loadingCities: boolean;
}

export const GeneralTerms: React.FC<GeneralTermsProps> = ({
  register,
  watch,
  setValue,
  errors,
  buyerData,
  citiesOptions,
  loadingCities,
}) => {
  const selectedTerms = buyerData?.generalTerms?.selectedTerms || [];

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        6. General Terms & Conditions
      </h2>

      {/* Delivery Information Section */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery TAT Column */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Delivery TAT (Turn Around Time)
              </Label>
              <div className="p-3 bg-white border border-gray-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    RFQ Requirement:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {buyerData?.generalTerms?.deliveryTimeValue ?? "N/A"}{" "}
                    {buyerData?.generalTerms?.deliveryTimeUnit ?? ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label className="text-sm font-medium text-gray-700">
                  Your Proposed Delivery Time
                </Label>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  className={`w-24 text-center bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                    errors.generalTerms?.deliveryTimeValue
                      ? "border-red-500"
                      : ""
                  }`}
                  min="1"
                  placeholder="0"
                  {...register("generalTerms.deliveryTimeValue", {
                    valueAsNumber: true,
                    required: "Proposed delivery time is required",
                    validate: (value) => {
                      if (typeof value !== "number" || isNaN(value)) {
                        return "Must be a valid number";
                      }
                      if (value <= 0) {
                        return "Value must be greater than 0";
                      }
                      return true;
                    },
                  })}
                />
                <span className="text-sm font-medium text-gray-600">
                  {buyerData?.generalTerms?.deliveryTimeUnit ?? "days"}
                </span>
              </div>
              {errors.generalTerms?.deliveryTimeValue && (
                <p className="text-sm text-red-500">
                  {errors.generalTerms.deliveryTimeValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Location Column */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Delivery Location (RFQ Requirement):
              </Label>
              <span className="text-sm font-semibold text-gray-900">
                {buyerData?.generalTerms?.deliveryLocations?.length
                  ? buyerData.generalTerms.deliveryLocations.map(
                      (location: any, index: number) => (
                        <Badge key={index} className="mr-2">
                          {typeof location === "object" && location.name
                            ? `${location.name}, ${location.state}`
                            : location}
                        </Badge>
                      )
                    )
                  : "Not specified"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label className="text-sm font-medium text-gray-700">
                  Your Dispatch Location
                </Label>
                <span className="text-red-500">*</span>
              </div>

              {loadingCities ? (
                <div className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-md">
                  <span className="text-sm text-gray-500">
                    Loading cities...
                  </span>
                </div>
              ) : (
                <SingleSelectOptimized
                  options={citiesOptions}
                  onValueChange={(selectedCity: string) => {
                    const location = parseDispatchLocation(selectedCity);
                    setValue("generalTerms.dispatchLocation", (location || selectedCity) as any, {
                      shouldValidate: true,
                    });
                  }}
                  defaultValue={(() => {
                    const dispatchLoc = watch(
                      "generalTerms.dispatchLocation"
                    ) as any;
                    if (!dispatchLoc) return "";

                    if (typeof dispatchLoc === "string") return dispatchLoc;

                    if (typeof dispatchLoc === "object" && dispatchLoc.name) {
                      return `${dispatchLoc.name}|${dispatchLoc.state}|${dispatchLoc.latitude}|${dispatchLoc.longitude}`;
                    }

                    return "";
                  })()}
                  placeholder="Select Dispatch Location"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms List */}
      <div className="space-y-3">
        {selectedTerms.length > 0 ? (
          <div className="space-y-3">
            {selectedTerms.map((term, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200 shadow-sm"
              >
                <div className="shrink-0 mt-1">
                  <span className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">
                  {term.trim()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. Agent or middleman not authorized unless specified.</p>
            <p>2. All products supplied must be brand new and in working condition.</p>
            <p>3. Right to cancel or modify order if terms are violated.</p>
          </div>
        )}
      </div>

      {/* Agreement Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-1">
          <Label className="text-sm font-medium text-gray-700">
            Do you agree to the above general terms & conditions?
          </Label>
          <span className="text-red-500">*</span>
        </div>

        <RadioGroup
          value={watch("generalTerms.agreement") || "agree"}
          onValueChange={(value: string) =>
            setValue("generalTerms.agreement", value as "agree" | "disagree")
          }
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="agree"
              id="general-agree"
              className="border-gray-300 text-blue-600"
            />
            <Label
              htmlFor="general-agree"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Agree
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="disagree"
              id="general-disagree"
              className="border-gray-300 text-blue-600"
            />
            <Label
              htmlFor="general-disagree"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Disagree
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Remarks Section */}
      <div className="space-y-2">
        <Label
          htmlFor="generalTermsRemarks"
          className="text-sm font-medium text-gray-700"
        >
          Alternate General Terms / Remarks (if any)
        </Label>
        <Textarea
          id="generalTermsRemarks"
          rows={3}
          className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          placeholder="Enter any additional remarks regarding the general terms..."
          {...register("generalTerms.remarks")}
        />
      </div>
    </section>
  );
};
