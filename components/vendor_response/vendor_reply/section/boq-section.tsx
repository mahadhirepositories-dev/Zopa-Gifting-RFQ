/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Paperclip } from "lucide-react";
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
  expandedSpecs: Record<number, boolean>;
  toggleSpecification: (index: number) => void;
  calculateSubItemTotal: (groupIndex: number, subItemIndex: number) => ItemTotals;
  overallTotals: OverallTotals;
  getCurrencySymbol: (currencyCode: string) => string;
  safeParseFloat: (value: string | number) => number;
  calculationTrigger: number;
  setCalculationTrigger: React.Dispatch<React.SetStateAction<number>>;
  getGSTMessage: () => string | null;
  vendorBoqAttachments: Record<string, { url: string; name: string }[]>;
  onBoqAttachmentUpload: (
    groupIndex: number,
    subItemIndex: number,
    files: FileList | File[]
  ) => Promise<void>;
  onBoqAttachmentRemove: (
    groupIndex: number,
    subItemIndex: number,
    fileIndex: number
  ) => void;
  onAddSubItem: (groupIndex: number) => void;
  onRemoveSubItem: (groupIndex: number, subItemIndex: number) => void;
}

export const BOQSection: React.FC<BOQSectionProps> = ({
  register,
  watch,
  setValue,
  errors,
  buyerData,
  expandedSpecs,
  toggleSpecification,
  calculateSubItemTotal,
  overallTotals,
  getCurrencySymbol,
  safeParseFloat,
  setCalculationTrigger,
  getGSTMessage,
  vendorBoqAttachments,
  onBoqAttachmentUpload,
  onBoqAttachmentRemove,
  onAddSubItem,
  onRemoveSubItem,
}) => {
  const currencySymbol = getCurrencySymbol(
    buyerData?.financials?.currency || "INR"
  );
  const showTargetPrice =
    buyerData?.boq?.some((item: any) => item.isVisible) ?? false;
  const footerColspan = showTargetPrice ? 7 : 6;

  const boqList = buyerData?.boq || [];

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">3. BOQ/BOM</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add multiple item quotes per buyer requirement using the &quot;+ Add Item&quot; button. Quantity is fixed by buyer requirement.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table
          className="w-full divide-y divide-gray-200 border-collapse"
          style={{ minWidth: "1700px" }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "260px" }}
              >
                Description
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "200px" }}
              >
                Item Name
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "90px" }}
              >
                Qty
              </th>
              {showTargetPrice && (
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                  style={{ minWidth: "150px" }}
                >
                  Target Price
                  <br />
                  (Per Unit excl Tax)
                </th>
              )}
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "160px" }}
              >
                Your Quote
                <br />
                price
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "110px" }}
              >
                GST %
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "150px" }}
              >
                Item Total
                <br />
                (Incl. GST)
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "180px" }}
              >
                Details
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "130px" }}
              >
                Compliance
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "200px" }}
              >
                Remarks
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "180px" }}
              >
                Attachments
              </th>
              <th
                className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase border border-gray-200 bg-gray-100"
                style={{ minWidth: "60px" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boqList.map((buyerItem: any, groupIndex: number) => {
              const watchGroup = watch(`boqDetails.${groupIndex}`);
              const subItems =
                watchGroup?.items && watchGroup.items.length > 0
                  ? watchGroup.items
                  : [
                      {
                        itemName: "",
                        quotePrice: 0,
                        gst: 0,
                        make: "",
                        model: "",
                        compliance: "Complied",
                        remarks: "",
                      },
                    ];

              return subItems.map((_, subItemIndex: number) => {
                const isFirstSubItem = subItemIndex === 0;
                const attachmentKey = `${groupIndex}_${subItemIndex}`;
                const subItemTotals = calculateSubItemTotal(
                  groupIndex,
                  subItemIndex
                );

                return (
                  <tr key={`${buyerItem.id || groupIndex}_${subItemIndex}`}>
                    {/* Buyer Description Column - rowSpanned */}
                    {isFirstSubItem && (
                      <td
                        rowSpan={subItems.length}
                        className="px-4 py-3 border border-gray-200 bg-white align-top"
                      >
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900 break-words">
                            {buyerItem.description}
                          </p>
                          {typeof buyerItem.specification === "string" &&
                          buyerItem.specification.length > 100 ? (
                            <div>
                              <p className="text-xs text-gray-500 whitespace-pre-line break-words">
                                {expandedSpecs[groupIndex]
                                  ? buyerItem.specification
                                  : `${buyerItem.specification.slice(0, 100)}...`}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSpecification(groupIndex)
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium cursor-pointer"
                              >
                                {expandedSpecs[groupIndex]
                                  ? "Show Less"
                                  : "Show More"}
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 whitespace-pre-line break-words">
                              {buyerItem.specification}
                            </p>
                          )}

                          <div className="pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onAddSubItem(groupIndex)}
                              className="flex items-center gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-medium px-2.5 py-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Item
                            </Button>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Item Name Input */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <Input
                        type="text"
                        placeholder="e.g. Money Plant"
                        {...register(
                          `boqDetails.${groupIndex}.items.${subItemIndex}.itemName`,
                          {
                            required: "Item name is required",
                          }
                        )}
                        className={`w-full text-xs py-1.5 px-2.5 border-gray-300 focus:border-blue-500 ${
                          errors.boqDetails?.[groupIndex]?.items?.[subItemIndex]
                            ?.itemName
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      {errors.boqDetails?.[groupIndex]?.items?.[subItemIndex]
                        ?.itemName && (
                        <p className="text-red-500 text-[11px] mt-1">
                          {
                            errors.boqDetails[groupIndex]?.items?.[subItemIndex]
                              ?.itemName?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* Fixed Buyer Qty & UOM - rowSpanned */}
                    {isFirstSubItem && (
                      <td
                        rowSpan={subItems.length}
                        className="px-4 py-3 border border-gray-200 bg-gray-50/60 align-top"
                      >
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 font-bold">
                            {buyerItem.qty || buyerItem.quantity || "0"}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {buyerItem.uom || "EA"}
                          </p>
                        </div>
                      </td>
                    )}

                    {/* Target Price (conditional) - rowSpanned */}
                    {showTargetPrice && isFirstSubItem && (
                      <td
                        rowSpan={subItems.length}
                        className="px-4 py-3 border border-gray-200 align-top"
                      >
                        {buyerItem.isVisible ? (
                          <p className="text-sm text-gray-900 font-medium">
                            {currencySymbol}
                            {Number(buyerItem.targetPrice || 0).toLocaleString(
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
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.quotePrice`,
                            {
                              required: "Quote Price is required",
                              setValueAs: (value) => safeParseFloat(value),
                            }
                          )}
                          onChange={(e) => {
                            const value = safeParseFloat(e.target.value);
                            setValue(
                              `boqDetails.${groupIndex}.items.${subItemIndex}.quotePrice`,
                              value,
                              {
                                shouldValidate: true,
                                shouldDirty: true,
                              }
                            );
                            setCalculationTrigger((prev) => prev + 1);
                          }}
                          className={`w-full pl-8 py-2 bg-blue-50/60 border border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 ${
                            errors.boqDetails?.[groupIndex]?.items?.[subItemIndex]
                              ?.quotePrice
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.boqDetails?.[groupIndex]?.items?.[subItemIndex]
                        ?.quotePrice && (
                        <p className="text-red-500 text-[11px] mt-1">
                          {
                            errors.boqDetails[groupIndex]?.items?.[
                              subItemIndex
                            ]?.quotePrice?.message
                          }
                        </p>
                      )}
                    </td>

                    {/* GST % */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <Select
                        value={
                          watch(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.gst`
                          )?.toString() || "0"
                        }
                        onValueChange={(value) => {
                          const numericValue = safeParseFloat(value);
                          setValue(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.gst`,
                            numericValue,
                            {
                              shouldValidate: true,
                              shouldDirty: true,
                            }
                          );
                          setCalculationTrigger((prev) => prev + 1);
                        }}
                      >
                        <SelectTrigger className="w-full bg-blue-50/60 border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
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
                    <td className="px-4 py-3 border border-gray-200 bg-gray-50/60 align-top">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {currencySymbol}
                          {subItemTotals.grandTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </td>

                    {/* Details (Make & Model) */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Make"
                          {...register(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.make`
                          )}
                          className="w-full text-xs py-1.5 px-2.5 border-gray-200 focus:border-blue-500"
                        />
                        <Input
                          type="text"
                          placeholder="Model"
                          {...register(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.model`
                          )}
                          className="w-full text-xs py-1.5 px-2.5 border-gray-200 focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Compliance */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <Select
                        value={
                          watch(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.compliance`
                          ) || "Complied"
                        }
                        onValueChange={(val) =>
                          setValue(
                            `boqDetails.${groupIndex}.items.${subItemIndex}.compliance`,
                            val
                          )
                        }
                      >
                        <SelectTrigger className="w-full bg-blue-50/60 border border-blue-300 text-xs">
                          <SelectValue placeholder="Complied" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Complied">Complied</SelectItem>
                          <SelectItem value="Deviated">Deviated</SelectItem>
                          <SelectItem value="Not Complied">
                            Not Complied
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <Textarea
                        rows={2}
                        placeholder="Enter remarks..."
                        {...register(
                          `boqDetails.${groupIndex}.items.${subItemIndex}.remarks`
                        )}
                        className="w-full text-xs p-2 border-gray-200 focus:border-blue-500"
                      />
                    </td>

                    {/* Attachments Column */}
                    <td className="px-4 py-3 border border-gray-200 align-top">
                      <div className="space-y-2">
                        {vendorBoqAttachments[attachmentKey] &&
                        vendorBoqAttachments[attachmentKey].length > 0 ? (
                          <div className="space-y-1.5">
                            {vendorBoqAttachments[attachmentKey].map(
                              (att, fileIdx) => (
                                <div
                                  key={`${att.url}_${fileIdx}`}
                                  className="flex items-center justify-between p-1.5 bg-blue-50 border border-blue-200 rounded text-xs"
                                >
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate max-w-[130px] text-blue-700 font-medium hover:underline flex items-center gap-1"
                                    title={att.name}
                                  >
                                    <Paperclip className="w-3 h-3 text-blue-500 shrink-0" />
                                    <span className="truncate">{att.name}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onBoqAttachmentRemove(
                                        groupIndex,
                                        subItemIndex,
                                        fileIdx
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer shrink-0"
                                    title="Remove file"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        ) : null}

                        <div>
                          <Input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                onBoqAttachmentUpload(
                                  groupIndex,
                                  subItemIndex,
                                  files
                                );
                                e.target.value = "";
                              }
                            }}
                            className="text-xs h-8 cursor-pointer"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-2 py-3 border border-gray-200 text-center align-top">
                      <button
                        type="button"
                        disabled={subItems.length <= 1}
                        onClick={() =>
                          onRemoveSubItem(groupIndex, subItemIndex)
                        }
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors cursor-pointer"
                        title={
                          subItems.length <= 1
                            ? "Minimum 1 item required"
                            : "Remove Item"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-300">
            <tr>
              <td
                colSpan={footerColspan}
                className="px-4 py-3 text-right text-gray-700"
              >
                Grand Total:
              </td>
              <td className="px-4 py-3 text-blue-600 text-base">
                {currencySymbol}
                {overallTotals.grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td colSpan={4} className="px-4 py-3"></td>
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
