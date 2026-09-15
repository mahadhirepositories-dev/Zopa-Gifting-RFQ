import React from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface FinancialTermsProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const FinancialTerms: React.FC<FinancialTermsProps> = ({ 
  buyerData, 
  selectedVendor 
}) => {
  const renderAgreementStatus = (agreementStatus: string | undefined) => {
    // Default to "agree" if the field is missing (for backward compatibility)
    const status = agreementStatus || "agree";
    
    return (
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
          status === "agree"
            ? "bg-green-100 text-green-800 p-2"
            : "bg-red-100 text-red-800 p-2"
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

  const renderVendorRemarks = (remarks: string | undefined, agreementStatus: string | undefined) => {
    // Default to "agree" if the field is missing (for backward compatibility)
    const status = agreementStatus || "agree";
    
    if (!remarks || status !== "disagree") return null;
    
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">Vendor Remarks:</h4>
        <p className="text-sm text-gray-700">{remarks}</p>
      </div>
    );
  };

  const getBudgetTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "mrp": return "Discount on MRP";
      case "rateCard": return "Discount on Rate Card";
      case "srp": return "Discount on SRP";
      case "fee": return "Time & Materials";
      case "cost": return "Cost Plus Fee";
      case "unspecified": return "Unspecified";
      default: return <span className="text-gray-400">Not specified</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        5. Financial Terms
      </h2>

      {/* First Row: Cost Model and Currency - Equal Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Cost Model Card */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-xs font-medium text-gray-800 mb-1">COST MODEL</h3>
          <p className="text-sm font-medium text-gray-800">
            {getBudgetTypeLabel(buyerData?.financials?.budgetType)}
          </p>
        </div>

        {/* Currency Card */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-xs font-medium text-gray-800 mb-1">CURRENCY</h3>
          <p className="text-sm font-medium text-gray-800">
            {buyerData?.financials?.currency || (
              <span className="text-gray-400">Not specified</span>
            )}
          </p>
        </div>
      </div>

      {/* Full Width Sections Below */}
      <div className="space-y-6">
        {/* Payment Terms Card - Full Width */}
        <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider">
              Payment Terms
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                {buyerData?.financials?.paymentTerm || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
              {renderAgreementStatus(
                selectedVendor?.revisionData?.financialTerms?.paymentTermsAgreement
              )}
            </div>

            {renderVendorRemarks(
              selectedVendor?.revisionData?.financialTerms?.paymentTermsRemarks,
              selectedVendor?.revisionData?.financialTerms?.paymentTermsAgreement
            )}
          </div>
        </div>

        {/* PBG Amount Card - Full Width */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            PBG Amount
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">
                {buyerData?.financials?.pbgAmount ? (
                  `${buyerData.financials.currency} ${buyerData.financials.pbgAmount.toLocaleString()}`
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </p>
              {renderAgreementStatus(
                selectedVendor?.revisionData?.financialTerms?.pbgAmountAgreement
              )}
            </div>

            {renderVendorRemarks(
              selectedVendor?.revisionData?.financialTerms?.pbgAmountRemarks,
              selectedVendor?.revisionData?.financialTerms?.pbgAmountAgreement
            )}
          </div>
        </div>

        {/* PBG Notes */}
        {buyerData?.financials?.pbgNotes && (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              PBG Notes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  {buyerData.financials.pbgNotes}
                </p>
                {renderAgreementStatus(
                  selectedVendor?.revisionData?.financialTerms?.pbgNotesAgreement
                )}
              </div>

              {renderVendorRemarks(
                selectedVendor?.revisionData?.financialTerms?.pbgNotesRemarks,
                selectedVendor?.revisionData?.financialTerms?.pbgNotesAgreement
              )}
            </div>
          </div>
        )}

        {/* Buyer Financial Notes */}
        {buyerData?.financials?.financialNotes && (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Buyer Financial Notes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  {buyerData.financials.financialNotes}
                </p>
                {renderAgreementStatus(
                  selectedVendor?.revisionData?.financialTerms?.financialNotesAgreement
                )}
              </div>

              {renderVendorRemarks(
                selectedVendor?.revisionData?.financialTerms?.financialNotesRemarks,
                selectedVendor?.revisionData?.financialTerms?.financialNotesAgreement
              )}
            </div>
          </div>
        )}

        {/* Additional Vendor Remarks */}
        {selectedVendor?.revisionData?.financialTerms?.remarks && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              Additional Vendor Remarks
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {selectedVendor?.revisionData?.financialTerms.remarks}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};