/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, UseFormWatch, UseFormSetValue, UseFormTrigger, UseFormClearErrors, FieldErrors } from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface EvaluationCriteriaProps {
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  trigger: UseFormTrigger<VendorReplyFormData>;
  clearErrors: UseFormClearErrors<VendorReplyFormData>;
  errors: FieldErrors<VendorReplyFormData>;
  buyerData: {
    evaluation?: string[];
    evaluationCriteria?: any[];
  };
}

export const EvaluationCriteria: React.FC<EvaluationCriteriaProps> = ({
  register,
  watch,
  setValue,
  trigger,
  clearErrors,
  errors,
  buyerData,
}) => {
  const criteriaList = buyerData?.evaluation || buyerData?.evaluationCriteria || [];

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        4. Evaluation Criteria
      </h2>

      <div className="overflow-x-auto max-w-4xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100">
                Criteria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100 w-[22%]">
                Compliance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100 w-[40%]">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {criteriaList.map((criteriaItem: any, index: number) => {
              const criteriaName = typeof criteriaItem === "string" ? criteriaItem : criteriaItem?.name || criteriaItem?.criteria || `Criteria ${index + 1}`;
              const complianceValue = watch(`evaluation.${index}.value`);
              const showRemarks = complianceValue === "No";
              const hasError = errors.evaluation?.[index]?.value;

              return (
                <tr key={index}>
                  {/* Criteria */}
                  <td className="px-3 py-2 border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {criteriaName}
                    </p>
                  </td>

                  {/* Compliance */}
                  <td className="px-3 py-2 border border-gray-200">
                    <Select
                      value={watch(`evaluation.${index}.value`) || ""}
                      onValueChange={(value) => {
                        setValue(`evaluation.${index}.value`, value);

                        if (value === "Yes") {
                          setValue(`evaluation.${index}.remarks`, "");
                          clearErrors(`evaluation.${index}.remarks`);
                        }

                        trigger(`evaluation.${index}.value`);
                        if (value === "No") {
                          trigger(`evaluation.${index}.remarks`);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`w-full bg-blue-50 border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                          hasError ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError && (
                      <p className="text-red-500 text-xs mt-1">
                        Compliance is required
                      </p>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="px-3 py-2 border border-gray-200">
                    {showRemarks ? (
                      <Input
                        type="text"
                        {...register(`evaluation.${index}.remarks`, {
                          required: showRemarks
                            ? "Remarks required when Compliance is No"
                            : false,
                        })}
                        className={`w-full py-2 px-3 border border-blue-300 bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                          errors.evaluation?.[index]?.remarks
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="Enter remarks"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                    {errors.evaluation?.[index]?.remarks && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.evaluation[index]?.remarks?.message}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
