/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from "react";
import { Award, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { calculateLocationRankings, LocationRanking } from "./location";

// Interfaces
interface CriterionConfig {
  id: string;
  name: string;
  dataType: string;
  displayOrder: number;
  weights: {
    cost: number;
    quality: number;
    qcbs: number;
  };
}

interface DataTypeConfig {
  id: string;
  name: string;
  scoreMappings: Array<{
    label: string;
    score: number;
    displayOrder: number;
    operator?: string;
    value?: number;
    rangeStart?: number;
    rangeEnd?: number;
  }>;
}

interface ScoringConfiguration {
  criteria: CriterionConfig[];
  dataTypes: DataTypeConfig[];
}

interface BuyerDataItem {
  id: number;
  description: string;
  uom: string;
  qty: string | number;
  specification?: string;
  targetPrice?: string | number;
  remarks?: string;
  category?: string;
  lopPrice?: string | number;
  lopGst?: string | number;
  location?: string;
  latitude?: number;
  longitude?: number;
}

interface ProcessedVendor {
  id: string | number;
  name: string;
  vendorResponseId: string;
  actualPrice?: number;
  paymentTerms?: number;
  companyType?: string;
  deliveryTime?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  hasVAS?: boolean;
  isGSTRegistered?: boolean;
  companydetails?: {
    companyName?: string;
    businessType?: string;
  };
  revisions?: any[];
  generalTerms?: {
    agreement?: string;
    deliveryTimeValue?: number;
    dispatchLocation?: {
      latitude: string | number;
      longitude: string | number;
      name: string;
      state: string;
    };
  };
}

interface VendorScore {
  total: string;
  cost: string;
  quality: string;
  qcbs: string;
  breakdown: Record<
    string,
    {
      name: string;
      score: number;
      costWeight: number;
      qualityWeight: number;
      qcbsWeight: number;
      costScore: number;
      qualityScore: number;
      qcbsScore: number;
      value?: any;
    }
  >;
}

interface VendorWithScores extends ProcessedVendor {
  scores: VendorScore;
}

interface ScoringCalculatorProps {
  vendors: ProcessedVendor[];
  config: ScoringConfiguration;
  buyerData?: BuyerDataItem[];
  buyerLocation: { latitude: number; longitude: number } | null;
  targetPriceTotal: number;
  selectedVendors: Map<string, any>;
  expandedVendor: string | null;
  showCriteriaDetails: boolean;
  onToggleExpansion: (vendorId: string) => void;
  onToggleDetails: () => void;
}

// Enhanced vendor data mapping for criteria
const mapVendorDataToCriteria = (
  criterionName: string,
  vendor: ProcessedVendor,
  allVendors: ProcessedVendor[],
  priceRankings?: Map<
    string,
    { level: string; score: number; actualPrice?: number }
  >,
  locationRankings?: Map<string, LocationRanking>
): any => {
  const criterionLower = criterionName.toLowerCase();

  // Price criteria
  if (criterionLower.includes("price") || criterionLower.includes("cost")) {
    if (priceRankings) {
      const ranking = priceRankings.get(vendor.vendorResponseId);
      if (ranking) return ranking.level;
    }
    return "L3";
  }

  // Location criteria
  if (
    criterionLower.includes("location") ||
    criterionLower.includes("distance")
  ) {
    if (locationRankings) {
      const ranking = locationRankings.get(vendor.vendorResponseId);
      if (ranking) return ranking.distance;
    }
    return 100;
  }

  // Delivery Time
  if (criterionLower.includes("delivery") || criterionLower.includes("time")) {
    return vendor.deliveryTime || vendor.generalTerms?.deliveryTimeValue || 0;
  }

  // Payment Terms
  if (criterionLower.includes("payment") || criterionLower.includes("terms")) {
    return vendor.paymentTerms || 0;
  }

  // Company Type
  if (criterionLower.includes("company") || criterionLower.includes("type")) {
    return (
      vendor.companyType || vendor.companydetails?.businessType || "Unknown"
    );
  }

  // GST Registration
  if (criterionLower.includes("gst") || criterionLower.includes("registered")) {
    return vendor.isGSTRegistered ? "Yes" : "No";
  }

  // VAS (Value Added Services)
  if (criterionLower.includes("vas") || criterionLower.includes("value")) {
    return vendor.hasVAS ? "Yes" : "No";
  }

  // Agreement
  if (criterionLower.includes("agreement")) {
    return vendor.generalTerms?.agreement || "No";
  }

  // SPEC COMPLIANCE - Enhanced mapping
  if (
    criterionLower.includes("spec") ||
    criterionLower.includes("compliance")
  ) {
    // Check if vendor has specification compliance data
    // This could be based on revisions, response quality, or other factors
    if (vendor.revisions && vendor.revisions.length > 0) {
      // Vendors with revisions might be more compliant
      return vendor.revisions.length >= 2 ? "High" : "Medium";
    }

    // Check for other compliance indicators
    if (vendor.isGSTRegistered && vendor.companyType === "Manufacturer") {
      return "High";
    }

    // Default based on company type and other factors
    if (
      vendor.companyType === "Manufacturer" ||
      vendor.companyType === "Authorized Dealer"
    ) {
      return "Medium";
    }

    return "Low";
  }

  // CRITERIA COMPLIANCE - Enhanced mapping
  if (
    criterionLower.includes("criteria") &&
    criterionLower.includes("compliance")
  ) {
    // Calculate compliance based on multiple factors
    let complianceScore = 0;

    // GST registration adds to compliance
    if (vendor.isGSTRegistered) complianceScore += 1;

    // Company type compliance
    if (
      vendor.companyType &&
      ["Manufacturer", "Authorized Dealer", "Distributor"].includes(
        vendor.companyType
      )
    ) {
      complianceScore += 1;
    }

    // Payment terms compliance (longer terms might indicate better compliance)
    if (vendor.paymentTerms && vendor.paymentTerms >= 30) {
      complianceScore += 1;
    }

    // Delivery time compliance (reasonable delivery times)
    const deliveryTime =
      vendor.deliveryTime || vendor.generalTerms?.deliveryTimeValue;
    if (deliveryTime && deliveryTime <= 30) {
      complianceScore += 1;
    }

    // Map score to compliance levels
    if (complianceScore >= 3) return "High";
    if (complianceScore >= 2) return "Medium";
    return "Low";
  }

  // QUALITY RATING - Enhanced mapping
  if (criterionLower.includes("quality") || criterionLower.includes("rating")) {
    // Calculate quality rating based on multiple factors
    let qualityScore = 3; // Default medium

    // Company type affects quality perception
    if (vendor.companyType === "Manufacturer") qualityScore += 1;
    if (vendor.companyType === "Authorized Dealer") qualityScore += 0.5;

    // GST registration indicates legitimacy
    if (vendor.isGSTRegistered) qualityScore += 0.5;

    // Value added services indicate better quality
    if (vendor.hasVAS) qualityScore += 0.5;

    // Payment terms (better companies offer better terms)
    if (vendor.paymentTerms && vendor.paymentTerms >= 45) qualityScore += 0.5;

    // Cap the score and convert to rating
    const finalScore = Math.min(Math.max(qualityScore, 1), 5);

    if (finalScore >= 4.5) return "Excellent";
    if (finalScore >= 3.5) return "Good";
    if (finalScore >= 2.5) return "Average";
    return "Poor";
  }

  // TECHNICAL CAPABILITY - New mapping
  if (
    criterionLower.includes("technical") ||
    criterionLower.includes("capability")
  ) {
    // Assess technical capability based on available data
    if (vendor.companyType === "Manufacturer") return "High";
    if (vendor.companyType === "Authorized Dealer") return "Medium-High";
    if (vendor.companyType === "Distributor") return "Medium";
    if (vendor.hasVAS) return "Medium"; // Value added services indicate some technical capability

    return "Low";
  }

  // FINANCIAL STABILITY - New mapping
  if (
    criterionLower.includes("financial") ||
    criterionLower.includes("stability")
  ) {
    // Assess financial stability based on available indicators
    const stabilityIndicators = [];

    if (vendor.isGSTRegistered) stabilityIndicators.push("GST");
    if (
      vendor.companyType &&
      ["Manufacturer", "Authorized Dealer"].includes(vendor.companyType)
    ) {
      stabilityIndicators.push("Established Business");
    }
    if (vendor.paymentTerms && vendor.paymentTerms >= 30) {
      stabilityIndicators.push("Good Payment Terms");
    }

    if (stabilityIndicators.length >= 3) return "High";
    if (stabilityIndicators.length >= 2) return "Medium";
    return "Low";
  }
  return "Unknown";
};

// Enhanced scoring function with better fallbacks
const buildScoringFunction = (
  dataType: string,
  dataTypeConfigs: DataTypeConfig[]
): ((value: any) => number) => {
  const config = dataTypeConfigs.find(
    (dt) =>
      dt.name.toLowerCase().includes(dataType.toLowerCase()) ||
      dt.id.toLowerCase().includes(dataType.toLowerCase())
  );

  if (!config || !config.scoreMappings.length) {
    // Enhanced default scoring functions for various data types
    const dataTypeLower = dataType.toLowerCase();

    if (dataTypeLower.includes("price") || dataTypeLower.includes("cost")) {
      return (value: any) => {
        const stringValue = String(value).toUpperCase().trim();
        if (stringValue === "L1") return 5;
        if (stringValue === "L2") return 3;
        if (stringValue === "L3") return 1;
        return 1; // Default low score for unknown price levels
      };
    }

    if (
      dataTypeLower.includes("location") ||
      dataTypeLower.includes("distance")
    ) {
      return (value: any) => {
        const distance = parseFloat(value);
        if (isNaN(distance)) return 3;
        if (distance <= 50) return 5;
        if (distance <= 100) return 4;
        if (distance <= 200) return 3;
        if (distance <= 500) return 2;
        return 1;
      };
    }

    if (dataTypeLower.includes("delivery") || dataTypeLower.includes("time")) {
      return (value: any) => {
        const deliveryTime = parseFloat(value);
        if (isNaN(deliveryTime)) return 3;
        if (deliveryTime <= 7) return 5;
        if (deliveryTime <= 14) return 4;
        if (deliveryTime <= 30) return 3;
        return 1;
      };
    }

    if (dataTypeLower.includes("payment") || dataTypeLower.includes("terms")) {
      return (value: any) => {
        const paymentTerms = parseFloat(value);
        if (isNaN(paymentTerms)) return 3;
        if (paymentTerms >= 60) return 5;
        if (paymentTerms >= 45) return 4;
        if (paymentTerms >= 30) return 3;
        return 1;
      };
    }

    if (dataTypeLower.includes("gst") || dataTypeLower.includes("registered")) {
      return (value: any) => (value === "Yes" ? 5 : 1);
    }

    if (dataTypeLower.includes("vas") || dataTypeLower.includes("value")) {
      return (value: any) => (value === "Yes" ? 5 : 1);
    }

    if (
      dataTypeLower.includes("compliance") ||
      dataTypeLower.includes("spec")
    ) {
      return (value: any) => {
        const stringValue = String(value).toLowerCase().trim();
        if (stringValue === "high" || stringValue === "excellent") return 5;
        if (stringValue === "medium" || stringValue === "good") return 3;
        if (stringValue === "low" || stringValue === "poor") return 1;
        return 3; // Default medium score
      };
    }

    if (dataTypeLower.includes("quality") || dataTypeLower.includes("rating")) {
      return (value: any) => {
        const stringValue = String(value).toLowerCase().trim();
        if (stringValue === "excellent") return 5;
        if (stringValue === "good") return 4;
        if (stringValue === "average") return 3;
        if (stringValue === "poor") return 1;
        return 3; // Default average score
      };
    }

    if (
      dataTypeLower.includes("technical") ||
      dataTypeLower.includes("capability")
    ) {
      return (value: any) => {
        const stringValue = String(value).toLowerCase().trim();
        if (stringValue.includes("high")) return 5;
        if (stringValue.includes("medium-high")) return 4;
        if (stringValue.includes("medium")) return 3;
        return 1; // Default low score
      };
    }

    if (
      dataTypeLower.includes("financial") ||
      dataTypeLower.includes("stability")
    ) {
      return (value: any) => {
        const stringValue = String(value).toLowerCase().trim();
        if (stringValue === "high") return 5;
        if (stringValue === "medium") return 3;
        if (stringValue === "low") return 1;
        return 3; // Default medium score
      };
    }

    // Default scoring for unknown data types
    return (value: any) => {
      if (value === undefined || value === null || value === "") return 0;

      // Try to parse numeric values
      const numValue = parseFloat(String(value));
      if (!isNaN(numValue)) {
        if (numValue >= 80) return 5;
        if (numValue >= 60) return 4;
        if (numValue >= 40) return 3;
        if (numValue >= 20) return 2;
        return 1;
      }

      // String value scoring
      const stringValue = String(value).toLowerCase().trim();
      if (
        stringValue === "yes" ||
        stringValue === "high" ||
        stringValue === "excellent"
      )
        return 5;
      if (
        stringValue === "medium" ||
        stringValue === "good" ||
        stringValue === "average"
      )
        return 3;
      if (
        stringValue === "no" ||
        stringValue === "low" ||
        stringValue === "poor"
      )
        return 1;

      return 3; // Default medium score
    };
  }

  return (value: any) => {
    if (value === undefined || value === null || value === "") return 0;

    // Enhanced price scoring
    if (dataType.toLowerCase().includes("price")) {
      const stringValue = String(value).toUpperCase().trim();
      for (const mapping of config.scoreMappings) {
        const label = String(mapping.label).toUpperCase().trim();
        if (stringValue === label) return mapping.score;
      }
      return 1; // Default low score for unknown price levels
    }

    // Enhanced location scoring
    if (dataType.toLowerCase().includes("location")) {
      const numValue = parseFloat(String(value));
      if (isNaN(numValue)) return 0;

      for (const mapping of config.scoreMappings) {
        if (
          mapping.operator === "range" &&
          mapping.rangeStart !== undefined &&
          mapping.rangeEnd !== undefined
        ) {
          if (numValue >= mapping.rangeStart && numValue < mapping.rangeEnd) {
            return mapping.score;
          }
        }
      }
      return 3; // Default medium score
    }

    // Enhanced compliance and quality scoring
    if (
      dataType.toLowerCase().includes("compliance") ||
      dataType.toLowerCase().includes("quality") ||
      dataType.toLowerCase().includes("technical") ||
      dataType.toLowerCase().includes("financial")
    ) {
      const stringValue = String(value).toLowerCase().trim();

      // First try exact match
      for (const mapping of config.scoreMappings) {
        const label = String(mapping.label).toLowerCase().trim();
        if (stringValue === label) return mapping.score;
      }

      // Then try partial match
      for (const mapping of config.scoreMappings) {
        const label = String(mapping.label).toLowerCase().trim();
        if (stringValue.includes(label) || label.includes(stringValue)) {
          return mapping.score;
        }
      }

      return 3; // Default medium score
    }

    // Other data types - enhanced matching
    const stringValue = String(value).toLowerCase().trim();
    const numValue = parseFloat(stringValue);

    // Exact match for string values
    for (const mapping of config.scoreMappings) {
      const label = String(mapping.label).toLowerCase().trim();
      if (stringValue === label) return mapping.score;
    }

    // Enhanced numeric matching
    if (!isNaN(numValue)) {
      for (const mapping of config.scoreMappings) {
        const mappingData = mapping as any;

        if (mappingData.operator === "gte" && mappingData.value !== undefined) {
          if (numValue >= Number(mappingData.value)) return mapping.score;
        }

        if (mappingData.operator === "lte" && mappingData.value !== undefined) {
          if (numValue <= Number(mappingData.value)) return mapping.score;
        }

        if (
          mappingData.operator === "range" &&
          mappingData.rangeStart !== undefined &&
          mappingData.rangeEnd !== undefined
        ) {
          if (
            numValue >= Number(mappingData.rangeStart) &&
            numValue < Number(mappingData.rangeEnd)
          ) {
            return mapping.score;
          }
        }
      }
    }

    // Partial string matching as fallback
    for (const mapping of config.scoreMappings) {
      const label = String(mapping.label).toLowerCase().trim();
      if (stringValue.includes(label) || label.includes(stringValue)) {
        return mapping.score;
      }
    }

    return Math.min(...config.scoreMappings.map((m) => m.score));
  };
};

// Price ranking calculation (unchanged)
const calculatePriceRankings = (
  vendors: ProcessedVendor[]
): Map<string, { level: string; score: number; actualPrice?: number }> => {
  const rankings = new Map<
    string,
    { level: string; score: number; actualPrice?: number }
  >();

  const vendorsWithPrices = vendors
    .filter((vendor) => vendor.actualPrice && vendor.actualPrice > 0)
    .sort((a, b) => (a.actualPrice || 0) - (b.actualPrice || 0));

  if (vendorsWithPrices.length === 0) {
    vendors.forEach((vendor) => {
      rankings.set(vendor.vendorResponseId, {
        level: "L3",
        score: 1,
        actualPrice: vendor.actualPrice,
      });
    });
    return rankings;
  }

  vendorsWithPrices.forEach((vendor, index) => {
    let level: string;
    if (index === 0) level = "L1";
    else if (index === 1) level = "L2";
    else level = "L3";

    rankings.set(vendor.vendorResponseId, {
      level,
      score: level === "L1" ? 5 : level === "L2" ? 3 : 1,
      actualPrice: vendor.actualPrice,
    });
  });

  // Handle vendors without prices
  vendors.forEach((vendor) => {
    if (!vendor.actualPrice || vendor.actualPrice <= 0) {
      rankings.set(vendor.vendorResponseId, {
        level: "L3",
        score: 1,
        actualPrice: vendor.actualPrice,
      });
    }
  });

  return rankings;
};

// Enhanced scoring calculation for Cost, Quality, and QCBS
const calculateDynamicVendorScore = (
  vendor: ProcessedVendor,
  config: ScoringConfiguration,
  allVendors: ProcessedVendor[],
  priceRankings?: Map<
    string,
    { level: string; score: number; actualPrice?: number }
  >,
  locationRankings?: Map<string, LocationRanking>
): VendorScore => {
  let totalCostScore = 0;
  let totalQualityScore = 0;
  let totalQcbsScore = 0;
  const breakdown: Record<string, any> = {};
  config.criteria.forEach((criterion) => {
    const scoringFn = buildScoringFunction(
      criterion.dataType,
      config.dataTypes
    );
    const vendorValue = mapVendorDataToCriteria(
      criterion.name,
      vendor,
      allVendors,
      priceRankings,
      locationRankings
    );
    const score = scoringFn(vendorValue);
    const costScore = score * criterion.weights.cost;
    const qualityScore = score * criterion.weights.quality;
    const qcbsScore = score * criterion.weights.qcbs;
    totalCostScore += costScore;
    totalQualityScore += qualityScore;
    totalQcbsScore += qcbsScore;
    breakdown[criterion.id] = {
      name: criterion.name,
      score,
      costWeight: criterion.weights.cost * 100,
      qualityWeight: criterion.weights.quality * 100,
      qcbsWeight: criterion.weights.qcbs * 100,
      costScore,
      qualityScore,
      qcbsScore,
      value: vendorValue,
    };
  });
  const totalScore = (totalCostScore + totalQualityScore + totalQcbsScore) / 3;
  return {
    total: totalScore.toFixed(2),
    cost: totalCostScore.toFixed(2),
    quality: totalQualityScore.toFixed(2),
    qcbs: totalQcbsScore.toFixed(2),
    breakdown,
  };
};

const ScoreBar: React.FC<{ score: number; max?: number }> = ({
  score,
  max = 5,
}) => {
  const percentage = (score / max) * 100;
  let color = "bg-red-500";

  if (score >= 4) color = "bg-green-500";
  else if (score >= 3) color = "bg-yellow-500";
  else if (score >= 2) color = "bg-orange-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8">{score.toFixed(1)}</span>
    </div>
  );
};

export const ScoringCalculator: React.FC<ScoringCalculatorProps> = ({
  vendors,
  config,
  buyerLocation,
  selectedVendors,
  expandedVendor,
  showCriteriaDetails,
  onToggleExpansion,
  onToggleDetails,
}) => {
  const priceRankings = useMemo(() => {
    if (!config) return new Map();
    return calculatePriceRankings(vendors);
  }, [vendors, config]);

  const locationRankings = useMemo(() => {
    if (!config || !buyerLocation) return new Map();

    const vendorLocationData: any[] = vendors.map(
      (vendor: ProcessedVendor) => ({
        vendorResponseId: vendor.vendorResponseId,
        name: vendor.name,
        revisions: vendor.revisions,
        dispatchLocation: vendor.generalTerms?.dispatchLocation,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
        location: vendor.location,
      })
    );

    return calculateLocationRankings(
      vendorLocationData,
      config.dataTypes,
      buyerLocation
    );
  }, [vendors, config, buyerLocation]);

  const vendorsWithScores: VendorWithScores[] = useMemo(() => {
    if (!config || !vendors.length) return [];
    const scoredVendors = vendors.map((vendor: ProcessedVendor) => {
      const score = calculateDynamicVendorScore(
        vendor,
        config,
        vendors,
        priceRankings,
        locationRankings
      );
      return {
        ...vendor,
        scores: score,
      };
    });
    return scoredVendors;
  }, [vendors, config, priceRankings, locationRankings]);

  const sortedVendors = useMemo(() => {
    return [...vendorsWithScores].sort((a, b) => {
      return parseFloat(b.scores.total) - parseFloat(a.scores.total);
    });
  }, [vendorsWithScores]);

  return (
    <>
      {/* Main Rankings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">
                  Zopa Recommended Rankings
                </h2>
                <p className="text-sm text-gray-600">
                  Ranked by total score across Cost, Quality, and QCBS criteria
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Price (₹)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Cost Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Quality Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  QCBS Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Total Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedVendors.map((vendor, index) => {
                const isWinner = index === 0;
                const isSelected = selectedVendors.has(vendor.vendorResponseId);
                const isExpanded = expandedVendor === vendor.vendorResponseId;

                return (
                  <React.Fragment key={vendor.id}>
                    <tr
                      className={`hover:bg-gray-50 ${isWinner ? "bg-green-50" : isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {isWinner && (
                            <Award className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <span className="font-semibold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {vendor.name}
                        {isSelected && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {vendor.actualPrice?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ScoreBar score={parseFloat(vendor.scores.cost)} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ScoreBar score={parseFloat(vendor.scores.quality)} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ScoreBar score={parseFloat(vendor.scores.qcbs)} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {vendor.scores.total}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            onToggleExpansion(vendor.vendorResponseId)
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {isExpanded ? "Hide" : "Show"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-gray-50 border-t border-gray-200 p-6">
                            <div className="max-w-6xl mx-auto">
                              <h4 className="text-lg font-semibold mb-4">
                                {vendor.name} - Score Breakdown
                              </h4>

                              {/* Total Scores */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                                  <div className="text-2xl font-bold text-blue-600 mb-1">
                                    {vendor.scores.total}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">
                                    Total Score
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                                  <div className="text-2xl font-bold text-green-600 mb-1">
                                    {vendor.scores.cost}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">
                                    Cost Score
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                                  <div className="text-2xl font-bold text-purple-600 mb-1">
                                    {vendor.scores.quality}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">
                                    Quality Score
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                                  <div className="text-2xl font-bold text-orange-600 mb-1">
                                    {vendor.scores.qcbs}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700">
                                    QCBS Score
                                  </div>
                                </div>
                              </div>

                              {/* Criteria Breakdown */}
                              {Object.keys(vendor.scores.breakdown).length >
                              0 ? (
                                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <h5 className="font-semibold text-lg mb-4">
                                    Criteria Breakdown
                                  </h5>
                                  <div className="space-y-3">
                                    {Object.entries(
                                      vendor.scores.breakdown
                                    ).map(([key, data]: [string, any]) => (
                                      <div
                                        key={key}
                                        className="border-b border-gray-100 pb-3 last:border-0"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium">
                                            {data.name}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <div className="flex justify-between mb-1">
                                              <span className="text-gray-600">
                                                Cost
                                              </span>
                                              <span className="font-medium">
                                                +{data.costScore.toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-green-500 h-1.5 rounded-full"
                                                style={{
                                                  width: `${(data.costScore / 5) * 100}%`,
                                                }}
                                              />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Weight: {data.costWeight}%
                                            </div>
                                          </div>
                                          <div>
                                            <div className="flex justify-between mb-1">
                                              <span className="text-gray-600">
                                                Quality
                                              </span>
                                              <span className="font-medium">
                                                +{data.qualityScore.toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-purple-500 h-1.5 rounded-full"
                                                style={{
                                                  width: `${(data.qualityScore / 5) * 100}%`,
                                                }}
                                              />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Weight: {data.qualityWeight}%
                                            </div>
                                          </div>
                                          <div>
                                            <div className="flex justify-between mb-1">
                                              <span className="text-gray-600">
                                                QCBS
                                              </span>
                                              <span className="font-medium">
                                                +{data.qcbsScore.toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-orange-500 h-1.5 rounded-full"
                                                style={{
                                                  width: `${(data.qcbsScore / 5) * 100}%`,
                                                }}
                                              />
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Weight: {data.qcbsWeight}%
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-4">
                                  No score breakdown available
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Criteria Reference */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Scoring Criteria ({config.criteria.length})
          </h3>
          <button
            onClick={onToggleDetails}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showCriteriaDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {showCriteriaDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="font-medium mb-2">{criterion.name}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {criterion.dataType}</div>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <div className="text-xs text-gray-500">Cost</div>
                      <div className="font-medium">
                        {(criterion.weights.cost * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Quality</div>
                      <div className="font-medium">
                        {(criterion.weights.quality * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">QCBS</div>
                      <div className="font-medium">
                        {(criterion.weights.qcbs * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
