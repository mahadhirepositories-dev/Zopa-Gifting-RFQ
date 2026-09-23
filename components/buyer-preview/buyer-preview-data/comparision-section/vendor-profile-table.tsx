/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced VendorProfileTable.tsx - FIXED VERSION with Two-Level Approval Support
import React, { useState } from "react";
import { Award, Clock, FileText, Star } from "lucide-react";
import { TruncateText } from "@/components/truncateText";
import { ProcessedVendor } from "./vendor-comparison-helpers";
import { Badge } from "@/components/ui/badge";

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface VendorProfileTableProps {
  vendors: ProcessedVendor[];
  lowestPriceVendor: ProcessedVendor | null;
  fastestDeliveryVendor: ProcessedVendor | null;
  selectedVendors: Map<string, SelectedVendor>;
  onToggleVendor: (vendorResponseId: string, companyName: string) => void;
  onUpdateRemarks?: (vendorResponseId: string, remarks: string) => void;
  validationErrors?: Map<string, string>;
  isLoggedIn: boolean;
  recommendations: any[];
  isBuyerActionsLocked?: boolean;
  currentApproval?: any; // Add currentApproval prop
}

export const VendorProfileTable: React.FC<VendorProfileTableProps> = ({
  vendors,
  selectedVendors,
  recommendations = [],
  currentApproval, // Add currentApproval
}) => {
  const [expandedLocations, setExpandedLocations] = useState<
    Record<string, boolean>
  >({});

  const toggleLocation = (vendorId: string) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  const lowestPrice = Math.min(
    ...vendors.map((v) => v.actualPrice ?? Infinity)
  );
  const fastestDelivery = Math.min(
    ...vendors.map((v) => parseInt(v.deliveryTime || "") || Infinity)
  );

  // UPDATED: Enhanced vendor recommendation info with two-level approval support
  const getVendorRecommendationInfo = (companyName: string) => {
    if (
      !companyName ||
      !recommendations ||
      !Array.isArray(recommendations) ||
      recommendations.length === 0
    ) {
      return null;
    }

    const vendorRecs = recommendations.filter((rec) => {
      return (
        rec &&
        rec.vendorResponse &&
        rec.vendorResponse.companyDetails &&
        rec.vendorResponse.companyDetails.companyName === companyName
      );
    });

    if (vendorRecs.length === 0) return null;

    const approverRecs = vendorRecs.filter(
      (rec) => rec && rec.recommenderRole === "approver"
    );
    const buyerRecs = vendorRecs.filter(
      (rec) => rec && rec.recommenderRole === "buyer"
    );

    // Check two-level approval status
    const isTwoLevelApproval = currentApproval?.requiredLevels === 2;
    const isLevel1Approved = currentApproval?.level1Status === "approved";
    const isLevel2Approved = currentApproval?.level2Status === "approved";
    const isPendingLevel2 = currentApproval?.status === "pending_level2";

    // TWO-LEVEL APPROVAL LOGIC
    if (isTwoLevelApproval) {
      if (isLevel2Approved) {
        // Final approval by Level 2
        return {
          role: "approver",
          status: "approved",
          highlightColor: "green",
          badgeText: "Approved",
          badgeClass: "bg-green-600 text-white",
        };
      } else if (isPendingLevel2 || isLevel1Approved) {
        // Level 1 approved, waiting for Level 2
        return {
          role: "approver",
          status: "level1_approved",
          highlightColor: "blue",
          badgeText: "L1 Approved",
          badgeClass: "bg-blue-600 text-white",
        };
      }
    }

    // SINGLE-LEVEL APPROVAL LOGIC (existing logic)
    if (approverRecs.length > 0) {
      const approverRec = approverRecs[0];

      if (approverRec && approverRec.status === "approve") {
        return {
          role: "approver",
          status: "approved",
          highlightColor: "green",
          badgeText: "Approved",
          badgeClass: "bg-green-600 text-white",
        };
      } else if (approverRec && approverRec.status === "reject") {
        return {
          role: "approver",
          status: "reject",
          highlightColor: "red",
          badgeText: "rejected",
          badgeClass: "bg-red-600 text-white",
        };
      } else if (approverRec && approverRec.status === "pending") {
        return {
          role: "approver",
          status: "pending",
          highlightColor: "purple",
          badgeText: "Approver recommended",
          badgeClass: "bg-purple-600 text-white",
        };
      } else if (approverRec && approverRec.status === "request-revision") {
        return {
          role: "approver",
          status: "request-revision",
          highlightColor: "orange",
          badgeText: "Revision Requested",
          badgeClass: "bg-orange-600 text-white",
        };
      }
    } else if (buyerRecs.length > 0) {
      const buyerRec = buyerRecs[0];

      if (buyerRec && buyerRec.status === "approved") {
        return {
          role: "buyer",
          status: "approved",
          highlightColor: "blue",
          badgeText: "Buyer Approved",
          badgeClass: "bg-blue-600 text-white",
        };
      } else if (buyerRec && buyerRec.status === "pending") {
        return {
          role: "buyer",
          status: "pending",
          highlightColor: "blue",
          badgeText: "Buyer recommended",
          badgeClass: "bg-blue-600 text-white",
        };
      }
    }

    return null;
  };

  const renderHighlight = (
    vendor: ProcessedVendor,
    type: "price" | "delivery"
  ) => {
    if (type === "price" && vendor.actualPrice === lowestPrice) {
      return (
        <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium ml-2">
          <Award className="h-3 w-3 mr-1" />
          Lowest
        </div>
      );
    }
    if (
      type === "delivery" &&
      parseInt(vendor.deliveryTime || "") === fastestDelivery
    ) {
      return (
        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium ml-2">
          <Clock className="h-3 w-3 mr-1" />
          Fastest
        </div>
      );
    }
    return null;
  };

  const sortedVendors = [...vendors].sort(
    (a, b) => (a.actualPrice ?? Infinity) - (b.actualPrice ?? Infinity)
  );

  const criteria = [
    { name: "Name", key: "name" },
    { name: "Email", key: "email" },
    { name: "Phone", key: "phone" },
    { name: "Location", key: "location" },
    { name: "Quote Ref ID", key: "quoteRefId" },
    { name: "Revision", key: "revision" },
    { name: "Price", key: "price" },
    { name: "Delivery Time", key: "delivery" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="overflow-x-auto">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
          <p className="flex items-center text-md font-bold text-gray-800 uppercase tracking-wider">
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            Vendor Profile
          </p>
          {selectedVendors?.size > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Star className="h-3 w-3 mr-1" />
              {selectedVendors.size} selected for recommendation
            </Badge>
          )}
        </div>

        <table className="min-w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider w-[200px]">
                Description
              </th>
              {sortedVendors.map((vendor) => {
                const isSelected = selectedVendors?.has(
                  vendor.vendorResponseId
                );
                const recommendationInfo = getVendorRecommendationInfo(
                  vendor.name
                );

                let highlightClass = "";
                let badgeContent = null;
                let borderClass = "border-l border-gray-200";

                if (isSelected) {
                  highlightClass = "bg-blue-50 border-blue-200 text-blue-700";
                  borderClass = "border-l border-blue-300";
                  badgeContent = (
                    <Badge
                      variant="secondary"
                      className="bg-blue-600 text-white text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  );
                } else if (recommendationInfo) {
                  switch (recommendationInfo.highlightColor) {
                    case "green":
                      highlightClass =
                        "bg-green-50 border-green-200 text-green-700";
                      borderClass = "border-l border-green-300";
                      break;
                    case "blue":
                      highlightClass =
                        "bg-blue-50 border-blue-200 text-blue-700";
                      borderClass = "border-l border-blue-300";
                      break;
                    case "red":
                      highlightClass = "bg-red-50 border-red-200 text-red-700";
                      borderClass = "border-l border-red-300";
                      break;
                    case "purple":
                      highlightClass =
                        "bg-purple-50 border-purple-200 text-purple-700";
                      borderClass = "border-l border-purple-300";
                      break;
                    case "orange":
                      highlightClass =
                        "bg-orange-50 border-orange-200 text-orange-700";
                      borderClass = "border-l border-orange-300";
                      break;
                  }

                  badgeContent = (
                    <Badge
                      variant="secondary"
                      className={`${recommendationInfo.badgeClass} text-xs`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {recommendationInfo.badgeText}
                    </Badge>
                  );
                }

                return (
                  <th
                    key={vendor.id}
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[200px] transition-colors ${highlightClass} ${borderClass}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-sm"> Vendor Details</span>
                      {badgeContent}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {criteria.map((item) => (
              <tr key={item.key} className="hover:bg-gray-50 align-top">
                <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                  <div>{item.name}</div>
                </td>
                {sortedVendors.map((vendor) => {
                  const isSelected = selectedVendors?.has(
                    vendor.vendorResponseId
                  );
                  const recommendationInfo = getVendorRecommendationInfo(
                    vendor.name
                  );

                  let highlightClass = "";

                  if (isSelected) {
                    highlightClass = "bg-blue-50";
                  } else if (recommendationInfo) {
                    switch (recommendationInfo.highlightColor) {
                      case "green":
                        highlightClass = "bg-green-50";
                        break;
                      case "blue":
                        highlightClass = "bg-blue-50";
                        break;
                      case "red":
                        highlightClass = "bg-red-50";
                        break;
                      case "purple":
                        highlightClass = "bg-purple-50";
                        break;
                      case "orange":
                        highlightClass = "bg-orange-50";
                        break;
                    }
                  }

                  let content: React.ReactNode = "N/A";

                  switch (item.key) {
                    case "name":
                      content = vendor.name || "N/A";
                      break;
                    case "email":
                      content = vendor.email || "N/A";
                      break;
                    case "phone":
                      content = vendor.phone || "N/A";
                      break;
                    case "location":
                      content = (
                        <TruncateText
                          text={vendor.location || "N/A"}
                          expanded={!!expandedLocations[vendor.id]}
                          onToggle={() => toggleLocation(vendor.id)}
                          charLimit={50}
                        />
                      );
                      break;
                    case "quoteRefId":
                      content = vendor.quoteRefId || "N/A";
                      break;
                    case "revision":
                      content = vendor.revision || "N/A";
                      break;
                    case "price":
                      content = (
                        <div className="flex items-center justify-center">
                          <span className="font-medium">
                            {vendor.actualPrice
                              ? `₹${vendor.actualPrice.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`
                              : "N/A"}
                          </span>
                          {renderHighlight(vendor, "price")}
                        </div>
                      );
                      break;
                    case "delivery":
                      content = (
                        <div className="flex items-center justify-center">
                          <span className="font-medium">
                            {vendor.deliveryTime
                              ? `${vendor.deliveryTime} days`
                              : "N/A"}
                          </span>
                          {renderHighlight(vendor, "delivery")}
                        </div>
                      );
                      break;
                  }

                  return (
                    <td
                      key={vendor.id + "-" + item.key}
                      className={`text-sm text-center px-6 py-4 transition-colors ${highlightClass}`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedVendors?.size > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800 font-medium">
              {selectedVendors.size} vendor{selectedVendors.size > 1 ? "s" : ""}{" "}
              selected for recommendation
            </span>
          </div>
        </div>
      )}
    </div>
  );
};