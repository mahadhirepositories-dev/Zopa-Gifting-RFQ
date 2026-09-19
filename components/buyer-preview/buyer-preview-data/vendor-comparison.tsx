/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { VendorProfileTable } from "./comparision-section/vendor-profile-table";
import { CommercialsTable } from "./comparision-section/commercials-table";
import { ItemLevelViewTable } from "./comparision-section/item-level-view-table";
import {
  findFastestDeliveryVendor,
  findLowestPriceVendor,
  processVendors,
} from "./comparision-section/vendor-comparison-helpers";
import { ComplianceTable } from "./comparision-section/compliance-table";
import { VendorRecommendationTable } from "./comparision-section/vendor-recommendation-table";
import { VendorFilter } from "./comparision-section/vendor-filter";
import PremiumFeaturesDialog from "../premium-features";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle,
  Shield,
  Lock,
  XCircle,
  Edit,
  AlertTriangle,
  Users,
  Download,
} from "lucide-react";
import { VendorComparisionPdf } from "./comparision-pdf";
import { Level2ApprovalDialog } from "@/components/approval/level2ApprovalDialog";
import { isBuyerRevisionPending } from "@/lib/approval-state";

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface BuyerRecommendation {
  id: number;
  rfpId: string;
  approvalId: number;
  vendorResponseId: string;
  reason: string;
  status: string;
  recommenderRole: string;
  createdAt: string;
  recommender: {
    id: string;
    name: string;
    email: string;
  };
  vendorResponse: {
    vendorResponseId: string;
    companyDetails: {
      companyName: string;
    };
  };
}

interface ApprovalData {
  id: number;
  rfpId: string;
  status: string;
  requestedAt?: string;
  createdAt?: string;
  reviewedAt?: string;
  buyerComments?: string;
  approverComments?: string;
  currentLevel?: number;
  level1Status?: string | null;
  level2Status?: string | null;
  level1Comments?: string | null;
  level2Comments?: string | null;
  revisionRequestRecipient?: string | null;

  requester?: {
    id?: string;
    name?: string;
    email?: string;
    company?: string;
  } | null;

  approver?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  level1Approver?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
}

interface VendorComparisonProps {
  formattedResponses: any[];
  comparisonMode: boolean;
  buyerData: any;
  buyerInfo: any;
  evaluationCriteria: any;
  document: any;
  contactId?: number;
  rfpId?: string;
  onRecommendationUpdate?: () => void;
  onVendorSelect?: (vendorId: string | null) => void;
  selectedVendorId?: string | null;
  isApproverMode?: boolean;
  approvalId?: number;
  isLoggedIn?: boolean;
  currentApproval?: ApprovalData;
  onUnifiedApprovalDecision?: (
    action: "approve" | "reject" | "request-revision",
    comments: string,
    recommendedVendors: any[],
    revisionRecipient?: string
  ) => void;
  buyerRecommendations?: BuyerRecommendation[];
  vendorsWithNewRevisions?: any;
  recommendations?: any;
  groupedRecommendations?: any;
}

export const VendorComparison: React.FC<VendorComparisonProps> = ({
  formattedResponses,
  comparisonMode,
  buyerData,
  evaluationCriteria,
  document,
  contactId,
  rfpId,
  onRecommendationUpdate,
  isApproverMode = false,
  isLoggedIn = false,
  currentApproval,
  onUnifiedApprovalDecision,
  buyerRecommendations = [],
  recommendations,
  groupedRecommendations,
  buyerInfo,
}) => {
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<
    Map<string, SelectedVendor>
  >(new Map());
  // View filter for the comparison tables. Distinct from `selectedVendors`,
  // which is the recommendation short-list submitted for approval.
  const [hiddenVendorIds, setHiddenVendorIds] = useState<Set<string>>(
    new Set()
  );
  const [showRecommendationSection, setShowRecommendationSection] =
    useState(false);
  const [isSubmittingRecommendations, setIsSubmittingRecommendations] =
    useState(false);
  const [globalComments, setGlobalComments] = useState("");
  const [approvalLevel, setApprovalLevel] = useState<"level1" | "level2">("level1");
  const [level1Email, setLevel1Email] = useState("");
  const [level2Email, setLevel2Email] = useState("");
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(
    new Map()
  );
  const [approvalComments, setApprovalComments] = useState("");
  const [level2ApprovalDialogOpen, setLevel2ApprovalDialogOpen] =
    useState(false);
  const [level2ApprovalAction, setLevel2ApprovalAction] = useState<
    "approve" | "reject" | "request-revision" | null
  >(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: "approve" | "reject" | "request-revision";
  }>({ isOpen: false, action: "approve" });

  const rfqStatusVal = (buyerData?.rfp?.status || currentApproval?.status || "").toLowerCase();
  const approvalStatus = (currentApproval?.status || "").toLowerCase();
  const isRFPApproved = rfqStatusVal === "approved" || approvalStatus === "approved";
  const isRFPRejected = rfqStatusVal === "rejected" || approvalStatus === "rejected";
  const isRFPRequote = rfqStatusVal === "re-quote requested" || rfqStatusVal === "revision_requested" || isBuyerRevisionPending(currentApproval);
  const isRFQCompleted = isRFPApproved || isRFPRejected;

  const isPendingApproval =
    !isRFPRequote &&
    !isRFQCompleted &&
    (rfqStatusVal === "pending_approval" ||
      rfqStatusVal === "pending" ||
      rfqStatusVal === "under_review" ||
      approvalStatus === "pending" ||
      approvalStatus === "pending_approval" ||
      approvalStatus === "under_review");

  // NEW: Check if current user is Level 2 approver
  const isLevel2Approver = useMemo(() => {
    return currentApproval?.currentLevel === 2;
  }, [currentApproval]);

  const isBuyerActionsLocked = useMemo(() => {
    return !isApproverMode && (isPendingApproval || isRFPApproved || isRFPRejected);
  }, [isApproverMode, isPendingApproval, isRFPApproved, isRFPRejected]);


  const processedVendors = useMemo(() => {
    const vendors = processVendors(formattedResponses || [], buyerData).filter(
      (vendor) => {
        const st = (vendor.status || "").toLowerCase();
        return (
          st === "submitted" ||
          st === "submitted_draft" ||
          st === "draft" ||
          st === "approved" ||
          !st ||
          (vendor.revisions && vendor.revisions.length > 0)
        );
      }
    );

    return vendors.sort(
      (a, b) => (a.actualPrice ?? Infinity) - (b.actualPrice ?? Infinity)
    );
  }, [formattedResponses, buyerData]);

  // Everything below the filter bar compares this subset, not every response.
  const visibleVendors = useMemo(
    () =>
      processedVendors.filter(
        (vendor) => !hiddenVendorIds.has(vendor.vendorResponseId)
      ),
    [processedVendors, hiddenVendorIds]
  );

  // Best-price / fastest badges are relative to what is actually on screen.
  const lowestPriceVendor = useMemo(
    () => findLowestPriceVendor(visibleVendors),
    [visibleVendors]
  );

  const fastestDeliveryVendor = useMemo(
    () => findFastestDeliveryVendor(visibleVendors),
    [visibleVendors]
  );

  const toggleVendorSelection = (
    vendorResponseId: string,
    companyName: string
  ) => {
    if (isBuyerActionsLocked) {
      toast.error(
        "Cannot modify vendor selection. RFP is currently under approval review or already approved."
      );
      return;
    }

    if (!isLoggedIn && !isApproverMode) return;

    const newSelected = new Map(selectedVendors);
    const newErrors = new Map(validationErrors);

    if (newSelected.has(vendorResponseId)) {
      newSelected.delete(vendorResponseId);
      newErrors.delete(vendorResponseId);
    } else {
      newSelected.set(vendorResponseId, {
        vendorResponseId,
        companyName,
        remarks: "",
      });
    }
    setSelectedVendors(newSelected);
    setValidationErrors(newErrors);
    setShowRecommendationSection(newSelected.size > 0);
  };

  const updateVendorRemarks = (vendorResponseId: string, remarks: string) => {
    if (isBuyerActionsLocked) {
      return;
    }

    if (!isLoggedIn && !isApproverMode) return;

    const newSelected = new Map(selectedVendors);
    const newErrors = new Map(validationErrors);

    const vendor = newSelected.get(vendorResponseId);
    if (vendor) {
      newSelected.set(vendorResponseId, { ...vendor, remarks });
      setSelectedVendors(newSelected);

      if (remarks.trim()) {
        newErrors.delete(vendorResponseId);
        setValidationErrors(newErrors);
      }
    }
  };

  const validateRecommendations = (): boolean => {
    const newErrors = new Map();
    let hasErrors = false;

    selectedVendors.forEach((vendor, vendorResponseId) => {
      if (!vendor.remarks.trim()) {
        newErrors.set(vendorResponseId, "Recommendation remarks are required");
        hasErrors = true;
      }
    });

    setValidationErrors(newErrors);
    return !hasErrors;
  };

  const handleUnifiedApprovalAction = (
    action: "approve" | "reject" | "request-revision"
  ) => {
    if (!approvalComments.trim()) {
      toast.error("Approval comments are required");
      return;
    }

    if (action === "approve") {
      const hasRecommendations =
        selectedVendors.size > 0 ||
        (buyerRecommendations && buyerRecommendations.length > 0);

      if (!hasRecommendations) {
        toast.error(
          "At least one vendor recommendation is required to approve the RFP"
        );
        return;
      }

      if (selectedVendors.size > 0 && !validateRecommendations()) {
        toast.error("Please provide remarks for all selected vendors");
        return;
      }
    }

    if (action === "request-revision" && selectedVendors.size > 0) {
      if (!validateRecommendations()) {
        toast.error("Please provide remarks for all selected vendors");
        return;
      }
    }
    if (isLevel2Approver) {
      setLevel2ApprovalAction(action);
      setLevel2ApprovalDialogOpen(true);
    } else {
      setConfirmationDialog({ isOpen: true, action });
    }
  };

  // NEW: Handler for Level 2 approval dialog confirmation
  const handleLevel2ApprovalConfirm = async (
    comments: string,
    revisionRecipient?: string
  ) => {
    if (!level2ApprovalAction || !onUnifiedApprovalDecision) return;

    const recommendedVendors =
      selectedVendors.size > 0
        ? Array.from(selectedVendors.values())
        : buyerRecommendations || [];

    try {
      setIsSubmittingRecommendations(true);
      await onUnifiedApprovalDecision(
        level2ApprovalAction,
        comments,
        recommendedVendors,
        revisionRecipient
      );
      setLevel2ApprovalDialogOpen(false);
      setLevel2ApprovalAction(null);
    } catch (error) {
      console.error("Error processing Level 2 approval:", error);
      toast.error("Failed to process approval decision");
    } finally {
      setIsSubmittingRecommendations(false);
    }
  };

  const handleConfirmUnifiedAction = async () => {
    const { action } = confirmationDialog;
    const recommendedVendors =
      selectedVendors.size > 0
        ? Array.from(selectedVendors.values())
        : buyerRecommendations || [];

    try {
      setIsSubmittingRecommendations(true);

      if (onUnifiedApprovalDecision) {
        await onUnifiedApprovalDecision(
          action,
          approvalComments.trim(),
          recommendedVendors
        );
      }
    } catch (error) {
      console.error("Error processing approval:", error);
    } finally {
      setIsSubmittingRecommendations(false);
      setConfirmationDialog({ isOpen: false, action: "approve" });
    }
  };


  const handleCloseDialog = () => {
    setConfirmationDialog({ isOpen: false, action: "approve" });
  };

  const handleRecommendationSubmit = async () => {
    if (isBuyerActionsLocked) {
      toast.error(
        "Cannot submit recommendations. RFP is currently under approval review or already approved."
      );
      return;
    }

    if (!rfpId || selectedVendors.size === 0 || (!isLoggedIn && !isApproverMode)) return;

    if (!validateRecommendations()) {
      toast.error("Please provide remarks for all selected vendors");
      return;
    }

    if (!isApproverMode) {
      if (approvalLevel === "level1") {
        if (!level1Email.trim() || !level1Email.includes("@")) {
          toast.error("Please enter a valid Level 1 Approver Email ID");
          return;
        }
      } else {
        if (!level1Email.trim() || !level1Email.includes("@")) {
          toast.error("Please enter a valid Level 1 Approver Email ID");
          return;
        }
        if (!level2Email.trim() || !level2Email.includes("@")) {
          toast.error("Please enter a valid Level 2 Approver Email ID");
          return;
        }
        if (
          level1Email.trim().toLowerCase() === level2Email.trim().toLowerCase()
        ) {
          toast.error(
            "Level 1 and Level 2 approvers must have different email addresses"
          );
          return;
        }
      }
    }

    setIsSubmittingRecommendations(true);

    try {
      let approvalId: string | null = null;

      if (!isApproverMode) {
        const recommendedVendorsList = Array.from(selectedVendors.values()).map(
          (vendor) => ({
            companyName: vendor.companyName,
            vendorResponseId: vendor.vendorResponseId,
            reason: vendor.remarks.trim(),
          })
        );

        const approvalRes = await fetch(`/api/rfq/${rfpId}/approval`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comments:
              globalComments.trim() ||
              `Recommended ${selectedVendors.size} vendor${
                selectedVendors.size > 1 ? "s" : ""
              } for consideration.`,
            approvalLevel,
            level1ApproverEmail: level1Email.trim(),
            level2ApproverEmail:
              approvalLevel === "level2" ? level2Email.trim() : null,
            recommendedVendors: recommendedVendorsList,
          }),
        });

        if (!approvalRes.ok) {
          const err = await approvalRes.json();
          throw new Error(`Failed to create approval cycle: ${err.error}`);
        }

        const approvalData = await approvalRes.json();
        approvalId = approvalData.approval?.id || approvalData.id;
      }


      const promises = Array.from(selectedVendors.values()).map(
        async (vendor) => {
          const res = await fetch(`/api/rfq/${rfpId}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vendorResponseId: vendor.vendorResponseId,
              reason: vendor.remarks.trim(),
              ...(approvalId ? { approvalId } : {}),
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(
              `Failed to recommend ${vendor.companyName}: ${err.error}`
            );
          }
        }
      );
      await Promise.all(promises);

      if (isApproverMode) {
        toast.success(
          `Successfully added ${selectedVendors.size} approver recommendation${
            selectedVendors.size > 1 ? "s" : ""
          }!`
        );
        onRecommendationUpdate?.();
      } else {
        if (approvalLevel === "level1") {
          toast.success(
            `Approval request sent to Level 1 Approver (${level1Email.trim()})!`
          );
        } else {
          toast.success(
            `Approval request sent to Level 1 Approver (${level1Email.trim()}). Level 2 (${level2Email.trim()}) will receive after Level 1 approves!`
          );
        }
      }

      setSelectedVendors(new Map());
      setShowRecommendationSection(false);
      setGlobalComments("");
      setLevel1Email("");
      setLevel2Email("");
      setValidationErrors(new Map());
    } catch (e) {
      toast.error("Failed: " + (e as Error).message);
    } finally {
      setIsSubmittingRecommendations(false);
    }
  };

  const handleExpressInterest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsPremiumDialogOpen(false);
    }, 1500);
  };

  if (!comparisonMode || processedVendors.length === 0) {
    return null;
  }

  const hasBOQData =
    buyerData && Array.isArray(buyerData) && buyerData.length > 0;

  const handleDownloadPDF = async () => {
    try {
      if (typeof window === "undefined") {
        toast.error("PDF generation is only available on the client side");
        return;
      }
      setIsSubmitting(true);
      const { pdf } = await import("@react-pdf/renderer");
      const approverInfo = currentApproval
        ? {
            name: currentApproval.approver?.name,
            email: currentApproval.approver?.email,
            company:
              currentApproval.approver?.company ||
              buyerInfo?.company?.name ||
              "",
            comments:
              currentApproval.approverComments || currentApproval.buyerComments,
            reviewedAt: currentApproval.reviewedAt || currentApproval.createdAt,
            status: currentApproval.status,
          }
        : undefined;

      // The PDF mirrors the on-screen comparison, so it follows the same filter.
      const vendorSummary = {
        totalVendors: visibleVendors.length,
        selectedVendors: Array.from(selectedVendors.values()).map(
          (v) => v.companyName
        ),
        approvedVendors:
          recommendations
            ?.filter(
              (rec: any) =>
                rec?.recommenderRole === "approver" && rec?.status === "approve"
            )
            .map((rec: any) => rec.vendorResponse?.companyDetails?.companyName)
            .filter(Boolean) || [],
        rejectedVendors:
          recommendations
            ?.filter(
              (rec: any) =>
                rec?.recommenderRole === "approver" && rec?.status === "reject"
            )
            .map((rec: any) => rec.vendorResponse?.companyDetails?.companyName)
            .filter(Boolean) || [],
      };

      const blob = await pdf(
        <VendorComparisionPdf
          vendors={visibleVendors}
          selectedVendors={selectedVendors}
          recommendations={recommendations}
          currentApproval={currentApproval}
          rfpId={rfpId}
          document={document}
          buyerData={buyerData}
          buyerInfo={buyerInfo}
          evaluationCriteria={evaluationCriteria}
          approverInfo={approverInfo}
          vendorSummary={vendorSummary}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;

      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();

      let hours = now.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const projectName =
        buyerInfo?.requirements?.projectName ||
        document?.projectName ||
        "Project";

      link.download = `${projectName.replace(/[^a-zA-Z0-9]/g, "_")}_${month}-${day}-${year}_${String(hours).padStart(2, "0")}-${minutes}_${ampm}.pdf`;

      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Vendor Comparison Report
            </h1>
            <p className="text-gray-600 mt-1">
              {!isLoggedIn
                ? "Compare vendors and explore features (Login to unlock recommendations)"
                : isApproverMode
                  ? "Review vendors, add recommendations, and make approval decision"
                  : isBuyerActionsLocked
                    ? "View comparison (Vendor selection locked during approval)"
                    : "Compare vendors and add recommendations"}
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              className="h-10 px-4 disabled:opacity-50"
              onClick={handleDownloadPDF}
              disabled={isSubmitting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isSubmitting ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>

          {isLoggedIn && selectedVendors.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {selectedVendors.size} vendor
                {selectedVendors.size > 1 ? "s" : ""} selected
              </Badge>
              {isApproverMode && (
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Approver Mode
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOCKED STATE ALERT FOR BUYER */}
      {isBuyerActionsLocked && !isApproverMode && (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            <strong>Vendor Selection Locked:</strong> This RFP is currently{" "}
            {isRFPApproved
              ? "approved"
              : isPendingApproval
                ? "pending approval"
                : "under revision request"}
            . You cannot modify vendor selections or submit new recommendations
            until the approval process is complete.
          </AlertDescription>
        </Alert>
      )}

      {/* Show Approval Details if RFP is approved */}
      {isRFPApproved && currentApproval?.approverComments && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              RFP Approval Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Approver Comments
                </h3>
                <p className="text-gray-700">
                  {currentApproval.approverComments}
                </p>
                <div className="mt-3 text-sm text-gray-500">
                  <p>
                    <strong>Approved by:</strong>{" "}
                    {currentApproval.approver?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      currentApproval.reviewedAt ||
                        currentApproval.createdAt ||
                        ""
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show Approver Recommendations if RFP is approved */}
      {isRFPApproved &&
        groupedRecommendations?.approver &&
        groupedRecommendations.approver.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Users className="h-5 w-5" />
                Approver Recommendations (
                {groupedRecommendations.approver.length})
              </CardTitle>
              <p className="text-sm text-blue-700">
                Vendor recommendations submitted by the approver
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedRecommendations.approver.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="border border-blue-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {rec.vendorResponse?.companyDetails?.companyName ||
                              "Unknown Vendor"}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            Approver Recommendation
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>
                            <strong>Recommended by:</strong>{" "}
                            {rec.recommender?.name || rec.recommenderRole || "Approver"}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : "N/A"}
                          </p>

                          <p>
                            <strong>Reason:</strong> {rec.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Mandatory Vendor Selection Notice for Approvers */}
      {isLoggedIn && isApproverMode && isPendingApproval && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Important:</strong> You must recommend at least one vendor
            before approving this RFP. Select vendors from the comparison tables
            below and provide your recommendations.
          </AlertDescription>
        </Alert>
      )}

      {/* Pick which vendors the comparison tables below should include */}
      {processedVendors.length > 1 && (
        <VendorFilter
          vendors={processedVendors}
          hiddenVendorIds={hiddenVendorIds}
          onChange={setHiddenVendorIds}
        />
      )}

      {/* Comparison Tables */}
      <VendorProfileTable
        vendors={visibleVendors}
        lowestPriceVendor={lowestPriceVendor}
        fastestDeliveryVendor={fastestDeliveryVendor}
        selectedVendors={isLoggedIn ? selectedVendors : new Map()}
        onToggleVendor={isLoggedIn ? toggleVendorSelection : () => {}}
        onUpdateRemarks={isLoggedIn ? updateVendorRemarks : () => {}}
        validationErrors={isLoggedIn ? validationErrors : new Map()}
        isLoggedIn={isLoggedIn}
        recommendations={recommendations}
        isBuyerActionsLocked={isBuyerActionsLocked}
        currentApproval={currentApproval}
      />

      <CommercialsTable
        vendors={visibleVendors}
        selectedVendors={isLoggedIn ? selectedVendors : new Map()}
        onToggleVendor={isLoggedIn ? toggleVendorSelection : () => {}}
        onUpdateRemarks={isLoggedIn ? updateVendorRemarks : () => {}}
        validationErrors={isLoggedIn ? validationErrors : new Map()}
        isLoggedIn={isLoggedIn}
        recommendations={recommendations}
        isBuyerActionsLocked={isBuyerActionsLocked}
        currentApproval={currentApproval}
      />

      {hasBOQData ? (
        <ItemLevelViewTable
          vendors={visibleVendors}
          buyerData={buyerData}
          selectedVendors={isLoggedIn ? selectedVendors : new Map()}
          onToggleVendor={isLoggedIn ? toggleVendorSelection : () => {}}
          onUpdateRemarks={isLoggedIn ? updateVendorRemarks : () => {}}
          validationErrors={isLoggedIn ? validationErrors : new Map()}
          isLoggedIn={isLoggedIn}
          recommendations={recommendations}
          rfpId={rfpId}
          currentApproval={currentApproval}
          isBuyerActionsLocked={isBuyerActionsLocked}
        />
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">
              BOQ Data Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Detailed item-level BOQ comparison is not available. This could be
              because:
            </p>
            <ul className="list-disc list-inside mt-2 text-amber-700 space-y-1">
              <li>The original RFP did not include detailed BOQ information</li>
              <li>Vendor responses don&apos;t contain structured BOQ data</li>
              <li>
                BOQ data structure couldn&apos;t be reconstructed from available
                information
              </li>
            </ul>
            <p className="text-amber-700 mt-3">
              You can still review vendor profiles, commercials, and compliance
              above.
            </p>
          </CardContent>
        </Card>
      )}

      <ComplianceTable
        vendors={visibleVendors}
        buyerData={evaluationCriteria}
        document={document?.documentsToShare}
        selectedVendors={isLoggedIn ? selectedVendors : new Map()}
        onToggleVendor={isLoggedIn ? toggleVendorSelection : () => {}}
        onUpdateRemarks={isLoggedIn ? updateVendorRemarks : () => {}}
        validationErrors={isLoggedIn ? validationErrors : new Map()}
        isLoggedIn={isLoggedIn}
        recommendations={recommendations}
        isBuyerActionsLocked={isBuyerActionsLocked}
        currentApproval={currentApproval}
      />

      {isLoggedIn && isApproverMode && buyerRecommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              Buyer Recommendations ({buyerRecommendations.length})
            </CardTitle>
            <p className="text-sm text-blue-700">
              Vendor recommendations submitted by the buyer team
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buyerRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="border border-blue-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {rec.vendorResponse?.companyDetails?.companyName ||
                            "Unknown Vendor"}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          Buyer Recommendation
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <strong>Recommended by:</strong>{" "}
                          {rec.recommender?.name || rec.recommenderRole || "Buyer"}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : "N/A"}
                        </p>

                        <p>
                          <strong>Reason:</strong> {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoggedIn && (
        <VendorRecommendationTable
          vendors={processedVendors}
          selectedVendors={selectedVendors}
          onToggleVendor={toggleVendorSelection}
          onUpdateRemarks={updateVendorRemarks}
          validationErrors={validationErrors}
          isRFPApproved={isRFPApproved}
          isBuyerActionsLocked={isBuyerActionsLocked}
        />
      )}




      {/* Completed Status Banners (Approve / Reject) */}
      {isRFPApproved && (
        <Card className="border-green-300 bg-green-50 my-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-green-900">RFQ Status: Approved</h3>
                <p className="text-sm text-green-800 mt-1">
                  This RFQ recommendation has been approved by the approver. The approval flow is complete and permanently closed.
                </p>
                {currentApproval?.level1Comments && (
                  <p className="text-xs text-green-700 italic mt-2 bg-white/60 p-2 rounded border border-green-200">
                    Approver Comments: &quot;{currentApproval.level1Comments}&quot;
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isRFPRejected && (
        <Card className="border-red-300 bg-red-50 my-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-red-900">RFQ Status: Rejected</h3>
                <p className="text-sm text-red-800 mt-1">
                  This RFQ recommendation has been rejected by the approver. The approval flow is completed.
                </p>
                {(currentApproval?.level1Comments || currentApproval?.buyerComments) && (
                  <p className="text-xs text-red-700 italic mt-2 bg-white/60 p-2 rounded border border-red-200">
                    Rejection Reason: &quot;{currentApproval?.level1Comments || currentApproval?.buyerComments}&quot;
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isRFPRequote && (
        <Card className="border-amber-300 bg-amber-50 my-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Edit className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-amber-900">RFQ Status: Re-quote Requested</h3>
                <p className="text-sm text-amber-800 mt-1">
                  The approver has requested a lower price re-quote / negotiation. The buyer can negotiate with the vendor and click &quot;Send for Approval&quot; again.
                </p>
                {(currentApproval?.level1Comments || currentApproval?.level2Comments) && (
                  <p className="text-xs text-amber-700 italic mt-2 bg-white/60 p-2 rounded border border-amber-200">
                    Approver Instructions: &quot;{currentApproval.level1Comments || currentApproval.level2Comments}&quot;
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Approver Action Section - Only for Approvers */}
      {isApproverMode && !isRFQCompleted && (
        <Card className="border-blue-200 bg-blue-50 my-6 shadow-sm">

          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5 text-purple-600" />
              {isLevel2Approver ? "Level 2 " : ""}Approver Decision & Actions
            </CardTitle>
            <p className="text-sm text-blue-700">
              Review the buyer&apos;s recommendations and justification below, then select your approval decision.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buyer Comments / Justification Summary */}
            <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-2">
              <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Buyer Comments / Justification
              </Label>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border italic">
                "{currentApproval?.buyerComments || globalComments || "Recommended selected vendor for consideration."}"
              </p>
              {buyerRecommendations && buyerRecommendations.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Buyer Recommended Vendor(s):</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {buyerRecommendations.map((rec: any) => (
                      <Badge key={rec.id || rec.vendorResponseId} className="bg-green-100 text-green-800 border-green-300">
                        {rec.vendorResponse?.companyDetails?.companyName || rec.vendorResponseId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Approval Decision Comments Input */}
            <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-2">
              <Label htmlFor="approval-comments" className="text-sm font-medium text-gray-900">
                Approver Decision Comments / Rejection Reason / Re-quote Instructions
              </Label>
              <Textarea
                id="approval-comments"
                placeholder="Enter comments, rejection reason, or lower price re-quote instructions..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                className="min-h-[90px]"
              />
            </div>

            {/* Action Buttons: Cancel, Reject, Request Re-quote, Approve */}
            <div className="flex flex-wrap justify-between items-center pt-4 border-t border-blue-200 bg-white p-4 rounded-lg gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setApprovalComments("");
                  toast.info("Action cancelled. Approval request remains pending.");
                }}
              >
                Cancel
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="destructive"
                  onClick={() => handleUnifiedApprovalAction("reject")}
                  disabled={isSubmittingRecommendations}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject RFQ
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleUnifiedApprovalAction("request-revision")}
                  disabled={isSubmittingRecommendations}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Request Re-quote / Lower Price
                </Button>

                <Button
                  onClick={() => handleUnifiedApprovalAction("approve")}
                  disabled={isSubmittingRecommendations}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve RFQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Standalone Recommendation Section - Only for Buyer */}
      {isLoggedIn &&
        showRecommendationSection &&
        !isApproverMode &&
        !isBuyerActionsLocked && (

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Star className="h-5 w-5" />
                Vendor Recommendations & Send for Approval ({selectedVendors.size})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">
                    Selected Vendors to Recommend
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedVendors.values()).map((vendor) => (
                    <Badge
                      key={vendor.vendorResponseId}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {vendor.companyName}
                    </Badge>
                  ))}
                </div>
              </div>

              {!isApproverMode && (
                <>
                  {/* Approval Level Selection */}
                  <div className="bg-white rounded-lg p-5 border border-blue-200 space-y-4">
                    <div>
                      <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Select Approval Level Required
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Please select whether you need Level 1 or Level 2 approval hierarchy.
                      </p>
                    </div>

                    {/* Level Selection Radio-style Toggle Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => setApprovalLevel("level1")}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          approvalLevel === "level1"
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900">
                            Level 1 Approval
                          </span>
                          <input
                            type="radio"
                            name="approvalLevel"
                            checked={approvalLevel === "level1"}
                            onChange={() => setApprovalLevel("level1")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Single-level approval process. Approval request is sent directly to Level 1 Approver.
                        </p>
                      </div>

                      <div
                        onClick={() => setApprovalLevel("level2")}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          approvalLevel === "level2"
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900">
                            Level 2 Approval
                          </span>
                          <input
                            type="radio"
                            name="approvalLevel"
                            checked={approvalLevel === "level2"}
                            onChange={() => setApprovalLevel("level2")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Two-stage sequential approval workflow (Level 1 ➔ Level 2 ➔ Final Approval).
                        </p>
                      </div>
                    </div>

                    {/* Approver Email Inputs */}
                    <div className="pt-3 border-t border-gray-100 space-y-4">
                      {approvalLevel === "level1" ? (
                        <div className="space-y-1.5">
                          <Label htmlFor="level1-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Level 1 Approver Email ID <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="level1-email"
                            type="email"
                            placeholder="Enter Level 1 approver's email address"
                            value={level1Email}
                            onChange={(e) => setLevel1Email(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="level1-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              Level 1 Approver Email ID <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="level1-email"
                              type="email"
                              placeholder="Enter Level 1 approver's email address"
                              value={level1Email}
                              onChange={(e) => setLevel1Email(e.target.value)}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="level2-email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              Level 2 Approver Email ID <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="level2-email"
                              type="email"
                              placeholder="Enter Level 2 approver's email address"
                              value={level2Email}
                              onChange={(e) => setLevel2Email(e.target.value)}
                              className="bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Visual Sequential Flow Indicator */}
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Approval Flow Hierarchy:
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-medium bg-white px-2.5 py-1 rounded border border-slate-300 text-slate-700">
                            Buyer
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-2.5 py-1 rounded border border-blue-200">
                            Level 1: {level1Email.trim() || "(Pending Email)"}
                          </span>
                          {approvalLevel === "level2" && (
                            <>
                              <span className="text-slate-400">➔</span>
                              <span className="font-medium bg-purple-100 text-purple-800 px-2.5 py-1 rounded border border-purple-200">
                                Level 2: {level2Email.trim() || "(Pending Email)"}
                              </span>
                            </>
                          )}
                          <span className="text-slate-400">➔</span>
                          <span className="font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded border border-green-200">
                            Final Approval
                          </span>
                        </div>
                        {approvalLevel === "level2" && (
                          <p className="text-[11px] text-slate-500 mt-2">
                            • <strong>Sequential Approval:</strong> Level 2 will receive the approval request only after Level 1 has approved.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="space-y-2">
                      <Label
                        htmlFor="global-comments"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Buyer Comments / Justification
                      </Label>
                      <Textarea
                        id="global-comments"
                        placeholder="Add overall justification for your buyer recommendations..."
                        value={globalComments}
                        onChange={(e) => setGlobalComments(e.target.value)}
                        className="min-h-[90px]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Send for Approval</p>
                  <p className="text-xs text-gray-500">
                    Submit your selected recommendations for approval review
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedVendors(new Map());
                      setShowRecommendationSection(false);
                      setGlobalComments("");
                      setLevel1Email("");
                      setLevel2Email("");
                      setValidationErrors(new Map());
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleRecommendationSubmit}
                    disabled={
                      isSubmittingRecommendations || selectedVendors.size === 0
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmittingRecommendations ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send for Approval ({selectedVendors.size} Vendor
                        {selectedVendors.size > 1 ? "s" : ""})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* NEW: Level 2 Approval Dialog - Only for Level 2 approvers */}
      {isLevel2Approver && (
        <Level2ApprovalDialog
          open={level2ApprovalDialogOpen}
          onOpenChange={setLevel2ApprovalDialogOpen}
          action={level2ApprovalAction}
          onConfirm={handleLevel2ApprovalConfirm}
          isLoading={isSubmittingRecommendations}
          level1ApproverName={currentApproval?.level1Approver?.name}
          requesterName={currentApproval?.requester?.name}
        />
      )}

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmUnifiedAction}
        action={confirmationDialog.action}
        selectedVendors={Array.from(selectedVendors.values())}
        comments={approvalComments}
        isProcessing={isSubmittingRecommendations}
      />

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 rounded-b-lg mb-6">
        <div className="flex justify-between items-center">
          <div>Generated on {new Date().toLocaleDateString()}</div>
          <div>Confidential - For Internal Use Only</div>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="flex justify-center py-4">
          <Button
            onClick={() => setIsPremiumDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Unlock Full Comparison - Upgrade to Premium
          </Button>
        </div>
      )}

      {!isLoggedIn && (
        <PremiumFeaturesDialog
          open={isPremiumDialogOpen}
          onOpenChange={setIsPremiumDialogOpen}
          handleExpressInterest={handleExpressInterest}
          isSubmitting={isSubmitting}
          contactId={contactId}
          rfpId={rfpId}
        />
      )}
    </div>
  );
};
