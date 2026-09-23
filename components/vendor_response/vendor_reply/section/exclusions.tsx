import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface SpecialNoteToBuyerProps {
  register: UseFormRegister<VendorReplyFormData>;
  errors?: FieldErrors<VendorReplyFormData>;
  title?: string;
  description?: string;
  placeholder?: string;
}

export const SpecialNoteToBuyer: React.FC<SpecialNoteToBuyerProps> = ({
  register,
  errors,
  title = "8. Special Note to Buyer",
  description = "Please provide any additional information or special notes you'd like to share with the buyer.",
  placeholder = "Enter any special notes or additional information for the buyer..."
}) => {
  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {title}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="otherInformation" className="block text-sm font-medium text-gray-700">
          Special Notes
        </Label>

        <Textarea
          id="otherInformation"
          rows={4}
          placeholder={placeholder}
          className={`w-full ${errors?.otherInformation ? "border-red-500" : ""}`}
          {...register("otherInformation" as any)}
        />

        {errors?.otherInformation && (
          <p className="text-sm text-red-500">
            {errors.otherInformation.message}
          </p>
        )}

        <p className="text-xs text-gray-500">
          {description}
        </p>
      </div>
    </section>
  );
};
