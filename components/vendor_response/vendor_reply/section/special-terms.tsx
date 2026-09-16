import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface SpecialTermsData {
  selectedTerms?: string[];
}

interface SpecialTermsProps {
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  errors: FieldErrors<VendorReplyFormData>;
  buyerData: {
    specialTerms?: SpecialTermsData;
  };
}

export const SpecialTerms: React.FC<SpecialTermsProps> = ({
  register,
  watch,
  setValue,
  errors,
  buyerData,
}) => {
  const selectedTerms = buyerData?.specialTerms?.selectedTerms || [];

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        7. Special Terms & Conditions
      </h2>

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
          <div className="text-center py-6 border border-dashed border-gray-200 rounded-md bg-gray-50">
            <p className="text-sm text-gray-500">No special terms specified by buyer</p>
          </div>
        )}
      </div>

      {/* Agreement Section */}
      {selectedTerms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-1">
            <Label className="text-sm font-medium text-gray-700">
              Do you agree to the above special terms?
            </Label>
            <span className="text-red-500">*</span>
          </div>

          <RadioGroup
            value={watch("specialTerms.agreement") || "agree"}
            onValueChange={(value: string) =>
              setValue("specialTerms.agreement", value as "agree" | "disagree")
            }
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="agree"
                id="special-agree"
                className="border-gray-300 text-blue-600"
              />
              <Label
                htmlFor="special-agree"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Agree
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="disagree"
                id="special-disagree"
                className="border-gray-300 text-blue-600"
              />
              <Label
                htmlFor="special-disagree"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Disagree
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Remarks Section */}
      <div className="space-y-2">
        <Label
          htmlFor="specialTermsRemarks"
          className="text-sm font-medium text-gray-700"
        >
          Additional Remarks (if any)
        </Label>
        <Textarea
          id="specialTermsRemarks"
          rows={3}
          className={`w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
            errors.specialTerms?.remarks ? "border-red-500" : ""
          }`}
          placeholder="Enter any additional remarks regarding the special terms..."
          {...register("specialTerms.remarks")}
        />
        {errors.specialTerms?.remarks && (
          <p className="text-sm text-red-500">
            {errors.specialTerms.remarks.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Please provide details if you disagree with any terms or have specific
          conditions.
        </p>
      </div>
    </section>
  );
};
