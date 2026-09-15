/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import {
  FileText,
  Award,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SavingsAnalysis } from "./savings";
import { Vendor } from "@/db/schema";
import * as XLSX from "xlsx";

interface BoqDetail {
  quotePrice?: string | number;
  gst?: string | number;
  specification?: string;
  [key: string]: any;
}

interface Revision {
  boqDetails?: BoqDetail[];
  [key: string]: any;
}

interface ProcessedVendor {
  id: string | number;
  name: string;
  vendorResponseId: string;
  revisions?: Revision[];
  actualPrice?: number;
  [key: string]: any;
}

interface BuyerDataItem {
  id?: number;
  description: string;
  uom: string;
  qty: string | number;
  specification?: string;
  targetPrice?: string | number;
  remarks?: string;
  category?: string;
  lopPrice?: string | number;
  lopGst?: string | number;
  [key: string]: any;
}

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface LopData {
  price: string;
  gst: string;
}

interface ItemLevelViewTableProps {
  vendors: ProcessedVendor[];
  buyerData?: BuyerDataItem[];
  selectedVendors: Map<string, SelectedVendor>;
  onToggleVendor: (vendorResponseId: string, companyName: string) => void;
  onUpdateRemarks?: (vendorResponseId: string, remarks: string) => void;
  validationErrors?: Map<string, string>;
  isLoggedIn: boolean;
  recommendations: any[];
  rfpId: any;
  currentApproval: any;
  isBuyerActionsLocked?: boolean;
}

interface ItemTotal {
  quotePrice: number;
  gst: number;
  lineTotalExclTax: number;
  gstAmount: number;
  lineTotalInclTax: number;
  isReplacedPrice?: boolean;
}

interface SaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasError: boolean;
}

export const ItemLevelViewTable: React.FC<ItemLevelViewTableProps> = ({
  vendors,
  buyerData,
  selectedVendors,
  recommendations,
  rfpId,
  currentApproval,
}) => {
  const [expandedItems] = React.useState<Record<number, boolean>>({});
  const [expandedSpecs, setExpandedSpecs] = React.useState<
    Record<number, boolean>
  >({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<
    Record<number, boolean>
  >({});
  const [expandedRemarks, setExpandedRemarks] = React.useState<
    Record<number, boolean>
  >({});
  const [isDownloading, setIsDownloading] = useState(false);

  const [lopValues, setLopValues] = React.useState<Record<number, LopData>>(
    () => {
      const initialValues: Record<number, LopData> = {};
      buyerData?.forEach((item, index) => {
        initialValues[index] = {
          price: item.lopPrice?.toString() || "",
          gst: item.lopGst?.toString() || "",
        };
      });
      return initialValues;
    }
  );

  const [saveStatus, setSaveStatus] = useState<Record<number, SaveStatus>>({});

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const saveIndividualLopData = useCallback(
    async (itemIndex: number, boqItemId: number, lopData: LopData) => {
      setSaveStatus((prev) => ({
        ...prev,
        [itemIndex]: { isSaving: true, lastSaved: null, hasError: false },
      }));

      try {
        const price = parseFloat(lopData.price || "0");
        const gst = parseFloat(lopData.gst || "0");

        if (gst < 0 || gst > 100) {
          throw new Error(`Invalid GST percentage. Must be between 0-100.`);
        }

        if (price < 0) {
          throw new Error(`Invalid price. Must be positive.`);
        }
        const response = await fetch(`/api/rfps/${rfpId}/lop/${boqItemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lopPrice: price > 0 ? price.toString() : null,
            lopGst: gst > 0 ? gst.toString() : null,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to save LOP data");
        }

        setSaveStatus((prev) => ({
          ...prev,
          [itemIndex]: {
            isSaving: false,
            lastSaved: new Date(),
            hasError: false,
          },
        }));
      } catch (error) {
        console.log("Error saving LOP data:", error);
        setSaveStatus((prev) => ({
          ...prev,
          [itemIndex]: {
            isSaving: false,
            lastSaved: null,
            hasError: true,
          },
        }));
      }
    },
    [rfpId]
  );

  const debouncedSave = useCallback(
    debounce((itemIndex: number, boqItemId: number, lopData: LopData) => {
      saveIndividualLopData(itemIndex, boqItemId, lopData);
    }, 1000),
    [saveIndividualLopData]
  );

  const getCurrencySymbol = () => "₹";

  const handleLopPriceChange = (index: number, value: string) => {
    if (value && !/^\d*(\.\d{0,2})?$/.test(value)) return;

    const newLopValues = {
      ...lopValues,
      [index]: {
        ...lopValues[index],
        price: value,
      },
    };

    setLopValues(newLopValues);

    const boqItemId = buyerData?.[index]?.id;
    if (boqItemId) {
      debouncedSave(index, boqItemId, newLopValues[index]);
    }
  };

  const handleLopGstChange = (index: number, value: string) => {
    if (value) {
      if (!/^\d*\.?\d*$/.test(value)) return;
      const numValue = parseFloat(value);
      if (numValue > 100) return;
    }

    const newLopValues = {
      ...lopValues,
      [index]: {
        ...lopValues[index],
        gst: value,
      },
    };

    setLopValues(newLopValues);

    const boqItemId = buyerData?.[index]?.id;
    if (boqItemId) {
      debouncedSave(index, boqItemId, newLopValues[index]);
    }
  };

  const getVendorRecommendationDetails = (vendor: Vendor) => {
    const vendorRecommendations = recommendations.filter((rec) => {
      return rec.vendorResponseId === vendor.vendorResponseId;
    });

    if (vendorRecommendations.length === 0) {
      return { type: "none", status: "", label: "", colorClass: "" };
    }

    const isTwoLevel = currentApproval?.requiredLevels === 2;
    const isLevel1Approved = currentApproval?.level1Status === "approved";
    const isLevel2Approved = currentApproval?.level2Status === "approved";
    const isPendingLevel2 = currentApproval?.status === "pending_level2";

    if (isTwoLevel) {
      if (isLevel2Approved) {
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (isPendingLevel2 || isLevel1Approved) {
        return {
          type: "approver",
          status: "level1_approved",
          label: "L1 Approved",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      }
    }

    const approverRec = vendorRecommendations.find(
      (r) => r.recommenderRole === "approver"
    );
    const buyerRec = vendorRecommendations.find(
      (r) => r.recommenderRole === "buyer"
    );

    if (approverRec && buyerRec) {
      if (
        approverRec.status === "reject" ||
        approverRec.status === "rejected"
      ) {
        return {
          type: "approver",
          status: "rejected",
          label: "Rejected",
          colorClass: "bg-red-50 border-red-200 text-red-700",
        };
      } else if (
        approverRec.status === "approve" ||
        approverRec.status === "approved"
      ) {
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (approverRec.status === "pending") {
        return {
          type: "approver",
          status: "pending",
          label: "Approver Recommended",
          colorClass: "bg-purple-50 border-purple-200 text-purple-700",
        };
      } else if (approverRec.status === "request-revision") {
        return {
          type: "approver",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    if (approverRec) {
      if (
        approverRec.status === "reject" ||
        approverRec.status === "rejected"
      ) {
        return {
          type: "approver",
          status: "rejected",
          label: "Rejected",
          colorClass: "bg-red-50 border-red-200 text-red-700",
        };
      } else if (
        approverRec.status === "approve" ||
        approverRec.status === "approved"
      ) {
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (approverRec.status === "pending") {
        return {
          type: "approver",
          status: "pending",
          label: "Approver Recommended",
          colorClass: "bg-purple-50 border-purple-200 text-purple-700",
        };
      } else if (approverRec.status === "request-revision") {
        return {
          type: "approver",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    if (buyerRec) {
      if (buyerRec.status === "approve" || buyerRec.status === "approved") {
        return {
          type: "buyer",
          status: "approved",
          label: "Buyer Recommended",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      } else if (buyerRec.status === "pending") {
        return {
          type: "buyer",
          status: "pending",
          label: "Buyer Recommended",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      } else if (buyerRec.status === "request-revision") {
        return {
          type: "buyer",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    return { type: "none", status: "", label: "", colorClass: "" };
  };

  const toggleSpecExpansion = (index: number) => {
    setExpandedSpecs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleDescriptionExpansion = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleRemarksExpansion = (index: number) => {
    setExpandedRemarks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const sortedVendors = [...vendors].sort(
    (a, b) => (a.actualPrice ?? Infinity) - (b.actualPrice ?? Infinity)
  );

  const getRevisionItem = (
    vendor: ProcessedVendor,
    itemIndex: number,
    revisionIndex: number
  ): BoqDetail | null => {
    const revision = vendor.revisions?.[revisionIndex];
    if (!revision?.boqDetails?.length) return null;
    return revision.boqDetails[itemIndex] || revision.boqDetails[0] || null;
  };

  // NEW: Function to get lowest non-zero price for an item across all vendors and revisions
  const getLowestNonZeroPriceForItem = (
    itemIndex: number,
    excludeVendorId?: string,
    excludeRevisionIndex?: number
  ): number | null => {
    const prices: number[] = [];

    sortedVendors.forEach((vendor) => {
      allRevisionIndices.forEach((revIndex) => {
        // Skip the vendor/revision we're trying to replace
        if (
          vendor.id === excludeVendorId &&
          revIndex === excludeRevisionIndex
        ) {
          return;
        }

        const revItem = getRevisionItem(vendor, itemIndex, revIndex);
        if (revItem?.quotePrice) {
          const price =
            typeof revItem.quotePrice === "string"
              ? parseFloat(revItem.quotePrice)
              : Number(revItem.quotePrice);

          if (price > 0) {
            prices.push(price);
          }
        }
      });
    });

    return prices.length > 0 ? Math.min(...prices) : null;
  };

  // UPDATED: Calculate item total with zero price replacement logic
  const calculateItemTotal = (
    item: BoqDetail | null,
    qty: string | number,
    itemIndex: number,
    vendorId?: string | number,
    revisionIndex?: number
  ): ItemTotal | null => {
    if (!item) return null;

    let price =
      typeof item.quotePrice === "string"
        ? parseFloat(item.quotePrice)
        : Number(item.quotePrice);

    let isReplacedPrice = false;

    // If price is 0 or not provided, use lowest price from other vendors
    if (!price || price === 0) {
      const lowestPrice = getLowestNonZeroPriceForItem(
        itemIndex,
        vendorId?.toString(),
        revisionIndex
      );
      if (lowestPrice !== null) {
        price = lowestPrice;
        isReplacedPrice = true;
      } else {
        // No valid prices available anywhere
        return null;
      }
    }

    const gst =
      typeof item.gst === "string"
        ? parseFloat(item.gst || "0")
        : Number(item.gst || 0);

    const quantity =
      typeof qty === "string" ? parseFloat(qty.toString()) : Number(qty);

    const lineTotalExclTax = price * (quantity || 0);
    const gstAmount = lineTotalExclTax * (gst / 100);

    return {
      quotePrice: price,
      gst,
      lineTotalExclTax,
      gstAmount,
      lineTotalInclTax: lineTotalExclTax + gstAmount,
      isReplacedPrice,
    };
  };

  const SaveStatusIndicator: React.FC<{ itemIndex: number }> = ({
    itemIndex,
  }) => {
    const status = saveStatus[itemIndex];

    if (!status) return null;

    if (status.isSaving) {
      return (
        <div className="flex items-center text-xs text-blue-600 mt-1">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Saving...
        </div>
      );
    }

    if (status.hasError) {
      return (
        <div className="flex items-center text-xs text-red-600 mt-1">
          ⚠️ Save failed
        </div>
      );
    }

    if (status.lastSaved) {
      return (
        <div className="flex items-center text-xs text-green-600 mt-1">
          <Check className="h-3 w-3 mr-1" />
          Saved
        </div>
      );
    }

    return null;
  };

  if (!buyerData?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
        No BOQ details available
      </div>
    );
  }

  const allRevisionIndices = Array.from(
    new Set(
      sortedVendors.flatMap((vendor) =>
        (vendor.revisions || []).map((_, index) => index)
      )
    )
  ).sort((a, b) => a - b);

  const vendorRevisionStartIndices = sortedVendors.reduce<number[]>(
    (acc, vendor, vIdx) => {
      const countBefore = sortedVendors
        .slice(0, vIdx)
        .reduce(
          (sum, v) =>
            sum +
            allRevisionIndices.filter(
              (r) => v.revisions?.[r]?.boqDetails?.length
            ).length,
          0
        );
      acc.push(countBefore);
      return acc;
    },
    []
  );

  const calculateCumulativeTotals = (): Record<string, number> => {
    const totals: Record<string, number> = {};

    buyerData.forEach((item, index) => {
      const displayQty = item.qty || 0;

      sortedVendors.forEach((vendor) => {
        allRevisionIndices.forEach((revIndex) => {
          const revItem = getRevisionItem(vendor, index, revIndex);
          if (revItem) {
            const revTotal = calculateItemTotal(
              revItem,
              displayQty,
              index,
              vendor.id,
              revIndex
            );
            if (revTotal) {
              const key = `${vendor.id}-rev-${revIndex}`;
              totals[key] = (totals[key] || 0) + revTotal.lineTotalInclTax;
            }
          }
        });
      });
    });

    return totals;
  };

  const cumulativeTotals = calculateCumulativeTotals();

  const validCumulativeTotals = Object.values(cumulativeTotals).filter(
    (total) => total > 0
  );
  const lowestCumulativeTotal =
    validCumulativeTotals.length > 0
      ? Math.min(...validCumulativeTotals)
      : null;

  const calculateLopTotals = (): {
    totalExclTax: number;
    totalInclTax: number;
  } => {
    let totalExclTax = 0;
    let totalInclTax = 0;

    buyerData.forEach((item, index) => {
      const displayQty = item.qty || 0;
      const lopData = lopValues[index] || { price: "", gst: "" };
      const price = parseFloat(lopData.price || "0");
      const gst = parseFloat(lopData.gst || "0");

      if (!isNaN(price) && price > 0) {
        const quantity =
          typeof displayQty === "string"
            ? parseFloat(displayQty)
            : Number(displayQty);

        const lineTotalExclTax = price * (quantity || 0);
        const gstAmount = lineTotalExclTax * (gst / 100);

        totalExclTax += lineTotalExclTax;
        totalInclTax += lineTotalExclTax + gstAmount;
      }
    });

    return { totalExclTax, totalInclTax };
  };

  const lopTotals = calculateLopTotals();

  const getLowestLastRevisionTotalExclGst = (): number => {
    if (allRevisionIndices.length === 0) return 0;

    const lastRevIndex = Math.max(...allRevisionIndices);
    let lowestTotalExclGst = Infinity;

    sortedVendors.forEach((vendor) => {
      let vendorTotalExclGst = 0;

      buyerData.forEach((item, index) => {
        const revItem = getRevisionItem(vendor, index, lastRevIndex);
        if (revItem) {
          const displayQty = item.qty || 0;
          const revTotal = calculateItemTotal(
            revItem,
            displayQty,
            index,
            vendor.id,
            lastRevIndex
          );
          if (revTotal) {
            vendorTotalExclGst += revTotal.lineTotalExclTax;
          }
        }
      });

      if (vendorTotalExclGst > 0 && vendorTotalExclGst < lowestTotalExclGst) {
        lowestTotalExclGst = vendorTotalExclGst;
      }
    });

    return lowestTotalExclGst === Infinity ? 0 : lowestTotalExclGst;
  };

  const calculateTargetPriceTotal = (): number => {
    let total = 0;
    buyerData.forEach((item) => {
      const targetPrice = parseFloat(String(item.targetPrice || 0));
      const quantity =
        typeof item.qty === "string" ? parseFloat(item.qty) : Number(item.qty);
      total += targetPrice * (quantity || 0);
    });
    return total;
  };

  const targetPriceTotal = calculateTargetPriceTotal();

  const calculateSavings = () => {
    if (allRevisionIndices.length === 0) return null;

    const firstRevIndex = Math.min(...allRevisionIndices);
    const lastRevIndex = Math.max(...allRevisionIndices);

    let lowestFirstRevisionTotal = Infinity;
    let lowestLastRevisionTotal = Infinity;

    sortedVendors.forEach((vendor) => {
      const firstRevKey = `${vendor.id}-rev-${firstRevIndex}`;
      const lastRevKey = `${vendor.id}-rev-${lastRevIndex}`;

      const firstRevTotal = cumulativeTotals[firstRevKey] || 0;
      const lastRevTotal = cumulativeTotals[lastRevKey] || 0;

      if (firstRevTotal > 0 && firstRevTotal < lowestFirstRevisionTotal) {
        lowestFirstRevisionTotal = firstRevTotal;
      }
      if (lastRevTotal > 0 && lastRevTotal < lowestLastRevisionTotal) {
        lowestLastRevisionTotal = lastRevTotal;
      }
    });

    if (lowestFirstRevisionTotal === Infinity) lowestFirstRevisionTotal = 0;
    if (lowestLastRevisionTotal === Infinity) lowestLastRevisionTotal = 0;

    const lowestLastRevisionTotalExclGst = getLowestLastRevisionTotalExclGst();

    return {
      negotiations: lowestFirstRevisionTotal - lowestLastRevisionTotal,
      targetVsLastRev: targetPriceTotal - lowestLastRevisionTotalExclGst,
      lopVsLastRev: lopTotals.totalInclTax - lowestLastRevisionTotal,
      firstRevTotal: lowestFirstRevisionTotal,
      lastRevTotal: lowestLastRevisionTotal,
      lastRevTotalExclGst: lowestLastRevisionTotalExclGst,
    };
  };

  const savings = calculateSavings();

  const getVendorHighlight = (vendorResponseId: string) => {
    const recommendationDetails = getVendorRecommendationDetails({
      vendorResponseId,
    } as any);
    return recommendationDetails;
  };

  const isLopFieldEditable = (
    itemIndex: number,
    fieldType: "price" | "gst"
  ) => {
    const item = buyerData?.[itemIndex];
    if (!item) return false;
    const hasOriginalValue =
      fieldType === "price"
        ? item.lopPrice && item.lopPrice !== "" && item.lopPrice !== "0"
        : item.lopGst && item.lopGst !== "" && item.lopGst !== "0";

    const isStatusAllowed =
      currentApproval?.status === "pending" ||
      currentApproval?.status === "request-revision" ||
      currentApproval?.status === "approved";

    return !hasOriginalValue && !isStatusAllowed;
  };

  // Excel Download Function
  const handleDownloadExcel = () => {
    try {
      setIsDownloading(true);

      const excelData: any[] = [];

      const headerRow1: any[] = [
        "Description",
        "UOM",
        "Specification",
        "Qty",
        "Target Price",
        "LOP Price",
        "LOP GST%",
        "LOP Total",
      ];

      sortedVendors.forEach((vendor) => {
        const activeRevisions = allRevisionIndices.filter(
          (revIndex) => vendor.revisions?.[revIndex]?.boqDetails?.length
        );
        if (activeRevisions.length > 0) {
          activeRevisions.forEach((revIndex) => {
            headerRow1.push(`${vendor.name} (R${revIndex})`);
          });
        }
      });

      excelData.push(headerRow1);

      const headerRow2: any[] = ["", "", "", "", "", "", "", ""];
      sortedVendors.forEach((vendor) => {
        const activeRevisions = allRevisionIndices.filter(
          (revIndex) => vendor.revisions?.[revIndex]?.boqDetails?.length
        );
        if (activeRevisions.length > 0) {
          activeRevisions.forEach(() => {
            headerRow2.push("Quote Price");
            headerRow2.push("GST%");
            headerRow2.push("Total");
          });
        }
      });

      const headerRow1Adjusted: any[] = [
        "Description",
        "UOM",
        "Specification",
        "Qty",
        "Target Price",
        "LOP Price",
        "LOP GST%",
        "LOP Total",
      ];

      sortedVendors.forEach((vendor) => {
        const activeRevisions = allRevisionIndices.filter(
          (revIndex) => vendor.revisions?.[revIndex]?.boqDetails?.length
        );
        if (activeRevisions.length > 0) {
          activeRevisions.forEach((revIndex) => {
            const highlight = getVendorHighlight(vendor.vendorResponseId);
            const vendorLabel = highlight.label
              ? `${vendor.name} (R${revIndex}) - ${highlight.label}`
              : `${vendor.name} (R${revIndex})`;
            headerRow1Adjusted.push(vendorLabel);
            headerRow1Adjusted.push("");
            headerRow1Adjusted.push("");
          });
        }
      });

      excelData[0] = headerRow1Adjusted;
      excelData.push(headerRow2);

      buyerData.forEach((item, index) => {
        const displayQty = item.qty || 0;
        const lopData = lopValues[index] || { price: "", gst: "" };
        const price = parseFloat(lopData.price || "0");
        const gst = parseFloat(lopData.gst || "0");
        const quantity =
          typeof displayQty === "string"
            ? parseFloat(displayQty)
            : Number(displayQty);

        const lineTotalExclTax = price * (quantity || 0);
        const gstAmount = lineTotalExclTax * (gst / 100);
        const lineTotalInclTax = lineTotalExclTax + gstAmount;

        const row: any[] = [
          item.description,
          item.uom,
          item.specification || "",
          displayQty,
          parseFloat(String(item.targetPrice || 0)),
          price || "",
          gst || "",
          lineTotalInclTax || "",
        ];

        sortedVendors.forEach((vendor) => {
          allRevisionIndices.forEach((revIndex) => {
            const revItem = getRevisionItem(vendor, index, revIndex);
            if (revItem) {
              const revTotal = calculateItemTotal(
                revItem,
                displayQty,
                index,
                vendor.id,
                revIndex
              );
              const displayPrice = revTotal?.isReplacedPrice
                ? `${revTotal.quotePrice} (Auto)`
                : revTotal?.quotePrice || "";
              row.push(displayPrice);
              row.push(revItem.gst || 0);
              row.push(revTotal?.lineTotalInclTax || "");
            }
          });
        });

        excelData.push(row);
      });

      const totalsRow: any[] = [
        "TOTAL",
        "",
        "",
        "",
        targetPriceTotal,
        "",
        "",
        lopTotals.totalInclTax,
      ];

      sortedVendors.forEach((vendor) => {
        allRevisionIndices.forEach((revIndex) => {
          const hasData = vendor.revisions?.[revIndex]?.boqDetails?.length;
          if (hasData) {
            const key = `${vendor.id}-rev-${revIndex}`;
            const total = cumulativeTotals[key] || 0;
            totalsRow.push("");
            totalsRow.push("");
            totalsRow.push(total);
          }
        });
      });

      excelData.push(totalsRow);

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      const colWidths = [
        { wch: 30 },
        { wch: 10 },
        { wch: 30 },
        { wch: 8 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
      ];

      sortedVendors.forEach((vendor) => {
        const activeRevisions = allRevisionIndices.filter(
          (revIndex) => vendor.revisions?.[revIndex]?.boqDetails?.length
        );
        activeRevisions.forEach(() => {
          colWidths.push({ wch: 12 });
          colWidths.push({ wch: 8 });
          colWidths.push({ wch: 12 });
        });
      });

      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Item Level Comparison");

      if (savings) {
        const savingsData = [
          ["Savings Analysis"],
          [""],
          ["Metric", "Amount"],
          ["Target Price Total", targetPriceTotal],
          ["LOP Total (Incl. Tax)", lopTotals.totalInclTax],
          ["First Revision Total", savings.firstRevTotal],
          ["Last Revision Total", savings.lastRevTotal],
          [""],
          ["Savings from Negotiations", savings.negotiations],
          ["Savings vs Target Price", savings.targetVsLastRev],
          // Same guard as the on-screen card and the PDF: with no LOP captured,
          // lopVsLastRev is just `0 - lastRevTotal` and would export as a large
          // fictitious loss.
          [
            "Savings vs LOP",
            lopTotals.totalInclTax > 0 ? savings.lopVsLastRev : 0,
          ],
        ];

        const savingsWs = XLSX.utils.aoa_to_sheet(savingsData);
        savingsWs["!cols"] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, savingsWs, "Savings Analysis");
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `Item_Level_Comparison_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              Item Level Comparison
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Detailed comparison of vendor quotes including GST calculations.
              LOP values are auto-saved as you type.
            </p>
            <p className="text-xs text-amber-600 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Note: Zero or missing prices are automatically replaced with the
              lowest price from other vendors for that item.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Excel
                </>
              )}
            </button>
            {selectedVendors.size > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Star className="h-3 w-3 mr-1" />
                {selectedVendors.size} selected for recommendation
              </Badge>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[300px]">
                  Description
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  UOM
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                  Specification
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Qty
                </th>
                <th className="px-2 py-2 text-center text-[11px] text-gray-500 border-r border-gray-200 w-24">
                  Target Price
                </th>
                <th className="px-2 py-2 text-center text-[11px] text-gray-500 border-l-2 border-r border-gray-200 w-32">
                  LOP
                </th>

                {sortedVendors.map((vendor) => {
                  const activeRevisions = allRevisionIndices.filter(
                    (revIndex) =>
                      vendor.revisions?.[revIndex]?.boqDetails?.length
                  );
                  if (!activeRevisions.length) return null;
                  const isSelected = selectedVendors?.has(
                    vendor.vendorResponseId
                  );

                  const highlight = getVendorHighlight(vendor.vendorResponseId);
                  const isHighlighted = !!highlight;

                  let highlightClass = "";
                  let badgeContent = null;

                  if (isHighlighted) {
                    switch (highlight.colorClass) {
                      case "bg-green-50 border-green-200 text-green-700":
                        highlightClass =
                          "bg-green-50 border-green-200 text-green-700";
                        badgeContent = (
                          <Badge
                            variant="secondary"
                            className="bg-green-600 text-white text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {highlight.label}
                          </Badge>
                        );
                        break;
                      case "bg-blue-50 border-blue-200 text-blue-700":
                        highlightClass =
                          "bg-blue-50 border-blue-200 text-blue-700";
                        badgeContent = (
                          <Badge
                            variant="secondary"
                            className="bg-blue-600 text-white text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {highlight.label}
                          </Badge>
                        );
                        break;
                      case "bg-red-50 border-red-200 text-red-700":
                        highlightClass =
                          "bg-red-50 border-red-200 text-red-700";
                        badgeContent = (
                          <Badge
                            variant="secondary"
                            className="bg-red-600 text-white text-xs"
                          >
                            {highlight.label}
                          </Badge>
                        );
                        break;
                      case "bg-purple-50 border-purple-200 text-purple-700":
                        highlightClass =
                          "bg-purple-50 border-purple-200 text-purple-700";
                        badgeContent = (
                          <Badge
                            variant="secondary"
                            className="bg-purple-600 text-white text-xs"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {highlight.label}
                          </Badge>
                        );
                        break;
                      case "bg-orange-50 border-orange-300 text-orange-800":
                        highlightClass =
                          "bg-orange-50 border-orange-300 text-orange-800";
                        badgeContent = (
                          <Badge
                            variant="secondary"
                            className="bg-orange-600 text-white text-xs"
                          >
                            {highlight.label}
                          </Badge>
                        );
                        break;
                    }
                  } else if (isSelected) {
                    highlightClass = "bg-blue-50 border-blue-200 text-blue-700";
                    badgeContent = (
                      <Badge
                        variant="secondary"
                        className="bg-blue-600 text-white text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    );
                  }

                  return (
                    <th
                      key={vendor.id}
                      colSpan={activeRevisions.length}
                      className={`px-2 py-2 text-center text-[11px] border-r border-gray-200 transition-colors ${highlightClass}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate max-w-[120px]">
                            {vendor.name}
                          </span>
                          {badgeContent}
                        </div>
                        <span className="text-[10px] mt-1">
                          (Quote Price / Total)
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th colSpan={6} className="border-r border-gray-200"></th>
                {(() => {
                  let flatIndex = 0;
                  return sortedVendors.flatMap((vendor) =>
                    allRevisionIndices.map((revIndex) => {
                      const hasData =
                        vendor.revisions?.[revIndex]?.boqDetails?.length;
                      if (!hasData) return null;

                      const isSelected = selectedVendors?.has(
                        vendor.vendorResponseId
                      );

                      const highlight = getVendorHighlight(
                        vendor.vendorResponseId
                      );
                      const isHighlighted = !!highlight;

                      const addLeftBorder =
                        vendorRevisionStartIndices.includes(flatIndex);

                      let highlightClass = "";

                      if (isHighlighted) {
                        highlightClass = highlight.colorClass;
                      } else if (isSelected) {
                        highlightClass = "bg-blue-50 text-blue-700";
                      }

                      const thClass = `px-2 py-2 text-center text-[11px] border-r border-gray-200 transition-colors ${
                        addLeftBorder ? "border-l-2 border-gray-200" : ""
                      } ${highlightClass}`;

                      flatIndex++;
                      return (
                        <th
                          key={`${vendor.id}-rev-${revIndex}`}
                          className={thClass}
                        >
                          R{revIndex}
                        </th>
                      );
                    })
                  );
                })()}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {buyerData.map((item, index) => {
                const displayQty = item.qty || 0;
                const spec = item.specification || "";
                const lopData = lopValues[index] || { price: "", gst: "" };

                const price = parseFloat(lopData.price || "0");
                const gst = parseFloat(lopData.gst || "0");
                const quantity =
                  typeof displayQty === "string"
                    ? parseFloat(displayQty)
                    : Number(displayQty);

                const lineTotalExclTax = price * (quantity || 0);
                const gstAmount = lineTotalExclTax * (gst / 100);
                const lineTotalInclTax = lineTotalExclTax + gstAmount;

                const totals = sortedVendors.flatMap((vendor) =>
                  allRevisionIndices.map((revIndex) => {
                    const revItem = getRevisionItem(vendor, index, revIndex);
                    const revTotal = calculateItemTotal(
                      revItem,
                      displayQty,
                      index,
                      vendor.id,
                      revIndex
                    );
                    return { vendor, revIndex, revItem, revTotal };
                  })
                );

                const validTotals = totals.filter((t) => t.revTotal !== null);
                const minPrice =
                  validTotals.length > 0
                    ? Math.min(
                        ...validTotals.map(
                          (t) => t.revTotal?.lineTotalInclTax ?? 0
                        )
                      )
                    : null;

                return (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 ${expandedItems[index] ? "bg-gray-50" : ""}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 w-[300px]">
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-800 mr-1">
                              Description:
                            </span>
                            <div className="flex-1">
                              {expandedDescriptions[index] ? (
                                <span>{item.description}</span>
                              ) : (
                                <span className="line-clamp-2">
                                  {item.description}
                                </span>
                              )}
                              {item.description.length > 50 && (
                                <button
                                  className="ml-1 text-blue-600 text-xs flex items-center mt-1"
                                  onClick={() =>
                                    toggleDescriptionExpansion(index)
                                  }
                                >
                                  {expandedDescriptions[index] ? (
                                    <>
                                      Show less{" "}
                                      <ChevronUp className="h-3 w-3 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      Show more{" "}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-800 mr-1">
                              Remarks:
                            </span>
                            <div className="flex-1">
                              {expandedRemarks[index] ? (
                                <span>{item.remarks || "N/A"}</span>
                              ) : (
                                <span className="line-clamp-1">
                                  {item.remarks || "N/A"}
                                </span>
                              )}
                              {(item.remarks || "").length > 50 && (
                                <button
                                  className="ml-1 text-blue-600 text-xs flex items-center mt-1"
                                  onClick={() => toggleRemarksExpansion(index)}
                                >
                                  {expandedRemarks[index] ? (
                                    <>
                                      Show less{" "}
                                      <ChevronUp className="h-3 w-3 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      Show more{" "}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className="font-semibold text-gray-800 mr-1">
                            Category:
                          </span>
                          <span>{item.category || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-500">
                      {item.uom}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 w-[200px]">
                      <div className="flex flex-col">
                        {expandedSpecs[index] ? (
                          <div>{spec}</div>
                        ) : (
                          <div className="line-clamp-3">{spec}</div>
                        )}
                        {spec.length > 100 && (
                          <button
                            className="mt-1 text-blue-600 text-xs flex items-center self-start"
                            onClick={() => toggleSpecExpansion(index)}
                          >
                            {expandedSpecs[index] ? (
                              <>
                                Show less <ChevronUp className="h-3 w-3 ml-1" />
                              </>
                            ) : (
                              <>
                                Show more{" "}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-gray-500">
                      {displayQty}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {getCurrencySymbol()}
                      {parseFloat(String(item.targetPrice || 0)).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td className="px-3 py-4 text-center border-l-2 border-gray-200">
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            LOP Price
                          </label>
                          <input
                            type="text"
                            value={lopData.price}
                            onChange={(e) =>
                              handleLopPriceChange(index, e.target.value)
                            }
                            disabled={!isLopFieldEditable(index, "price")}
                            className={`w-24 px-2 py-1 border rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              !isLopFieldEditable(index, "price")
                                ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500"
                                : "border-gray-300 bg-white"
                            }`}
                            placeholder="Enter Price"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            GST (%)
                          </label>
                          <input
                            type="text"
                            value={lopData.gst}
                            onChange={(e) =>
                              handleLopGstChange(index, e.target.value)
                            }
                            disabled={!isLopFieldEditable(index, "gst")}
                            className={`w-24 px-2 py-1 border rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              !isLopFieldEditable(index, "gst")
                                ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500"
                                : "border-gray-300 bg-white"
                            }`}
                            placeholder="Enter GST %"
                            onClick={(e) => e.stopPropagation()}
                            max={100}
                          />
                        </div>
                        <SaveStatusIndicator itemIndex={index} />

                        <div className="mt-1 text-xs text-gray-500">
                          <div>
                            Excl. Tax: {getCurrencySymbol()}
                            {lineTotalExclTax.toFixed(2)}
                          </div>
                          <div>
                            GST: {getCurrencySymbol()}
                            {gstAmount.toFixed(2)}
                          </div>
                          <div className="font-semibold">
                            Total: {getCurrencySymbol()}
                            {lineTotalInclTax.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </td>
                    {(() => {
                      let flatIndex = 0;
                      return totals.map(
                        ({ vendor, revIndex, revItem, revTotal }) => {
                          if (!revItem) return null;

                          const isLowest =
                            minPrice !== null &&
                            revTotal !== null &&
                            Math.abs(revTotal.lineTotalInclTax - minPrice) <
                              0.01;

                          const isSelected = selectedVendors?.has(
                            vendor.vendorResponseId
                          );

                          const highlight = getVendorHighlight(
                            vendor.vendorResponseId
                          );
                          const isHighlighted = !!highlight;

                          const addLeftBorder =
                            vendorRevisionStartIndices.includes(flatIndex);

                          let highlightClass = "";

                          if (isHighlighted) {
                            highlightClass = highlight.colorClass;
                          } else if (isSelected) {
                            highlightClass = "bg-blue-50";
                          }

                          const tdClass = `px-4 py-4 text-center text-sm text-gray-700 transition-colors ${
                            addLeftBorder ? "border-l-2 border-gray-200" : ""
                          } ${highlightClass}`;

                          flatIndex++;

                          return (
                            <td
                              key={`${vendor.id}-${index}-rev-${revIndex}`}
                              className={tdClass}
                            >
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">
                                    {getCurrencySymbol()}
                                    {revTotal?.quotePrice.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </span>
                                  {revTotal?.isReplacedPrice && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-amber-50 text-amber-700 border-amber-300 px-1 py-0"
                                    >
                                      Auto
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  GST: {revItem.gst || 0}%
                                </span>
                                <span className="text-xs font-semibold">
                                  {getCurrencySymbol()}
                                  {revTotal?.lineTotalInclTax.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                                {isLowest && (
                                  <div className="flex items-center justify-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mt-1">
                                    <Award className="h-3 w-3 mr-1" /> Lowest
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        }
                      );
                    })()}
                  </tr>
                );
              })}

              <tr className="border-t-2 border-blue-200 bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  TOTAL
                </td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-center font-bold text-lg">
                  <div className="text-gray-900">
                    {getCurrencySymbol()}
                    {targetPriceTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </td>
                <td className="px-3 py-4 text-center font-bold text-lg border-l-2 border-gray-200">
                  <div className=" text-center font-bold text-lg">
                    <div className="font-bold">
                      {getCurrencySymbol()}
                      {lopTotals.totalInclTax.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </td>
                {(() => {
                  let flatIndex = 0;
                  return sortedVendors.flatMap((vendor) =>
                    allRevisionIndices.map((revIndex) => {
                      const hasData =
                        vendor.revisions?.[revIndex]?.boqDetails?.length;
                      if (!hasData) return null;

                      const key = `${vendor.id}-rev-${revIndex}`;
                      const total = cumulativeTotals[key] || 0;

                      const isLowest =
                        lowestCumulativeTotal !== null &&
                        total > 0 &&
                        Math.abs(total - lowestCumulativeTotal) < 0.01;

                      const isSelected = selectedVendors?.has(
                        vendor.vendorResponseId
                      );

                      const highlight = getVendorHighlight(
                        vendor.vendorResponseId
                      );
                      const isHighlighted = !!highlight;

                      const addLeftBorder =
                        vendorRevisionStartIndices.includes(flatIndex);

                      let highlightClass = "";

                      if (isHighlighted) {
                        highlightClass = highlight.colorClass;
                      } else if (isSelected) {
                        highlightClass = "bg-blue-50";
                      }

                      const tdClass = `px-4 py-4 text-center font-bold text-lg transition-colors ${
                        addLeftBorder ? "border-l-2 border-gray-200" : ""
                      } ${highlightClass}`;

                      flatIndex++;

                      return (
                        <td key={key} className={tdClass}>
                          <div className="flex flex-col items-center">
                            <div className="font-bold">
                              {getCurrencySymbol()}
                              {total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            {isLowest && (
                              <div className="flex items-center justify-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mt-1">
                                <Award className="h-3 w-3 mr-1" /> Lowest{" "}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })
                  );
                })()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {savings && (
        <SavingsAnalysis
          targetPriceTotal={targetPriceTotal}
          lopTotals={lopTotals}
          savings={savings}
          getCurrencySymbol={getCurrencySymbol}
        />
      )}
    </div>
  );
};
