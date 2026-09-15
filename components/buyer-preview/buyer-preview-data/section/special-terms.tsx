import React from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface SpecialTermsProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const SpecialTerms: React.FC<SpecialTermsProps> = ({ 
  buyerData, 
  selectedVendor 
}) => {
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
        7. Special Terms
      </h2>

      <h3 className="text-lg font-medium mb-2">
        Project-Specific Terms
      </h3>
      
      {/* Special Terms List */}
      <div className="space-y-4 mb-2">
        {buyerData?.specialTerms?.selectedTerms?.map((term: string, index: number) => (
          <div key={index} className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <span className="shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center mr-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              </span>
              <span className="text-gray-700">{term.trim()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agreement Status */}
      <div className="flex items-center my-4">
        {renderAgreementStatus(selectedVendor?.revisionData?.specialTerms?.agreement)}
      </div>

      {/* Vendor Remarks */}
      {selectedVendor?.revisionData?.specialTerms?.remarks && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Vendor Remarks</h3>
          <div className="bg-white p-3 border border-gray-200 rounded-md">
            {selectedVendor?.revisionData?.specialTerms.remarks}
          </div>
        </div>
      )}
    </div>
  );
};