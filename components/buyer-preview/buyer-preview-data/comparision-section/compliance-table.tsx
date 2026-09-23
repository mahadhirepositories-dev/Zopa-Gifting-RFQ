/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced ComplianceTable.tsx - FIXED VERSION with Two-Level Approval Support
import React from "react";
import { FileText, Star } from "lucide-react";


interface EvaluationCriteria {
  value: string;
  remarks: string;
}

interface Revision {
  scopeOfWork?: { agreement: string };
  evaluationCriteria?: EvaluationCriteria[];
  financialTerms?: {
    paymentTermsAgreement: string;
    pbgAmountAgreement: string;
    pbgNotesAgreement: string;
    financialNotesAgreement: string;
  };
  generalTerms?: { agreement: string };
  specialTerms?: { agreement: string };
  attachments?: Attachment[];
}

interface Attachment {
  documentName: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Vendor {
  id: string;
  name: string;
  vendorResponseId: string;
  revisions?: Revision[];
  status: string;
  vendorResponse?: {
    companyDetails?: {
      companyName: string;
    };
  };
}

interface ComplianceCriteria {
  label: string;
  key: string;
  indent?: boolean;
  check: (revision: Revision | undefined) => boolean;
}

interface BuyerCriteria {
  label?: string;
  [key: string]: any;
}

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface Recommendation {
  vendorResponse?: {
    vendorResponseId: string;
    vendorId: string;
    companyDetails?: {
      companyName: string;
    };
  };
  vendorResponseId: string;
  recommenderRole?: string;
  status?: string;
}

interface ComplianceTableProps {
  vendors: Vendor[];
  buyerData?: BuyerCriteria[] | string[] | null;
  document?: string | string[];
  selectedVendors: Map<string, SelectedVendor>;
  onToggleVendor: (vendorResponseId: string, companyName: string) => void;
  onUpdateRemarks?: (vendorResponseId: string, remarks: string) => void;
  validationErrors?: Map<string, string>;
  isLoggedIn: boolean;
  recommendations: Recommendation[];
  isBuyerActionsLocked?: boolean;
  currentApproval?: any; // Add currentApproval prop
}

export const ComplianceTable: React.FC<ComplianceTableProps> = ({
  vendors,
  buyerData = [],
  document,
  recommendations,
  currentApproval, // Add currentApproval
}) => {
  const safeVendors = vendors ?? [];
  const filteredVendors = safeVendors.filter(
    (vendor) => vendor.status === "submitted"
  );

  if (filteredVendors.length === 0) return null;

  // Sort vendors by price for consistency (assuming they have actualPrice)
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const aPrice = (a as any).actualPrice ?? Infinity;
    const bPrice = (b as any).actualPrice ?? Infinity;
    return aPrice - bPrice;
  });

  const documentArray: string[] = Array.isArray(document)
    ? document
    : typeof document === "string"
      ? document.split(",").map((d) => d.trim())
      : [];

  const getLatestRevision = (vendor: Vendor): Revision | undefined =>
    vendor.revisions?.[vendor.revisions.length - 1];

  const getDynamicCriteria = (): ComplianceCriteria[] => {
    const baseCriteria: ComplianceCriteria[] = [
      {
        label: "Scope of work",
        key: "scopeOfWork",
        check: (revision) => (revision?.scopeOfWork?.agreement || "agree") === "agree",
      },
      {
        label: "Payments terms",
        key: "paymentTerms",
        check: (revision) =>
          (revision?.financialTerms?.paymentTermsAgreement || "agree") === "agree",
      },
      {
        label: "PBG Amount",
        key: "PBG Amount",
        check: (revision) =>
          (revision?.financialTerms?.pbgAmountAgreement || "agree") === "agree",
      },
      {
        label: "PBG Notes",
        key: "PBG Notes",
        check: (revision) =>
          (revision?.financialTerms?.pbgNotesAgreement || "agree") === "agree",
      },
      {
        label: "Buyer Financial Notes",
        key: "Buyer Financial Notes",
        check: (revision) =>
          (revision?.financialTerms?.financialNotesAgreement || "agree") === "agree",
      },
      {
        label: "General T&C",
        key: "generalTerms",
        check: (revision) => (revision?.generalTerms?.agreement || "agree") === "agree",
      },
      {
        label: "Special T&C",
        key: "specialTerms",
        check: (revision) => (revision?.specialTerms?.agreement || "agree") === "agree",
      },
    ];

    const documentCriteria: ComplianceCriteria[] = documentArray.map((doc) => ({
      label: doc,
      key: `doc_${doc}`,
      check: (revision) => {
        if (!revision?.attachments?.length) return false;
        return revision.attachments.some(
          (attachment) =>
            attachment?.documentName?.trim().toLowerCase() ===
              doc?.trim().toLowerCase() && !!attachment?.url
        );
      },
    }));

    // Fix: Handle null/undefined buyerData properly
    const safeBuyerData = Array.isArray(buyerData) ? buyerData : [];
    const evaluationCriteria: ComplianceCriteria[] = safeBuyerData.map(
      (criteria: BuyerCriteria | string, index: number) => {
        const label =
          typeof criteria === "string"
            ? criteria
            : criteria?.label || `Criteria ${index + 1}`;
        return {
          label,
          key: `evalCriteria_${index}`,
          check: (revision) => {
            if (!revision?.evaluationCriteria) return false;
            if (typeof criteria === "string") {
              return revision.evaluationCriteria[index]?.value === "Yes";
            }
            return revision.evaluationCriteria.some(
              (ec) => ec.value === "Yes" && ec.remarks === criteria?.label
            );
          },
        };
      }
    );

    return [...baseCriteria, ...documentCriteria, ...evaluationCriteria];
  };

  const allCriteria = getDynamicCriteria();
  const documentCriteria = allCriteria.filter((c) => c.key.startsWith("doc_"));
  const otherCriteria = allCriteria.filter((c) => !c.key.startsWith("doc_"));

  // UPDATED: Enhanced vendor recommendation details with two-level approval support
  const getVendorRecommendationDetails = (vendor: Vendor) => {
    const vendorRecommendations = recommendations.filter((rec) => {
      return (
        rec.vendorResponseId === vendor.vendorResponseId ||
        rec.vendorResponse?.vendorResponseId === vendor.vendorResponseId
      );
    });

    if (vendorRecommendations.length === 0) {
      return { type: "none", status: "", label: "", colorClass: "" };
    }

    // Check two-level approval status
    const isTwoLevel = currentApproval?.requiredLevels === 2;
    const isLevel1Approved = currentApproval?.level1Status === "approved";
    const isLevel2Approved = currentApproval?.level2Status === "approved";
    const isPendingLevel2 = currentApproval?.status === "pending_level2";

    // TWO-LEVEL APPROVAL LOGIC
    if (isTwoLevel) {
      if (isLevel2Approved) {
        // Final approval by Level 2
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (isPendingLevel2 || isLevel1Approved) {
        // Level 1 approved, waiting for Level 2
        return {
          type: "approver",
          status: "level1_approved",
          label: "L1 Approved",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      }
    }

    // SINGLE-LEVEL APPROVAL LOGIC (existing logic)
    const approverRec = vendorRecommendations.find(
      (r) => r.recommenderRole === "approver"
    );
    const buyerRec = vendorRecommendations.find(
      (r) => r.recommenderRole === "buyer"
    );

    // If both exist, prioritize approver
    if (approverRec && buyerRec) {
      if (approverRec.status === "reject" || approverRec.status === "rejected") {
        return {
          type: "approver",
          status: "rejected",
          label: "Rejected",
          colorClass: "bg-red-50 border-red-200 text-red-700",
        };
      } else if (approverRec.status === "approve" || approverRec.status === "approved") {
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (approverRec.status === "pending") {
        return {
          type: "approver",
          status: "pending",
          label: "Approver Recommended",
          colorClass: "bg-purple-50 border-purple-200 text-purple-700",
        };
      } else if (approverRec.status === "request-revision") {
        return {
          type: "approver",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    // If only approver recommendation exists
    if (approverRec) {
      if (approverRec.status === "reject" || approverRec.status === "rejected") {
        return {
          type: "approver",
          status: "rejected",
          label: "Rejected",
          colorClass: "bg-red-50 border-red-200 text-red-700",
        };
      } else if (approverRec.status === "approve" || approverRec.status === "approved") {
        return {
          type: "approver",
          status: "approved",
          label: "Approved",
          colorClass: "bg-green-50 border-green-200 text-green-700",
        };
      } else if (approverRec.status === "pending") {
        return {
          type: "approver",
          status: "pending",
          label: "Approver Recommended",
          colorClass: "bg-purple-50 border-purple-200 text-purple-700",
        };
      } else if (approverRec.status === "request-revision") {
        return {
          type: "approver",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    // If only buyer recommendation exists
    if (buyerRec) {
      if (buyerRec.status === "approve" || buyerRec.status === "approved") {
        return {
          type: "buyer",
          status: "approved",
          label: "Buyer Recommended",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      } else if (buyerRec.status === "pending") {
        return {
          type: "buyer",
          status: "pending",
          label: "Buyer Recommended",
          colorClass: "bg-blue-50 border-blue-200 text-blue-700",
        };
      } else if (buyerRec.status === "request-revision") {
        return {
          type: "buyer",
          status: "request-revision",
          label: "Revision Requested",
          colorClass: "bg-orange-50 border-orange-300 text-orange-800",
        };
      }
    }

    return { type: "none", status: "", label: "", colorClass: "" };
  };

  const renderCriteriaTable = (
    title: string,
    criteriaList: ComplianceCriteria[]
  ) => (
    <div className="mb-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg flex items-center font-semibold text-gray-800">
          <FileText className="h-5 w-5 text-blue-600 mr-3" />
          {title}
        </h2>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-gray-100 px-6 py-3 w-[300px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {title === "Document Compliance"
                  ? "Document Name"
                  : "Compliance"}
              </th>
              {sortedVendors.map((vendor) => {
                const recommendationDetails =
                  getVendorRecommendationDetails(vendor);
                const hasRecommendation = recommendationDetails.type !== "none";

                return (
                  <th
                    key={vendor.id}
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[150px] ${
                      hasRecommendation
                        ? recommendationDetails.colorClass
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          hasRecommendation
                            ? recommendationDetails.status === "rejected"
                              ? "text-red-800"
                              : recommendationDetails.status === "approved"
                                ? recommendationDetails.type === "approver"
                                  ? "text-green-800"
                                  : "text-blue-800"
                                : recommendationDetails.status === "level1_approved"
                                  ? "text-blue-800"
                                  : recommendationDetails.status === "request-revision"
                                    ? "text-orange-800"
                                    : "text-purple-800"
                            : ""
                        }`}
                      >
                        {vendor.vendorResponse?.companyDetails?.companyName ||
                          vendor.name}
                      </span>
                      {hasRecommendation && (
                        <div className="">
                          <span
                            className={`text-xs px-2 py-1 flex items-center rounded-full ${
                              recommendationDetails.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : recommendationDetails.status === "approved"
                                  ? recommendationDetails.type === "approver"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-700 text-white"
                                  : recommendationDetails.status === "level1_approved"
                                    ? "bg-blue-100 text-blue-700"
                                    : recommendationDetails.status === "request-revision"
                                      ? "bg-orange-600 text-white"
                                      : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {recommendationDetails.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {criteriaList.map((criteria) => (
              <tr key={criteria.key} className="hover:bg-gray-50">
                <td
                  className={`sticky left-0 z-10 px-6 py-4 text-sm font-medium text-gray-900 bg-white ${
                    criteria.indent ? "pl-10" : ""
                  }`}
                >
                  {criteria.label}
                </td>

                {sortedVendors.map((vendor) => {
                  const revision = getLatestRevision(vendor);
                  const isCompliant = criteria.check(revision);
                  const recommendationDetails =
                    getVendorRecommendationDetails(vendor);
                  const hasRecommendation =
                    recommendationDetails.type !== "none";

                  return (
                    <td
                      key={vendor.id}
                      className={`px-6 py-4 text-center align-middle ${
                        hasRecommendation
                          ? recommendationDetails.colorClass
                          : ""
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          isCompliant
                            ? "bg-green-100 text-green-600 font-bold"
                            : "bg-gray-100 text-red-400 font-bold"
                        } ${
                          hasRecommendation
                            ? recommendationDetails.status === "rejected"
                              ? "ring-2 ring-red-400"
                              : recommendationDetails.status === "approved"
                                ? recommendationDetails.type === "approver"
                                  ? "ring-2 ring-green-400"
                                  : "ring-2 ring-blue-400"
                                : recommendationDetails.status === "level1_approved"
                                  ? "ring-2 ring-blue-400"
                                  : recommendationDetails.status === "request-revision"
                                    ? "ring-2 ring-orange-400"
                                    : "ring-2 ring-purple-400"
                            : ""
                        }`}
                      >
                        {isCompliant ? "✓" : "✗"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {renderCriteriaTable("Compliance", otherCriteria)}
      {documentCriteria.length > 0 &&
        renderCriteriaTable("Document Compliance", documentCriteria)}
    </div>
  );
};