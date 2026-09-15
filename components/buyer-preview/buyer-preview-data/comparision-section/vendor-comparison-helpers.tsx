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

export const calculateItemTotal = (
  item: BoqItem,
  buyerQty?: number
): PriceCalculation => {
  const price = parseFloat(String(item.quotePrice)) || 0;
  const quantity =
    buyerQty !== undefined ? buyerQty : parseFloat(String(item.qty)) || 0;
  const gst = parseFloat(String(item.gst)) || 0;

  const subtotal = price * quantity;
  const totalWithTax = subtotal * (1 + gst / 100);

  return {
    grossAmount: subtotal,
    actualPrice: totalWithTax,
  };
};

export const calculateTotal = (
  boqDetails: BoqItem[],
  buyerData?: any[]
): PriceCalculation => {
  if (!boqDetails || !Array.isArray(boqDetails)) {
    return { grossAmount: 0, actualPrice: 0 };
  }

  return boqDetails.reduce(
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
    const latestBoq = latestRevision.boqDetails || [];

    // Calculate latest totals
    const latestTotal = calculateTotal(latestBoq, buyerData).actualPrice;

    // Calculate price difference between first and latest revision
    let priceDifference = 0;
    if (revisionCount > 1) {
      const firstRevision = revisions[0];
      const firstBoq = firstRevision?.boqDetails || [];
      const firstTotal = calculateTotal(firstBoq, buyerData).actualPrice;
      priceDifference = firstTotal - latestTotal; // R0 - R1 (positive means discount)
    }

    return {
      id: vendor.id,
      vendorResponseId: vendor.vendorResponseId || "N/A",
      name: vendor.companydetails?.companyName || "Unknown Vendor",
      email: vendor.companydetails?.email || "N/A",
      phone: vendor.companydetails?.phone || "N/A",
      location: formatAddress(vendor.companydetails),
      quoteRefId: vendor.vendorResponseId || "N/A",
      revision: revisionCount > 0 ? `R${revisionCount - 1}` : "R0",
      overallScore: vendor.evaluationScore || 0,
      deliveryTime: latestRevision?.generalTerms?.deliveryTimeValue || "N/A",
      complianceScore: calculateComplianceScore(latestRevision),
      logoUrl: vendor.logoUrl,
      boqDetails: latestBoq,
      grossAmount: calculateTotal(latestBoq, buyerData).grossAmount,
      actualPrice: latestTotal,
      priceDifference,
      revisionCount,
      exclusions: latestRevision?.exclusions || "None",
      status: vendor.status,
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
