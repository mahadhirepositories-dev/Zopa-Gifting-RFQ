/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  BuyerPreviewProps,
  VendorRevision,
  BuyerBOQItem,
  VendorBOQDetail,
} from "@/lib/types/index";
import { FileText, ExternalLink, Download } from "lucide-react";

interface BOQProps {
  buyerData: BuyerPreviewProps["buyerData"];
  selectedVendor: VendorRevision | null;
}

// Extend BuyerBOQItem locally to include attachment fields from the API
interface ExtendedBuyerBOQItem extends BuyerBOQItem {
  originalIndex: number;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

// Extend VendorBOQDetail locally to include vendor attachment fields
interface ExtendedVendorBOQDetail extends VendorBOQDetail {
  vendorAttachmentUrl?: string;
  vendorAttachmentName?: string;
}

function FileLink({
  url,
  name,
  colorClass = "text-blue-600",
  bgClass = "bg-blue-50",
  borderClass = "border-blue-200",
}: {
  url: string;
  name?: string;
  label: string;
  colorClass?: string;
  bgClass?: string;
  borderClass?: string;
}) {
  const displayName = name || url.split("/").pop() || "View File";
  // Normalize URL: remove localhost/domain prefixes to make it relative
  const normalizedUrl = url.includes("://")
    ? new URL(url).pathname
    : url;

  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 rounded border ${bgClass} ${borderClass}`}>
      <a
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`View ${displayName}`}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0 flex-1"
      >
        <FileText className={`w-3.5 h-3.5 shrink-0 ${colorClass}`} />
        <span
          className={`text-xs font-medium truncate max-w-[100px] ${colorClass}`}
        >
          {displayName}
        </span>
        <ExternalLink className={`w-3 h-3 shrink-0 ${colorClass} opacity-60`} />
      </a>
      <a
        href={normalizedUrl}
        download={displayName}
        title={`Download ${displayName}`}
        className={`p-1 rounded hover:bg-black/10 ${colorClass} shrink-0`}
      >
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// Helper function to extract ALL vendor quote sub-items regardless of stored structure (array or keyed object)
function getVendorBOQSubItems(
  boqDetails: any,
  index: number,
  buyerItem: any
) {
  if (!boqDetails) return [];

  let target: any = null;

  if (Array.isArray(boqDetails)) {
    target = boqDetails[index];
  } else if (typeof boqDetails === "object") {
    const key = buyerItem?.id || `boq_${index}`;
    target =
      boqDetails[key] ||
      boqDetails[`boq_${index}`] ||
      boqDetails[index] ||
      boqDetails[String(index)] ||
      boqDetails[buyerItem?.id] ||
      Object.values(boqDetails)[index];
  }

  if (!target) return [];

  let itemsList: any[] = [];
  if (Array.isArray(target.items) && target.items.length > 0) {
    itemsList = target.items;
  } else if (Array.isArray(target) && target.length > 0) {
    itemsList = target;
  } else {
    itemsList = [target];
  }

  return itemsList.map((sub: any, subIdx: number) => {
    let atts: { url: string; name: string }[] = [];
    if (Array.isArray(sub?.vendorAttachments) && sub.vendorAttachments.length > 0) {
      atts = sub.vendorAttachments;
    } else if (sub?.vendorAttachmentUrl) {
      atts = [
        {
          url: sub.vendorAttachmentUrl,
          name: sub.vendorAttachmentName || "Attachment",
        },
      ];
    } else if (target?.vendorAttachmentUrl) {
      atts = [
        {
          url: target.vendorAttachmentUrl,
          name: target.vendorAttachmentName || "Attachment",
        },
      ];
    }

    const quotePrice =
      sub?.quotePrice ??
      sub?.price ??
      target?.quotePrice ??
      target?.price ??
      null;

    const gst =
      sub?.gstPercent ??
      sub?.gst ??
      target?.gstPercent ??
      target?.gst ??
      null;

    return {
      id: sub?.id || `sub_${index}_${subIdx}`,
      itemName: sub?.itemName || sub?.name || "",
      qty: sub?.qty ?? buyerItem?.qty ?? 1,
      quotePrice,
      gst,
      make: sub?.make ?? target?.make ?? "",
      model: sub?.model ?? target?.model ?? "",
      compliance: sub?.compliance ?? target?.compliance ?? "",
      remarks: sub?.remarks ?? target?.remarks ?? "",
      vendorAttachmentUrl: atts[0]?.url || "",
      vendorAttachmentName: atts[0]?.name || "",
      vendorAttachments: atts,
    };
  });
}

export const BOQ: React.FC<BOQProps> = ({ buyerData, selectedVendor }) => {
  const getCurrencySymbol = (currencyCode: any) => {
    switch (currencyCode) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "CAD":
        return "C$";
      case "AUD":
        return "A$";
      case "JPY":
        return "¥";
      case "CNY":
        return "¥";
      default:
        return "₹";
    }
  };

  const [expandedSpecs, setExpandedSpecs] = React.useState<
    Record<number, boolean>
  >({});
  const [expandedBuyerRemarks, setExpandedBuyerRemarks] = React.useState<
    Record<number, boolean>
  >({});
  const [expandedVendorRemarks, setExpandedVendorRemarks] = React.useState<
    Record<string, boolean>
  >({});

  const toggleSpecification = (index: number) =>
    setExpandedSpecs((prev) => ({ ...prev, [index]: !prev[index] }));
  const toggleBuyerRemarks = (index: number) =>
    setExpandedBuyerRemarks((prev) => ({ ...prev, [index]: !prev[index] }));

  if (!buyerData?.boq?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
        No BOQ details available
      </div>
    );
  }

  // Group BOQ items by category preserving original index
  const groupedItems = buyerData.boq.reduce(
    (
      groups: { [key: string]: ExtendedBuyerBOQItem[] },
      item: BuyerBOQItem,
      index: number,
    ) => {
      const category = item.category || "Uncategorized Item";
      if (!groups[category]) groups[category] = [];
      groups[category].push({
        ...item,
        originalIndex: index,
      } as ExtendedBuyerBOQItem);
      return groups;
    },
    {},
  );

  const boqSource =
    selectedVendor?.revisionData?.boqDetails ||
    selectedVendor?.revisionData?.boqQuotes;

  // Calculate grand total across all vendor sub-items
  let grandTotal = 0;
  buyerData.boq.forEach((buyerItem: BuyerBOQItem, index: number) => {
    const subItems = getVendorBOQSubItems(boqSource, index, buyerItem);
    if (subItems.length > 0) {
      subItems.forEach((subItem: any) => {
        const quantity = parseFloat(
          subItem.qty?.toString() || buyerItem.qty?.toString() || "0"
        );
        const unitPrice = parseFloat(subItem.quotePrice?.toString() || "0");
        const gstPercentage = parseFloat(subItem.gst?.toString() || "0");
        const lineTotalExclTax = quantity * unitPrice;
        const gstAmount = lineTotalExclTax * (gstPercentage / 100);
        grandTotal += lineTotalExclTax + gstAmount;
      });
    }
  });

  const categoryKeys = Object.keys(groupedItems);

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        3. BOQ/BOM
      </h2>

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="bg-white overflow-hidden mb-8">
          {/* Category Header */}
          <div className="bg-gray-50 px-4 py-3 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
          </div>

          {/* Item Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Vendor Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Target Price
                    <br />
                    (Per Unit excl Tax)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Your Quote
                    <br />
                    price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    GST %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Item Total
                    <br />
                    (Incl. GST)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Compliance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Deviation / Remarks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50">
                    Buyer Remarks
                  </th>
                  {/* ── Attachment columns ── */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50 min-w-[140px]">
                    Buyer
                    <br />
                    Attachment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200 bg-gray-50 min-w-[140px]">
                    Vendor
                    <br />
                    Attachment
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {(items as ExtendedBuyerBOQItem[]).map((buyerItem) => {
                  const originalIndex = buyerItem.originalIndex;
                  const subItems = getVendorBOQSubItems(
                    boqSource,
                    originalIndex,
                    buyerItem,
                  );

                  const displayItems =
                    subItems.length > 0
                      ? subItems
                      : [
                          {
                            id: `sub_${originalIndex}_0`,
                            itemName: "",
                            qty: buyerItem.qty,
                            quotePrice: null,
                            gst: null,
                            make: "",
                            model: "",
                            compliance: "",
                            remarks: "",
                            vendorAttachmentUrl: "",
                            vendorAttachmentName: "",
                          },
                        ];

                  const buyerAttachmentUrl = buyerItem.attachmentUrl;
                  const buyerAttachmentName = buyerItem.attachmentName;

                  return (
                    <React.Fragment key={originalIndex}>
                      {displayItems.map((vendorItem: any, subIdx: number) => {
                        const quantity = parseFloat(
                          vendorItem.qty?.toString() ||
                            buyerItem.qty?.toString() ||
                            "0",
                        );
                        const unitPrice = parseFloat(
                          vendorItem.quotePrice?.toString() || "0",
                        );
                        const gstPercentage = parseFloat(
                          vendorItem.gst?.toString() || "0",
                        );
                        const lineTotalExclTax = quantity * unitPrice;
                        const gstAmount =
                          lineTotalExclTax * (gstPercentage / 100);
                        const lineTotalInclTax = lineTotalExclTax + gstAmount;

                        const vendorAttachmentUrl =
                          vendorItem.vendorAttachmentUrl;
                        const vendorAttachmentName =
                          vendorItem.vendorAttachmentName;
                        const vendorAttachments =
                          (vendorItem as any).vendorAttachments || [];

                        return (
                          <tr
                            key={`${originalIndex}-${subIdx}`}
                            className="hover:bg-gray-50 border-b border-gray-200"
                          >
                            {/* Description + Spec (RowSpan grouped) */}
                            {subIdx === 0 && (
                              <td
                                rowSpan={displayItems.length}
                                className="px-4 py-2 border border-gray-200 align-top bg-white"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {buyerItem.description || "N/A"}
                                  </p>
                                  {typeof buyerItem.specification ===
                                    "string" &&
                                  buyerItem.specification.length > 100 ? (
                                    <div>
                                      <p
                                        className={`text-sm text-gray-500 ${
                                          expandedSpecs[originalIndex]
                                            ? "w-[250px]"
                                            : "w-[150px]"
                                        }`}
                                      >
                                        {expandedSpecs[originalIndex]
                                          ? buyerItem.specification
                                          : `${buyerItem.specification.slice(0, 100)}...`}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleSpecification(originalIndex)
                                        }
                                        className="text-sm text-blue-600 hover:text-blue-800 mt-1 font-medium"
                                      >
                                        {expandedSpecs[originalIndex]
                                          ? "Show Less"
                                          : "Show More"}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      {buyerItem.specification}
                                    </p>
                                  )}
                                </div>
                              </td>
                            )}

                            {/* Vendor Item Name */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <p className="text-sm font-medium text-gray-900">
                                {vendorItem.itemName || "-"}
                              </p>
                            </td>

                            {/* Qty + UOM */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <div className="space-y-1">
                                <p className="text-sm text-gray-900">
                                  {vendorItem.qty || buyerItem.qty || "0"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {buyerItem.uom || "UOM"}
                                </p>
                              </div>
                            </td>

                            {/* Target Price (RowSpan grouped) */}
                            {subIdx === 0 && (
                              <td
                                rowSpan={displayItems.length}
                                className="px-4 py-2 border border-gray-200 align-top bg-white"
                              >
                                <p className="text-sm text-gray-900">
                                  {getCurrencySymbol(
                                    buyerData?.financials?.currency,
                                  )}{" "}
                                  {buyerItem.targetPrice
                                    ? Number(
                                        buyerItem.targetPrice,
                                      ).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : "-"}
                                </p>
                              </td>
                            )}

                            {/* Quote Price */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <p className="text-sm text-gray-900 font-medium">
                                {getCurrencySymbol(
                                  buyerData?.financials?.currency,
                                )}{" "}
                                {vendorItem.quotePrice != null
                                  ? Number(
                                      vendorItem.quotePrice,
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : "-"}
                              </p>
                            </td>

                            {/* GST % */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <p className="text-sm text-gray-900">
                                {vendorItem.gst != null
                                  ? `${vendorItem.gst}%`
                                  : "-"}
                              </p>
                            </td>

                            {/* Item Total (Incl. GST) */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <p className="text-sm font-semibold text-gray-900">
                                {getCurrencySymbol(
                                  buyerData?.financials?.currency,
                                )}{" "}
                                {lineTotalInclTax.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </td>

                            {/* Details (Make / Model) */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <div className="space-y-1">
                                <div>
                                  <p className="text-xs text-gray-500">Make</p>
                                  <p className="text-sm text-gray-900">
                                    {vendorItem.make || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Model</p>
                                  <p className="text-sm text-gray-900">
                                    {vendorItem.model || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Compliance */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  vendorItem.compliance === "Complied" ||
                                  vendorItem.compliance === "Yes"
                                    ? "bg-green-100 text-green-700"
                                    : vendorItem.compliance === "Not Complied" ||
                                        vendorItem.compliance === "No"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {vendorItem.compliance || "-"}
                              </span>
                            </td>

                            {/* Vendor Remarks / Deviation */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              {typeof vendorItem.remarks === "string" &&
                              vendorItem.remarks.length > 100 ? (
                                <div>
                                  <p
                                    className={`text-sm text-gray-500 ${
                                      expandedVendorRemarks[
                                        `${originalIndex}_${subIdx}`
                                      ]
                                        ? "w-[250px]"
                                        : "w-[150px]"
                                    }`}
                                  >
                                    {expandedVendorRemarks[
                                      `${originalIndex}_${subIdx}`
                                    ]
                                      ? vendorItem.remarks
                                      : `${vendorItem.remarks.slice(0, 100)}...`}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedVendorRemarks((prev) => ({
                                        ...prev,
                                        [`${originalIndex}_${subIdx}`]:
                                          !prev[`${originalIndex}_${subIdx}`],
                                      }))
                                    }
                                    className="text-sm text-blue-600 hover:text-blue-800 mt-1 font-medium"
                                  >
                                    {expandedVendorRemarks[
                                      `${originalIndex}_${subIdx}`
                                    ]
                                      ? "Show Less"
                                      : "Show More"}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 whitespace-pre-line">
                                  {vendorItem.remarks || "-"}
                                </p>
                              )}
                            </td>

                            {/* Buyer Remarks (RowSpan grouped) */}
                            {subIdx === 0 && (
                              <td
                                rowSpan={displayItems.length}
                                className="px-4 py-2 border border-gray-200 align-top bg-white"
                              >
                                {typeof buyerItem.remarks === "string" &&
                                buyerItem.remarks.length > 100 ? (
                                  <div>
                                    <p
                                      className={`text-sm text-gray-500 ${
                                        expandedBuyerRemarks[originalIndex]
                                          ? "w-[250px]"
                                          : "w-[150px]"
                                      }`}
                                    >
                                      {expandedBuyerRemarks[originalIndex]
                                        ? buyerItem.remarks
                                        : `${buyerItem.remarks.slice(0, 100)}...`}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleBuyerRemarks(originalIndex)
                                      }
                                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 font-medium"
                                    >
                                      {expandedBuyerRemarks[originalIndex]
                                        ? "Show Less"
                                        : "Show More"}
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 whitespace-pre-line">
                                    {buyerItem.remarks || "-"}
                                  </p>
                                )}
                              </td>
                            )}

                            {/* Buyer Attachment (RowSpan grouped) */}
                            {subIdx === 0 && (
                              <td
                                rowSpan={displayItems.length}
                                className="px-4 py-2 border border-gray-200 align-top bg-white"
                              >
                                {buyerAttachmentUrl ? (
                                  <FileLink
                                    url={buyerAttachmentUrl}
                                    name={buyerAttachmentName}
                                    label="Buyer file"
                                    colorClass="text-gray-700"
                                    bgClass="bg-gray-50"
                                    borderClass="border-gray-200"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    —
                                  </span>
                                )}
                              </td>
                            )}

                            {/* Vendor Attachment */}
                            <td className="px-4 py-2 border border-gray-200 align-top">
                              {vendorAttachments && vendorAttachments.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                  {vendorAttachments.map((att: any, attIdx: number) => (
                                    <FileLink
                                      key={attIdx}
                                      url={att.url}
                                      name={att.name || att.documentName}
                                      label="Vendor file"
                                      colorClass="text-blue-700"
                                      bgClass="bg-blue-50"
                                      borderClass="border-blue-200"
                                    />
                                  ))}
                                </div>
                              ) : vendorAttachmentUrl ? (
                                <FileLink
                                  url={vendorAttachmentUrl}
                                  name={vendorAttachmentName}
                                  label="Vendor file"
                                  colorClass="text-blue-700"
                                  bgClass="bg-blue-50"
                                  borderClass="border-blue-200"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Additional Specs Row */}
                      {buyerItem.additionalSpecs && (
                        <tr className="bg-gray-50">
                          <td
                            colSpan={13}
                            className="px-4 py-2 text-sm text-gray-500"
                          >
                            {buyerItem.additionalSpecs}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Grand Total — only in the last category */}
              {category === categoryKeys[categoryKeys.length - 1] && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-3 text-right font-semibold text-gray-800 border border-gray-200"
                    >
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <p className="text-lg font-bold text-blue-700">
                        {getCurrencySymbol(buyerData?.financials?.currency)}{" "}
                        {grandTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    {/* 6 remaining cols: Details, Compliance, VendorRemarks, BuyerRemarks, BuyerAtt, VendorAtt */}
                    <td colSpan={6} className="border border-gray-200" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
