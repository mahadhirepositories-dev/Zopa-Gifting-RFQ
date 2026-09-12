/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormTrigger,
  UseFormClearErrors,
  FieldErrors,
} from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface BOQItem {
  id: string;
  description: string;
  specification: string;
  qty: string;
  uom: string;
  targetPrice: string;
  isVisible: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

interface Financials {
  currency: string;
}

interface BuyerData {
  boq?: BOQItem[];
  financials?: Financials;
}

interface ItemTotals {
  itemTotal: number;
  itemGST: number;
  grandTotal: number;
  gstPercentage: number;
}

interface OverallTotals {
  subTotal: number;
  totalGST: number;
  grandTotal: number;
}

interface BOQSectionProps {
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  trigger: UseFormTrigger<VendorReplyFormData>;
  clearErrors: UseFormClearErrors<VendorReplyFormData>;
  errors: FieldErrors<VendorReplyFormData>;
  buyerData: BuyerData;
  itemTotals: ItemTotals[];
  expandedSpecs: Record<number, boolean>;
  toggleSpecification: (index: number) => void;
  calculateItemTotal: (index: number) => ItemTotals;
  overallTotals: OverallTotals;
  getCurrencySymbol: (currencyCode: string) => string;
  safeParseFloat: (value: string | number) => number;
  calculationTrigger: number;
  setCalculationTrigger: React.Dispatch<React.SetStateAction<number>>;
  getGSTMessage: () => string | null;
  vendorBoqAttachments: Record<number, { url: string; name: string } | null>;
  onBoqAttachmentUpload: (index: number, file: File) => Promise<void>;
  onBoqAttachmentRemove: (index: number) => void;
}

export const BOQSection: React.FC<BOQSectionProps> = ({
  register,
  watch,
  setValue,
  errors,
  buyerData,
  itemTotals,
  expandedSpecs,
  toggleSpecification,
  overallTotals,
  getCurrencySymbol,
  safeParseFloat,
  setCalculationTrigger,
  getGSTMessage,
  vendorBoqAttachments,
  onBoqAttachmentUpload,
  onBoqAttachmentRemove,
}) => {
  const currencySymbol = getCurrencySymbol(
    buyerData?.financials?.currency || "INR"
  );
  const showTargetPrice = buyerData?.boq?.some((item: any) => item.isVisible) ?? false;
  const footerColspan = showTargetPrice ? 6 : 5;

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">3. BOQ/BOM</h2>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1600px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '280px' }}>
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '90px' }}>
                Qty
              </th>
              {showTargetPrice && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '150px' }}>
                  Target Price
                  <br />
                  (Per Unit excl Tax)
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '160px' }}>
                Your Quote
                <br />
                price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '110px' }}>
                GST %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '150px' }}>
                Item Total
                <br />
                (Incl. GST)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '180px' }}>
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '130px' }}>
                Compliance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '200px' }}>
                Remarks
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100" style={{ minWidth: '200px' }}>
                Attachments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buyerData?.boq?.map((item: any, index: number) => {
              const currentItemTotals = itemTotals[index] || {
                itemTotal: 0,
                itemGST: 0,
                grandTotal: 0,
                gstPercentage: 0,
              };

              return (
                <tr key={item.id || index}>
                  {/* Description */}
                  <td className="px-4 py-3 border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {item.description}
                      </p>
                      {typeof item.specification === "string" &&
                      item.specification.length > 100 ? (
                        <div>
                          <p className="text-sm text-gray-500 whitespace-pre-line break-words">
                            {expandedSpecs[index]
                              ? item.specification
                              : `${item.specification.slice(0, 100)}...`}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleSpecification(index)}
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 font-medium cursor-pointer"
                          >
                            {expandedSpecs[index] ? "Show Less" : "Show More"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 whitespace-pre-line break-words">
                          {item.specification}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Qty & UOM */}
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 font-medium">
                        {item.qty || "0"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.uom || "EA"}
                      </p>
                    </div>
                  </td>

                  {/* Target Price (conditional) */}
                  {showTargetPrice && (
                    <td className="px-4 py-3 border border-gray-200">
                      {item.isVisible ? (
                        <p className="text-sm text-gray-900 font-medium">
                          {currencySymbol}
                          {Number(item.targetPrice || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </td>
                  )}

                  {/* Your Quote Price */}
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`boqDetails.${index}.quotePrice`, {
                          required: "Quote Price is required",
                          setValueAs: (value) => safeParseFloat(value),
                        })}
                        onChange={(e) => {
                          const value = safeParseFloat(e.target.value);
                          setValue(`boqDetails.${index}.quotePrice`, value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setCalculationTrigger((prev) => prev + 1);
                        }}
                        className={`w-full pl-8 py-2 bg-blue-50 border border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                          errors.boqDetails?.[index]?.quotePrice
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.boqDetails?.[index]?.quotePrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.boqDetails[index]?.quotePrice?.message}
                      </p>
                    )}
                  </td>

                  {/* GST % */}
                  <td className="px-4 py-3 border border-gray-200">
                    <Select
                      value={watch(`boqDetails.${index}.gst`)?.toString() || "0"}
                      onValueChange={(value) => {
                        const numericValue = safeParseFloat(value);
                        setValue(`boqDetails.${index}.gst`, numericValue, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setCalculationTrigger((prev) => prev + 1);
                      }}
                    >
                      <SelectTrigger className="w-full bg-blue-50 border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
                        <SelectValue placeholder="0%" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Item Total (Incl GST) */}
                  <td className="px-4 py-3 border border-gray-200 bg-gray-50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {currencySymbol}
                        {currentItemTotals.grandTotal.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  </td>

                  {/* Details (Make & Model) */}
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Make"
                        {...register(`boqDetails.${index}.make`)}
                        className="w-full text-xs py-1.5 px-2.5 border-gray-200 focus:border-blue-500"
                      />
                      <Input
                        type="text"
                        placeholder="Model"
                        {...register(`boqDetails.${index}.model`)}
                        className="w-full text-xs py-1.5 px-2.5 border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </td>

                  {/* Compliance */}
                  <td className="px-4 py-3 border border-gray-200">
                    <Select
                      value={watch(`boqDetails.${index}.compliance`) || "Complied"}
                      onValueChange={(val) => setValue(`boqDetails.${index}.compliance`, val)}
                    >
                      <SelectTrigger className="w-full bg-blue-50 border border-blue-300 text-xs">
                        <SelectValue placeholder="Complied" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Complied">Complied</SelectItem>
                        <SelectItem value="Deviated">Deviated</SelectItem>
                        <SelectItem value="Not Complied">Not Complied</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Remarks */}
                  <td className="px-4 py-3 border border-gray-200">
                    <Textarea
                      rows={2}
                      placeholder="Enter remarks..."
                      {...register(`boqDetails.${index}.remarks`)}
                      className="w-full text-xs p-2 border-gray-200 focus:border-blue-500"
                    />
                  </td>

                  {/* Attachments Column */}
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="space-y-2">
                      {vendorBoqAttachments[index] ? (
                        <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <span className="truncate max-w-[120px]" title={vendorBoqAttachments[index]?.name}>
                            {vendorBoqAttachments[index]?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => onBoqAttachmentRemove(index)}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onBoqAttachmentUpload(index, file);
                            }
                          }}
                          className="text-xs h-8 cursor-pointer"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-300">
            <tr>
              <td colSpan={footerColspan} className="px-4 py-3 text-right text-gray-700">
                Grand Total:
              </td>
              <td className="px-4 py-3 text-blue-600 text-base">
                {currencySymbol}
                {overallTotals.grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td colSpan={3} className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {getGSTMessage() && (
        <p className="text-red-500 text-xs font-semibold pt-1">
          {getGSTMessage()}
        </p>
      )}
    </section>
  );
};
