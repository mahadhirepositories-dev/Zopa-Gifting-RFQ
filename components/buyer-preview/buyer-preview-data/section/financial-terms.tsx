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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          status === "agree"
            ? "bg-emerald-100/90 text-emerald-700 border border-emerald-200/60"
            : "bg-red-100/90 text-red-700 border border-red-200/60"
        }`}
      >
        {status === "agree" ? (
          <>
            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" /> Agreed
          </>
        ) : (
          <>
            <XCircleIcon className="h-3.5 w-3.5 text-red-600" /> Disagreed
          </>
        )}
      </div>
    );
  };

  const renderVendorRemarks = (remarks: string | undefined, agreementStatus: string | undefined) => {
    const status = agreementStatus || "agree";
    
    if (!remarks || status !== "disagree") return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-xs font-semibold text-gray-700 mb-0.5">Vendor Remarks:</h4>
        <p className="text-xs text-gray-600">{remarks}</p>
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
      default: return <span className="text-gray-400 italic font-normal">Not specified</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        5. Financial Terms
      </h2>

      {/* First Row: Cost Model and Currency - Equal Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Cost Model Card */}
        <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1">
            COST MODEL
          </h3>
          <p className="text-sm font-semibold text-gray-900">
            {getBudgetTypeLabel(buyerData?.financials?.budgetType)}
          </p>
        </div>

        {/* Currency Card */}
        <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1">
            CURRENCY
          </h3>
          <p className="text-sm font-semibold text-gray-900">
            {buyerData?.financials?.currency || (
              <span className="text-gray-400 italic font-normal">Not specified</span>
            )}
          </p>
        </div>
      </div>

      {/* Full Width Sections Below */}
      <div className="space-y-4">
        {/* Payment Terms Card - Full Width */}
        <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-gray-900">
              Payment Terms
            </h3>
            <p className="text-sm text-gray-600">
              {buyerData?.financials?.paymentTerm || (
                <span className="text-gray-400 italic font-normal">Not specified</span>
              )}
            </p>
            {renderVendorRemarks(
              selectedVendor?.revisionData?.financialTerms?.paymentTermsRemarks,
              selectedVendor?.revisionData?.financialTerms?.paymentTermsAgreement
            )}
          </div>
          {renderAgreementStatus(
            selectedVendor?.revisionData?.financialTerms?.paymentTermsAgreement
          )}
        </div>

        {/* PBG Amount Card - Full Width */}
        <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-gray-900">
              PBG Amount
            </h3>
            <p className="text-sm text-gray-600">
              {buyerData?.financials?.pbgAmount ? (
                `${buyerData.financials.currency} ${buyerData.financials.pbgAmount.toLocaleString()}`
              ) : (
                <span className="text-gray-400 italic font-normal">Not specified</span>
              )}
            </p>
            {renderVendorRemarks(
              selectedVendor?.revisionData?.financialTerms?.pbgAmountRemarks,
              selectedVendor?.revisionData?.financialTerms?.pbgAmountAgreement
            )}
          </div>
          {renderAgreementStatus(
            selectedVendor?.revisionData?.financialTerms?.pbgAmountAgreement
          )}
        </div>

        {/* PBG Notes */}
        {buyerData?.financials?.pbgNotes && (
          <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-gray-900">
                PBG Notes
              </h3>
              <p className="text-sm text-gray-600">
                {buyerData.financials.pbgNotes}
              </p>
              {renderVendorRemarks(
                selectedVendor?.revisionData?.financialTerms?.pbgNotesRemarks,
                selectedVendor?.revisionData?.financialTerms?.pbgNotesAgreement
              )}
            </div>
            {renderAgreementStatus(
              selectedVendor?.revisionData?.financialTerms?.pbgNotesAgreement
            )}
          </div>
        )}

        {/* Buyer Financial Notes */}
        {buyerData?.financials?.financialNotes && (
          <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-gray-900">
                Buyer Financial Notes
              </h3>
              <p className="text-sm text-gray-600">
                {buyerData.financials.financialNotes}
              </p>
              {renderVendorRemarks(
                selectedVendor?.revisionData?.financialTerms?.financialNotesRemarks,
                selectedVendor?.revisionData?.financialTerms?.financialNotesAgreement
              )}
            </div>
            {renderAgreementStatus(
              selectedVendor?.revisionData?.financialTerms?.financialNotesAgreement
            )}
          </div>
        )}

        {/* Additional Vendor Remarks */}
        {selectedVendor?.revisionData?.financialTerms?.remarks && (
          <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-200/70">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
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