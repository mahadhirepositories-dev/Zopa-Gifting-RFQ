// components/buyer-preview/buyer-preview-data/Vendor-actions.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, Users, Edit, Star } from "lucide-react";
import { RFPData, VendorResponse, VendorRevision } from "@/lib/types/index";

interface VendorActionsProps {
  formattedResponses: VendorResponse[];
  selectedVendor: VendorRevision | null;
  setSelectedVendor: (vendor: VendorRevision | null) => void;
  comparisonMode: boolean; // Keep for compatibility but won't be used
  setComparisonMode: (mode: boolean) => void; // Keep for compatibility but won't be used
  setVendorContactDialogOpen: (open: boolean) => void;
  setPremiumFeaturesDialogOpen: (open: boolean) => void;
  handleDownload: () => void;
  shareMenuOpen: boolean;
  setShareMenuOpen: (open: boolean) => void;
  shareToWhatsApp: () => void;
  rfpId?: string;
  projectName?: string;
  buyerData?: any;
  rfpData?: RFPData;
  onRecommendationUpdate?: () => void | Promise<void>;
  showCompareButton?: boolean;
  isLoggedIn?: boolean;
  urlResponseId?: string | null; // Add this prop
}

interface VendorRecommendation {
  id: number;
  vendorResponseId: string;
  recommendedBy: string;
  reason: string;
  status: string;
  createdAt: string;
  recommender: {
    name: string;
    email: string;
  };
  vendorResponse: {
    companyDetails: {
      companyName: string;
      email: string;
      phone: string;
    };
    vendorId: string;
    vendorResponseId: string;
  };
  recommenderRole?: string;
}

export const VendorActions: React.FC<VendorActionsProps> = ({
  formattedResponses,
  selectedVendor,
  setSelectedVendor,
  setVendorContactDialogOpen,
  setPremiumFeaturesDialogOpen,
  handleDownload,
  isLoggedIn,
  rfpId,
  rfpData,
  urlResponseId,
}) => {
  const [recommendations, setRecommendations] = useState<
    VendorRecommendation[]
  >([]);

  const fetchRecommendations = useCallback(async () => {
    if (!rfpId) return;

    try {
      const response = await fetch(`/api/rfp/${rfpId}/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [rfpId]);

  useEffect(() => {
    if (rfpId) {
      fetchRecommendations();
    }
  }, [rfpId, fetchRecommendations]);

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatTime = (dateString: Date | string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isVendorRecommended = (vendorResponseId: string) => {
    return recommendations.some(
      (rec) =>
        rec.vendorResponseId === vendorResponseId && rec.status === "pending",
    );
  };

  const getRecommendationInfo = (vendorResponseId: string) => {
    return recommendations.find(
      (rec) =>
        rec.vendorResponseId === vendorResponseId && rec.status === "pending",
    );
  };

  const handlePremiumFeaturesClick = () => {
    setPremiumFeaturesDialogOpen(true);
  };

  // Builds a single dropdown option for a given vendor + revision.
  // `isHighlighted` controls whether this specific option gets the
  // priority/recommended background styling (only the latest revision
  // of a vendor should ever be highlighted).
  const buildOption = (
    vendor: VendorResponse,
    key: string | number,
    revisionNumber: any,
    updatedDate: any,
    isPriorityVendor: boolean,
    isRecommended: boolean,
    recommendationInfo: VendorRecommendation | undefined,
    isHighlighted: boolean,
  ) => {
    const formattedDate = formatDate(updatedDate);
    const formattedTime = formatTime(updatedDate);

    return {
      value: `${vendor.id}-${key}`,
      vendorResponseId: vendor.vendorResponseId,
      // Only the latest revision carries the highlight flags through to
      // the SelectItem's className below.
      isPriority: isHighlighted && isPriorityVendor,
      isRecommended: isHighlighted && isRecommended,
      recommendationInfo: isHighlighted ? recommendationInfo : undefined,
      label: (
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex flex-col">
            <span
              className={`${
                isHighlighted && isPriorityVendor
                  ? "font-semibold text-blue-600"
                  : isHighlighted && isRecommended
                    ? "font-medium text-green-700"
                    : ""
              }`}
            >
              R-{revisionNumber ?? key} : {vendor.companydetails.companyName}
              {formattedDate ? ` (${formattedDate}, ${formattedTime})` : ""}
              {isHighlighted && isPriorityVendor && " ★"}
            </span>
            {isHighlighted && isRecommended && recommendationInfo && (
              <span className="text-xs text-green-600 mt-1">
                Recommended by {recommendationInfo.recommender.name}
                {recommendationInfo.recommenderRole === "buyer" && " (Buyer)"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isHighlighted && isRecommended && (
              <Star className="h-4 w-4 text-green-500 fill-current" />
            )}
          </div>
        </div>
      ),
    };
  };

  const generateSelectOptions = () => {
    const filteredVendors = formattedResponses.filter(
      (vendor) => vendor.companydetails?.companyName,
    );

    // Sort vendors: URL priority first, then recommended vendors, then others
    const sortedVendors = [...filteredVendors].sort((a, b) => {
      // URL priority vendor comes first
      if (urlResponseId) {
        if (a.vendorResponseId === urlResponseId) return -1;
        if (b.vendorResponseId === urlResponseId) return 1;
      }

      // Then sort by recommendation status
      const aRecommended = isVendorRecommended(a.vendorResponseId);
      const bRecommended = isVendorRecommended(b.vendorResponseId);

      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;

      return 0;
    });

    return sortedVendors.flatMap((vendor) => {
      const isRecommended = isVendorRecommended(vendor.vendorResponseId);
      const recommendationInfo = getRecommendationInfo(vendor.vendorResponseId);
      const isPriorityVendor = vendor.vendorResponseId === urlResponseId;

      // Case 1: vendor.revisions is an array -> show ALL revisions,
      // sorted latest-first, highlight only the latest one.
      if (Array.isArray(vendor.revisions) && vendor.revisions.length > 0) {
        const indexedRevisions = vendor.revisions.map(
          (rev: any, index: number) => ({ rev, index }),
        );

        indexedRevisions.sort((a, b) => {
          const aNum = Number(a.rev.revisionNumber ?? a.index);
          const bNum = Number(b.rev.revisionNumber ?? b.index);
          return bNum - aNum; // descending: latest revision first
        });

        return indexedRevisions.map(({ rev, index }, sortedPos) =>
          buildOption(
            vendor,
            index,
            rev.revisionNumber ?? index,
            rev.updatedAt || vendor.updatedAt,
            isPriorityVendor,
            isRecommended,
            recommendationInfo,
            sortedPos === 0, // only the first (latest) is highlighted
          ),
        );
      }

      // Case 2: vendor.revisionNumber is a keyed object -> show ALL entries,
      // sorted latest-first, highlight only the latest one.
      if (
        typeof vendor.revisionNumber === "object" &&
        vendor.revisionNumber !== null
      ) {
        const revisionEntries = Object.entries(vendor.revisionNumber);
        const isNumericKeyed = revisionEntries.some(
          ([key]) => !isNaN(Number(key)),
        );

        if (isNumericKeyed) {
          const sortedEntries = [...revisionEntries].sort((a, b) => {
            const aRev = a[1] as any;
            const bRev = b[1] as any;
            const aNum = Number(aRev.revisionNumber ?? a[0]);
            const bNum = Number(bRev.revisionNumber ?? b[0]);
            return bNum - aNum; // descending: latest revision first
          });

          return sortedEntries.map(([key, revision], sortedPos) => {
            const rev = revision as any;
            return buildOption(
              vendor,
              key,
              rev.revisionNumber ?? key,
              rev.updatedAt || vendor.updatedAt,
              isPriorityVendor,
              isRecommended,
              recommendationInfo,
              sortedPos === 0, // only the first (latest) is highlighted
            );
          });
        } else {
          return [
            buildOption(
              vendor,
              0,
              vendor.revisionNumber.revisionNumber || "0",
              vendor.updatedAt,
              isPriorityVendor,
              isRecommended,
              recommendationInfo,
              true, // only revision -> it's the latest
            ),
          ];
        }
      }

      // Case 3: no revisions at all -> single R-0 option (always "latest")
      return [
        buildOption(
          vendor,
          0,
          0,
          vendor.updatedAt,
          isPriorityVendor,
          isRecommended,
          recommendationInfo,
          true,
        ),
      ];
    });
  };

  const selectOptions = generateSelectOptions();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {/* Left side - Vendor selection and contacts */}
          <div className="flex flex-wrap gap-3 place-items-end">
            {/* Vendor select with URL priority and recommendation highlighting */}
            <div className="w-80">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Select Vendor Response:
              </label>
              <Select
                value={
                  selectedVendor
                    ? `${selectedVendor.id}-${selectedVendor._revisionKey || "0"}`
                    : ""
                }
                onValueChange={(value) => {
                  const [vendorId, revIndex] = value.split("-");
                  const vendor = formattedResponses.find(
                    (v) => v.id === vendorId,
                  );

                  if (vendor) {
                    let revisionData = null;
                    let revisionKey = "0";

                    if (
                      Array.isArray(vendor.revisions) &&
                      vendor.revisions.length > 0
                    ) {
                      revisionData = vendor.revisions[Number(revIndex)];
                      revisionKey = revIndex;
                    } else if (
                      typeof vendor.revisionNumber === "object" &&
                      vendor.revisionNumber !== null
                    ) {
                      if (Object.keys(vendor.revisionNumber).length > 0) {
                        revisionData = vendor.revisionNumber[revIndex];
                        revisionKey = revIndex;
                      } else {
                        revisionData = vendor.revisionNumber;
                      }
                    }

                    const newSelectedVendor = {
                      ...vendor,
                      _revisionKey: revisionKey,
                      revisionData,
                      _originalVendorId: vendor.vendorId,
                      _uniqueId: `${vendor.id}-${revisionKey}`,
                    };
                    setSelectedVendor(newSelectedVendor);
                  }
                }}
              >
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 h-10">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {selectOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={`${
                        option.isPriority
                          ? "bg-blue-50 hover:bg-blue-100"
                          : option.isRecommended
                            ? "bg-green-50 hover:bg-green-100 border-l-4 border-green-400"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor Contacts */}
            <Button
              variant="outline"
              onClick={() => setVendorContactDialogOpen(true)}
              className="h-10 px-4"
            >
              <Users className="h-4 w-4 mr-2" />
              Vendor Contacts
            </Button>
          </div>

          {/* Right side - Download + Premium Features */}
          <div className="flex gap-3 place-items-end">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!selectedVendor}
              className="h-10 px-4 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>

            {/* Premium Features Button - Fixed implementation */}
            {isLoggedIn ? null : (
              <Button
                variant="outline"
                onClick={handlePremiumFeaturesClick}
                className="h-10 px-4"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Premium Features
              </Button>
            )}
          </div>
        </div>

        {/* Show recommendations summary if any exist */}
        {recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-green-200 bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2 text-green-800">
              <Star className="h-5 w-5 mt-0.5 text-green-600 fill-current" />
              <div>
                <p className="font-medium">
                  Vendor Recommendations ({recommendations.length})
                </p>
                <div className="text-sm mt-2 space-y-1">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        <strong>
                          {rec.vendorResponse?.companyDetails?.companyName}
                        </strong>
                        {rec.recommenderRole === "buyer" &&
                          " - Recommended by buyer"}
                        {rec.recommenderRole === "approver" &&
                          " - Recommended by approver"}
                      </span>
                      <span className="text-xs text-green-800 font-bold ms-2">
                        by {rec.recommender.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add revision notice */}
        {rfpData?.status === "revision_requested" && (
          <div className="mt-4 pt-4 border-t border-amber-200 bg-amber-50 p-4 rounded-lg">
            <div className="flex items-start gap-2 text-amber-800">
              <Edit className="h-5 w-5 mt-0.5 text-amber-600" />
              <div>
                <p className="font-medium">Revision Requested</p>
                <p className="text-sm mt-1">
                  {rfpData.approvalComments ||
                    "Please revise this RFP based on approver feedback"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
