/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface GeneralTermsProps {
  buyerData: BuyerPreviewProps["buyerData"];
  selectedVendor: VendorRevision | null;
}

export const GeneralTerms: React.FC<GeneralTermsProps> = ({
  buyerData,
  selectedVendor,
}) => {
  // Safe rendering helper for location data
  const renderLocation = (location: any): string => {
    if (!location) return "Not specified";

    // If it's already a string, return it
    if (typeof location === "string") return location;

    // If it's an object, extract the name property
    if (typeof location === "object" && location !== null) {
      return location.name || location.state || "Not specified";
    }

    return "Not specified";
  };

  // Safe rendering for delivery locations array
  const renderDeliveryLocations = (locations: any[] | undefined): string => {
    if (!locations || !Array.isArray(locations)) return "Not specified";

    return locations
      .map((location) => renderLocation(location))
      .filter(Boolean)
      .join(", ");
  };

  const renderAgreementStatus = (agreementStatus: string | undefined) => {
    // Default to "agree" if the field is missing (for backward compatibility)
    const status = agreementStatus || "agree";
    
    return (
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
          status === "agree"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status === "agree" ? (
          <>
            <CheckCircleIcon className="h-4 w-4 mr-1" /> Agreed
          </>
        ) : (
          <>
            <XCircleIcon className="h-4 w-4 mr-1" /> Disagreed
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        6. General Terms
      </h2>

      <h3 className="text-lg font-medium mb-2">
        General Terms (As Confirmed by Vendor)
      </h3>

      {/* Delivery Time Section */}
      {buyerData?.generalTerms?.deliveryTimeValue && (
        <div className="mb-6 p-4 bg-white rounded-md border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                RFQ Required Delivery Time
              </h4>
              <p className="text-gray-800 font-medium">
                {buyerData.generalTerms.deliveryTimeValue}{" "}
                {buyerData.generalTerms.deliveryTimeUnit}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                Vendor Proposed Delivery Time
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-gray-800 font-medium">
                  {
                    selectedVendor?.revisionData?.generalTerms
                      ?.deliveryTimeValue
                  }
                </span>
                <span className="text-gray-600 font-medium">
                  {buyerData.generalTerms.deliveryTimeUnit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Location Section */}
      {buyerData?.generalTerms?.deliveryLocations && (
        <div className="mb-6 p-4 bg-white rounded-md border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                Delivery Location
              </h4>
              <p className="text-gray-800 font-medium">
                {renderDeliveryLocations(
                  buyerData.generalTerms.deliveryLocations
                )}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                Vendor Dispatch Location
              </h4>
              <p className="text-gray-800 font-medium">
                {renderLocation(
                  selectedVendor?.revisionData?.generalTerms?.dispatchLocation
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General Terms List */}
      <div className="space-y-4 mb-2">
        {buyerData?.generalTerms?.selectedTerms?.map(
          (term: string, index: number) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <span className="shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center mr-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                </span>
                <span className="text-gray-700">{term.trim()}</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* Agreement Status */}
      <div className="flex items-center my-4">
        {renderAgreementStatus(
          selectedVendor?.revisionData?.generalTerms?.agreement
        )}
      </div>

      {/* Vendor Remarks */}
      {selectedVendor?.revisionData?.generalTerms?.remarks && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Vendor Remarks</h3>
          <div className="bg-white p-3 border border-gray-200 rounded-md">
            {selectedVendor?.revisionData?.generalTerms.remarks}
          </div>
        </div>
      )}
    </div>
  );
};
