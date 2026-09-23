/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Brain, Zap, Sparkles } from "lucide-react";
import { ScoringCalculator } from "./scoring-logic/price-logic";

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

interface IntegratedVendorScoringProps {
  vendors: any;
  buyerData?: BuyerDataItem[];
  selectedVendors?: Map<string, any>;
}

export const VendorScoringSystem: React.FC<IntegratedVendorScoringProps> = ({
  vendors,
  buyerData,
  selectedVendors = new Map(),
}) => {
  const [config, setConfig] = useState<ScoringConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [showCriteriaDetails, setShowCriteriaDetails] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(true);

  useEffect(() => {
    fetchScoringConfig();
  }, []);

  const fetchScoringConfig = async () => {
    try {
      setLoading(true);
      setAiProcessing(true);
      const response = await fetch("/api/buyer-preview/score-config");
      const data = await response.json();
      if (!data.criteria || !data.dataTypes) {
        throw new Error("Invalid scoring configuration format");
      }

      setConfig(data);
      setTimeout(() => setAiProcessing(false), 1500);
    } catch (err) {
      console.error("Error fetching scoring config:", err);
      setAiProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const targetPriceTotal = useMemo(() => {
    if (!buyerData?.length) return 0;
    return buyerData.reduce((total, item) => {
      const targetPrice = parseFloat(String(item.targetPrice || 0));
      const quantity =
        typeof item.qty === "string" ? parseFloat(item.qty) : Number(item.qty);
      return total + targetPrice * quantity;
    }, 0);
  }, [buyerData]);


  const buyerLocation = useMemo(() => {
    if (!buyerData?.length) return null;

    const itemWithLocation = buyerData.find(
      (item) =>
        item.latitude !== undefined &&
        item.longitude !== undefined &&
        item.latitude !== null &&
        item.longitude !== null &&
        parseFloat(String(item.latitude)) !== 0 &&
        parseFloat(String(item.longitude)) !== 0
    );

    if (itemWithLocation) {
      const location = {
        latitude: parseFloat(String(itemWithLocation.latitude)),
        longitude: parseFloat(String(itemWithLocation.longitude)),
      };
      return location;
    }

    const vendorWithLocation = vendors.find(
      (vendor: ProcessedVendor) => vendor.latitude && vendor.longitude
    );

    if (vendorWithLocation) {
      return {
        latitude: parseFloat(String(vendorWithLocation.latitude)),
        longitude: parseFloat(String(vendorWithLocation.longitude)),
      };
    }
    return {
      latitude: 13.0827,
      longitude: 80.2707,
    };
  }, [buyerData, vendors]);

  const toggleVendorExpansion = (vendorId: string) => {
    setExpandedVendor(expandedVendor === vendorId ? null : vendorId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
        <div className="text-center">
          <div className="relative">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <Sparkles className="h-6 w-6 text-purple-500 absolute -top-1 -right-1 animate-spin" />
          </div>
          <p className="text-gray-700 font-medium mb-2">
            AI Scoring Engine Initializing...
          </p>
          <p className="text-gray-500 text-sm">
            Preparing intelligent vendor analysis
          </p>
        </div>
      </div>
    );
  }

  if (aiProcessing) {
    return (
      <div className="flex items-center justify-center p-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
        <div className="text-center">
          <div className="relative mb-4">
            <Zap className="h-12 w-12 text-purple-600 mx-auto animate-bounce" />
            <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-800 font-semibold mb-2">
            AI Processing Vendor Data
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Analyzing multiple criteria with machine learning
          </p>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if ( !config) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-800 mb-3">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-bold">AI Engine Configuration Error</span>
        </div>
        <button
          onClick={fetchScoringConfig}
          className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-medium"
        >
          Retry AI Initialization
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Use ScoringCalculator for all scoring logic */}
      <ScoringCalculator
        vendors={vendors}
        config={config}
        buyerData={buyerData}
        buyerLocation={buyerLocation}
        targetPriceTotal={targetPriceTotal}
        selectedVendors={selectedVendors}
        expandedVendor={expandedVendor}
        showCriteriaDetails={showCriteriaDetails}
        onToggleExpansion={toggleVendorExpansion}
        onToggleDetails={() => setShowCriteriaDetails(!showCriteriaDetails)}
      />
    </div>
  );
};
