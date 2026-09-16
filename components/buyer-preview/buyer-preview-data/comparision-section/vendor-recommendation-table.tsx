/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star, FileText, Lock } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { VendorSelectionCheckbox } from "@/components/buyer-preview/VendorSelectionCheckbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Vendor {
  id: string;
  name: string;
  vendorResponseId: string;
  status: string;
  [key: string]: any;
}

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface VendorRecommendationTableProps {
  vendors: Vendor[];
  selectedVendors: Map<string, SelectedVendor>;
  onToggleVendor: (vendorResponseId: string, companyName: string) => void;
  onUpdateRemarks?: (vendorResponseId: string, remarks: string) => void;
  validationErrors?: Map<string, string>;
  isRFPApproved?: boolean;
  isBuyerActionsLocked?: boolean;
}

export const VendorRecommendationTable: React.FC<
  VendorRecommendationTableProps
> = ({
  vendors,
  selectedVendors,
  onToggleVendor,
  onUpdateRemarks,
  validationErrors,
  isRFPApproved = false,
  isBuyerActionsLocked = false,
}) => {
  if (isRFPApproved) return null;

  const filteredVendors = vendors.filter((vendor) => {
    const st = (vendor.status || "").toLowerCase();
    return (
      st === "submitted" ||
      st === "submitted_draft" ||
      st === "draft" ||
      st === "approved" ||
      !st ||
      (vendor.revisions && vendor.revisions.length > 0)
    );
  });

  if (filteredVendors.length === 0) return null;

  // Sort vendors by price for consistency
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const aPrice = (a as any).actualPrice ?? Infinity;
    const bPrice = (b as any).actualPrice ?? Infinity;
    return aPrice - bPrice;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Vendor Recommendations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isBuyerActionsLocked
                ? "View vendor recommendations (Selection locked)"
                : "Select vendors to recommend for approval"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedVendors.size > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Star className="h-3 w-3 mr-1" />
              {selectedVendors.size} selected for recommendation
            </Badge>
          )}
          {isBuyerActionsLocked && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
      </div>

      {/* LOCKED STATE ALERT */}
      {isBuyerActionsLocked && (
        <div className="px-6 pt-4">
          <Alert className="border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <strong>Vendor Selection Locked:</strong> You cannot modify vendor selections while the RFP is under approval review or already approved.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-30 bg-gray-50 px-6 py-4 w-[300px] text-left text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Vendor Actions
                </div>
              </th>
              {sortedVendors.map((vendor) => {
                const isSelected = selectedVendors?.has(
                  vendor.vendorResponseId
                );
                return (
                  <th
                    key={vendor.id}
                    className={`px-6 py-4 text-center text-sm font-medium uppercase tracking-wider min-w-[200px] transition-colors ${
                      isSelected
                        ? "bg-blue-100 border-blue-200 text-blue-700"
                        : "text-gray-500"
                    } ${isBuyerActionsLocked ? "opacity-60" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-sm">{vendor.name}</span>
                      {isSelected && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-600 text-white text-xs"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                      {isBuyerActionsLocked && (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-600 border-amber-200 text-xs"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <tr className={`hover:bg-gray-50 ${isBuyerActionsLocked ? "opacity-60" : ""}`}>
              <td className="sticky left-0 z-10 px-6 py-6 bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-2 rounded-full">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Recommend Vendor
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {isBuyerActionsLocked
                        ? "Selection is locked during approval process"
                        : "Select vendors and provide recommendation remarks"}
                    </div>
                  </div>
                </div>
              </td>
              {sortedVendors.map((vendor) => {
                const isSelected = selectedVendors?.has(
                  vendor.vendorResponseId
                );

                return (
                  <td
                    key={vendor.id}
                    className={`text-sm text-center px-6 py-6 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-2 border-blue-300" : ""
                    }`}
                  >
                    <VendorSelectionCheckbox
                      vendorResponseId={vendor.vendorResponseId}
                      companyName={vendor.name}
                      isSelected={isSelected || false}
                      onToggle={onToggleVendor}
                      selectedVendors={selectedVendors}
                      showInlineRemarks={true}
                      onUpdateRemarks={onUpdateRemarks}
                      validationErrors={validationErrors}
                      size="lg"
                      isDisabled={isBuyerActionsLocked}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Instructions Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded-full mt-0.5 ${isBuyerActionsLocked ? "bg-amber-200" : "bg-gray-300"}`}>
            {isBuyerActionsLocked ? (
              <Lock className="h-3 w-3 text-amber-700" />
            ) : (
              <Star className="h-3 w-3 text-gray-700" />
            )}
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">
              {isBuyerActionsLocked ? "Locked Status:" : "Instructions:"}
            </p>
            {isBuyerActionsLocked ? (
              <ul className="space-y-1 text-xs">
                <li>• Vendor selection is currently locked</li>
                <li>• RFP is under approval review or already approved</li>
                <li>• Wait for approval process to complete before making changes</li>
              </ul>
            ) : (
              <ul className="space-y-1 text-xs">
                <li>• Select vendors you want to recommend for approval</li>
                <li>• Provide detailed remarks explaining your recommendation</li>
                <li>• All selected vendors must have recommendation remarks</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};