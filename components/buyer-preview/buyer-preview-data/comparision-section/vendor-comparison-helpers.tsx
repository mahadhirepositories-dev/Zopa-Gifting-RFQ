// components/buyer-preview/buyer-preview-data/comparision-section/vendor-comparison-helpers.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper interfaces
interface PriceCalculation {
  grossAmount: number;
  actualPrice: number;
}

interface BoqItem {
  description?: string;
  quotePrice?: string | number;
  qty?: string | number;
  gst?: string | number;
  uom?: string;
  make?: string;
  model?: string;
  specification?: string;
  targetPrice?: string | number;
  compliance?: string;
}

export interface ProcessedVendor {
  id: string;
   vendorResponseId: string; // Add this line
  name: string;
  email: string;
  phone: string;
  location: string;
  quoteRefId: string;
  revision: string;
  overallScore: number;
  deliveryTime: string;
  complianceScore: number;
  logoUrl?: string;
  boqDetails: BoqItem[];
  grossAmount: number;
  actualPrice: number;
  priceDifference: number;
  revisionCount: number;
  otherInformation: string;
  status: string;
  revisions?: any[];
}

export function getVendorBOQSubItems(
  boqDetails: any,
  index: number,
  buyerItem?: any
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
    const atts =
      Array.isArray(sub?.vendorAttachments) && sub.vendorAttachments.length > 0
        ? sub.vendorAttachments
        : sub?.vendorAttachmentUrl
        ? [
            {
              url: sub.vendorAttachmentUrl,
              name: sub.vendorAttachmentName || "Attachment",
            },
          ]
        : target?.vendorAttachmentUrl
        ? [
            {
              url: target.vendorAttachmentUrl,
              name: target.vendorAttachmentName || "Attachment",
            },
          ]
        : [];

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

export const calculateItemTotal = (
  item: BoqItem,
  buyerQty?: number,
  selectedIndex: number = 0
): PriceCalculation => {
  if (!item) return { grossAmount: 0, actualPrice: 0 };

  let subItemsList: any[] = [];
  if (Array.isArray((item as any).items) && (item as any).items.length > 0) {
    subItemsList = (item as any).items;
  } else if (Array.isArray(item)) {
    subItemsList = item;
  } else {
    subItemsList = [item];
  }

  if (subItemsList.length === 0) return { grossAmount: 0, actualPrice: 0 };

  const sub: any = subItemsList[selectedIndex] || subItemsList[0];

  const price =
    parseFloat(
      String(
        sub?.quotePrice ??
          sub?.price ??
          (item as any)?.quotePrice ??
          (item as any)?.price ??
          0
      )
    ) || 0;

  const quantity =
    sub?.qty !== undefined && sub?.qty !== null && sub?.qty !== ""
      ? parseFloat(String(sub.qty))
      : buyerQty !== undefined
      ? buyerQty
      : parseFloat(String((item as any)?.qty)) || 0;

  const gst =
    parseFloat(
      String(
        sub?.gstPercent ?? sub?.gst ?? (item as any)?.gst ?? 0
      )
    ) || 0;

  const subtotal = price * quantity;
  const totalWithTax = subtotal * (1 + gst / 100);

  return {
    grossAmount: subtotal,
    actualPrice: totalWithTax,
  };
};

export const calculateTotal = (
  boqDetails: BoqItem[] | Record<string, any>,
  buyerData?: any[]
): PriceCalculation => {
  if (!boqDetails) {
    return { grossAmount: 0, actualPrice: 0 };
  }

  let itemsArray: any[] = [];
  if (Array.isArray(boqDetails)) {
    itemsArray = boqDetails;
  } else if (typeof boqDetails === "object") {
    itemsArray = Object.values(boqDetails);
  }

  return itemsArray.reduce(
    (acc, item, index) => {
      const buyerQty = buyerData?.[index]?.qty
        ? parseFloat(String(buyerData[index].qty))
        : undefined;
      const { grossAmount, actualPrice } = calculateItemTotal(item, buyerQty);

      return {
        grossAmount: acc.grossAmount + grossAmount,
        actualPrice: acc.actualPrice + actualPrice,
      };
    },
    { grossAmount: 0, actualPrice: 0 }
  );
};

export const calculateComplianceScore = (revision: any): number => {
  if (!revision) return 0;

  let score = 0;
  if (revision.scopeOfWork?.agreement === "agree") score += 1;
  if (revision.generalTerms?.agreement === "agree") score += 1;
  if (revision.specialTerms?.agreement === "agree") score += 1;
  if (revision.financialTerms?.paymentTermsAgreement === "agree") score += 1;
  if (revision.financialTerms?.currencyAgreement === "agree") score += 1;

  return score;
};

export const calculatePriceDifference = (
  currentBoq: BoqItem[],
  previousBoq: BoqItem[],
  buyerData?: any[]
): number => {
  if (!currentBoq || !previousBoq) return 0;

  const currentTotal = calculateTotal(currentBoq, buyerData).actualPrice;
  const previousTotal = calculateTotal(previousBoq, buyerData).actualPrice;

  return previousTotal - currentTotal;
};

export const findLowestPriceVendor = (
  vendors: ProcessedVendor[]
): ProcessedVendor | null => {
  if (!vendors || vendors.length === 0) return null;
  return vendors.reduce((lowest, vendor) => {
    return vendor.actualPrice < lowest.actualPrice ? vendor : lowest;
  }, vendors[0]);
};

export const findFastestDeliveryVendor = (
  vendors: ProcessedVendor[]
): ProcessedVendor | null => {
  if (!vendors || vendors.length === 0) return null;

  return vendors.reduce((fastest, vendor) => {
    const currentTime = parseInt(vendor.deliveryTime) || Infinity;
    const fastestTime = parseInt(fastest.deliveryTime) || Infinity;
    return currentTime < fastestTime ? vendor : fastest;
  }, vendors[0]);
};

export const formatAddress = (companyDetails: any): string => {
  if (!companyDetails) return "N/A";

  const addressParts = [
    companyDetails.addressLine1,
    companyDetails.addressLine2,
    companyDetails.city,
    companyDetails.state,
    companyDetails.postalCode,
    companyDetails.country,
  ].filter((part) => part && part.trim() !== "");

  return addressParts.join(", ");
};

export const processVendors = (
  formattedResponses: any[],
  buyerData?: any[]
): ProcessedVendor[] => {
  if (!formattedResponses || !Array.isArray(formattedResponses)) return [];

  return formattedResponses.map((vendor) => {
    // Get all revisions in correct order (R0, R1, R2, etc.)
    let revisions: any[] = [];
    if (Array.isArray(vendor.revisions)) {
      revisions = [...vendor.revisions];
    } else if (
      vendor.revisionNumber &&
      typeof vendor.revisionNumber === "object"
    ) {
      revisions = Object.values(vendor.revisionNumber);
    }

    // Sort revisions by revision number to ensure correct order
    revisions.sort((a, b) => (a.revisionNumber || 0) - (b.revisionNumber || 0));

    const revisionCount = revisions.length;
    // Use isCurrent flag first, fallback to last in sorted array
    const latestRevision = revisions.find((r) => r.isCurrent === true) 
      || revisions[revisionCount - 1] 
      || {};
    const latestBoq = latestRevision.boqDetails || latestRevision.boqQuotes || [];

    // Calculate latest totals
    const latestTotal = calculateTotal(latestBoq, buyerData).actualPrice;

    // Calculate price difference between first and latest revision
    let priceDifference = 0;
    if (revisionCount > 1) {
      const firstRevision = revisions[0];
      const firstBoq = firstRevision?.boqDetails || firstRevision?.boqQuotes || [];
      const firstTotal = calculateTotal(firstBoq, buyerData).actualPrice;
      priceDifference = firstTotal - latestTotal; // R0 - R1 (positive means discount)
    }

    const comp =
      vendor.companydetails ||
      vendor.companyDetails ||
      vendor.companyInfo ||
      vendor.vendorCompanyDetails ||
      {};

    const companyName =
      comp.companyName ||
      comp.name ||
      vendor.companyName ||
      vendor.vendorName ||
      vendor.company_name ||
      vendor.vendorResponseId ||
      "Vendor";

    return {
      id: vendor.id || vendor.vendorResponseId,
      vendorResponseId: vendor.vendorResponseId || "N/A",
      name: companyName,
      email: comp.email || vendor.vendorEmail || "N/A",
      phone: comp.phone || "N/A",
      location: formatAddress(comp),
      quoteRefId: vendor.vendorResponseId || "N/A",
      revision: revisionCount > 0 ? `R${revisionCount - 1}` : "R0",
      overallScore: vendor.evaluationScore || 0,
      deliveryTime: latestRevision?.generalTerms?.deliveryTimeValue || "",
      complianceScore: calculateComplianceScore(latestRevision),
      logoUrl: comp.logoUrl || vendor.logoUrl,
      boqDetails: latestBoq,
      grossAmount: calculateTotal(latestBoq, buyerData).grossAmount,
      actualPrice: latestTotal,
      priceDifference,
      revisionCount,
      exclusions: latestRevision?.exclusions || "None",
      status: vendor.status || "submitted",
      revisions,
      otherInformation: latestRevision?.otherInformation,
    };
  });
};

export const getAllBoqItems = (
  processedVendors: ProcessedVendor[]
): BoqItem[] => {
  if (!processedVendors || !Array.isArray(processedVendors)) return [];

  const items = new Map<string, BoqItem>();

  processedVendors.forEach((vendor) => {
    vendor.boqDetails?.forEach((item, index) => {
      const key = item.description || `Item ${index + 1}`;
      if (!items.has(key)) {
        items.set(key, {
          description: key,
          uom: item.uom || "EA",
          qty: item.qty || 1,
          specification: item.specification || "N/A",
          targetPrice: item.targetPrice || "N/A",
          make: item.make || "N/A",
          model: item.model || "N/A",
          compliance: item.compliance || "N/A",
        });
      }
    });
  });

  return Array.from(items.values());
};
