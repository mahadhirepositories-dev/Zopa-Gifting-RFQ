/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

//***************** Packages *****************/
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  AlertCircle,
  Check,
  X,
  Edit,
  Star,
  Badge,
  FileText,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";

//***************** Components *************/
import { VendorResponseDocument } from "./rfp-download";
import PremiumFeaturesDialog from "../premium-features";
import Footer from "@/components/Footer";
import { VendorContactDetails } from "../vendor-contact/index";
import { UniqueVendorCount } from "./Unique-vendor-count";
import { VendorActions } from "./Vendor-actions";

// Updated import for the enhanced ApprovalHistory component
import { ApprovalHistory } from "@/components/approval/ApprovalHistory";
import { isBuyerRevisionPending } from "@/lib/approval-state";

//***************** lib ********************
import {
  BuyerPreviewProps,
  VendorResponse,
  RawVendorResponse,
  VendorRevision,
} from "@/lib/types/index";

// ***************** Section Components ********************
import { QuoteHeader } from "./section/Quote-header";
import { AddressCards } from "./section/Address-cards";
import { CompanyIntroduction } from "./section/Company-introduction";
import { ScopeOfWork } from "./section/Scope-of-work";
import { BOQ } from "./section/BOQ-table";
import { EvaluationCriteria } from "./section/evaluation-criteria";
import { FinancialTerms } from "./section/financial-terms";
import { GeneralTerms } from "./section/general-terms";
import { SpecialTerms } from "./section/special-terms";
import { OtherInformation } from "./section/other-information";
import { Attachments } from "./section/attachments";
import { VendorComparison } from "./vendor-comparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface EnhancedBuyerPreviewProps extends BuyerPreviewProps {
  isLoggedIn?: boolean;
  vendorsWithNewRevisions?: any;
  urlResponseId?: string | null;

  // FIXED: Two-level approval interface
  currentApproval?: {
    id: number;
    rfpId: string;
    status: string;
    currentLevel: number;
    requiredLevels: number;

    // Level 1 fields
    level1ApproverId: string | null;
    level1ApproverEmail?: string | null;
    level1Status: string;
    level1ReviewedAt?: string;
    level1Comments?: string;
    level1Approver?: {
      id: string;
      name: string;
      email: string;
    };

    // Level 2 fields
    level2ApproverId: string | null;
    level2ApproverEmail?: string | null;
    level2Status?: string | null;
    level2ReviewedAt?: string;
    level2Comments?: string;
    level2Approver?: {
      id: string;
      name: string;
      email: string;
    } | null;

    // Who a Level 2 revision request was addressed to: buyer, level1 or both
    revisionRequestRecipient?: string | null;

    // General fields
    requestedBy?: string;
    requestedAt?: string;
    createdAt?: string;
    reviewedAt?: string;
    buyerComments?: string;
    requester?: {
      id?: string;
      name?: string;
      email?: string;
    } | null;
    history?: any[];
  };



  buyerRecommendations?: Array<{
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
  }>;
}

interface TemplateSettings {
  showCompanyLogo: boolean;
  showCompanyName: boolean;
  showDocumentTitle: boolean;
  headerLayout: "left" | "center" | "right";
  includeSections: {
    companyIntroduction: boolean;
    aboutRequirement: boolean;
    scopeOfWork: boolean;
    billOfQuantities: boolean;
    evaluationCriteria: boolean;
    financialInformation: boolean;
    generalTerms: boolean;
    specialTerms: boolean;
    documentsToShare: boolean;
    vendorSelection: boolean;
    contactInformation: boolean;
    rfpTimeline: boolean;
  };
  showFooterContact: boolean;
  showPageNumbers: boolean;
  footerLayout: "single-line" | "multi-line";
  fontFamily:
    | "inter"
    | "roboto"
    | "poppins"
    | "opensans"
    | "raleway"
    | "allura"
    | "delius"
    | "asimovian";
  fontSize: {
    header: number;
    subheader: number;
    body: number;
    footer: number;
  };
  pageMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  sectionSpacing: number;
  lineSpacing: number;
  // Add the missing properties
  footerAlignment: "left" | "center" | "right";
  pageNumberAlignment: "left" | "center" | "right";
}

// Default template settings
const defaultTemplateSettings: TemplateSettings = {
  showCompanyLogo: true,
  showCompanyName: true,
  showDocumentTitle: true,
  headerLayout: "left",
  includeSections: {
    companyIntroduction: true,
    aboutRequirement: true,
    scopeOfWork: true,
    billOfQuantities: true,
    evaluationCriteria: true,
    financialInformation: true,
    generalTerms: true,
    specialTerms: true,
    documentsToShare: true,
    vendorSelection: true,
    contactInformation: true,
    rfpTimeline: true,
  },
  showFooterContact: true,
  showPageNumbers: true,
  footerLayout: "multi-line",
  fontFamily: "inter",
  fontSize: {
    header: 12,
    subheader: 10,
    body: 9,
    footer: 8,
  },
  pageMargins: {
    top: 70,
    bottom: 50,
    left: 50,
    right: 50,
  },
  sectionSpacing: 16,
  lineSpacing: 1.5,
  footerAlignment: "center",
  pageNumberAlignment: "center",
};

const registerPDFFonts = async (Font: any) => {
  try {
    Font.register({
      family: "Inter",
      fonts: [
        { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Roboto",
      fonts: [
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Poppins",
      fonts: [
        { src: "/fonts/Poppins-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Open Sans",
      fonts: [
        { src: "/fonts/OpenSans-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/OpenSans-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Raleway",
      fonts: [
        { src: "/fonts/Raleway-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Raleway-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Allura",
      src: "/fonts/Allura-Regular.ttf",
    });
    Font.register({
      family: "Delius", // Changed from "delius" to "Delius" to match the expected case
      src: "/fonts/Delius-Regular.ttf",
    });

    Font.register({
      family: "Asimovian",
      src: "/fonts/Orbitron-Regular.ttf",
    });
    Font.register({
      family: "sans-serif",
      fonts: [
        { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
      ],
    });

    Font.register({
      family: "monospace",
      src: "/fonts/RobotoMono-Regular.ttf",
    });
  } catch (error) {
    console.error("Error registering fonts:", error);
    Font.registerHyphenationCallback(() => []);
  }
};

function getUserApprovalRole(
  currentApproval: EnhancedBuyerPreviewProps["currentApproval"],
  userId?: string,
  userEmail?: string,
  urlResponseId?: string | null
): {
  isLevel1Approver: boolean;
  isLevel2Approver: boolean;
  isRequester: boolean;
  canTakeAction: boolean;
  currentUserLevel: 1 | 2 | null;
} {
  if (!currentApproval) {
    return {
      isLevel1Approver: false,
      isLevel2Approver: false,
      isRequester: false,
      canTakeAction: false,
      currentUserLevel: null,
    };
  }

  const isLevel1Approver = Boolean(
    (userId && currentApproval.level1ApproverId === userId) ||
    (userEmail && currentApproval.level1ApproverEmail?.toLowerCase() === userEmail.toLowerCase())
  );
  
  const isLevel2Approver = Boolean(
    (userId && currentApproval.level2ApproverId === userId) ||
    (userEmail && currentApproval.level2ApproverEmail?.toLowerCase() === userEmail.toLowerCase())
  );
  
  const isRequester = Boolean(userId && currentApproval.requestedBy === userId);

  // If a guest clicks the email link (urlResponseId is present) and the RFQ is pending, 
  // we let them take action for the current level (but ONLY if they are not logged in).
  const isGuestApproverViaLink = !userId && !userEmail && Boolean(urlResponseId);

  const canTakeAction =
    currentApproval.status === "pending" &&
    ((currentApproval.currentLevel === 1 && (isLevel1Approver || isGuestApproverViaLink)) ||
     (currentApproval.currentLevel === 2 && (isLevel2Approver || isGuestApproverViaLink)));

  const currentUserLevel = isLevel1Approver ? 1 : isLevel2Approver ? 2 : null;
  return {
    isLevel1Approver,
    isLevel2Approver,
    isRequester,
    canTakeAction,
    currentUserLevel,
  };
}

// Given a vendor, finds the revision with the HIGHEST revisionNumber
// (falling back to array index / object key when revisionNumber is
// missing) and returns its revisionData + the key needed to reproduce
// the same option `value` used in the Vendor Actions dropdown
// (`${vendor.id}-${revisionKey}`).
function getLatestRevisionForVendor(
  vendor: VendorResponse | RawVendorResponse | any,
): {
  revisionData: any;
  revisionKey: string;
} {
  // Case 1: vendor.revisions is an array
  if (Array.isArray(vendor.revisions) && vendor.revisions.length > 0) {
    let latestIndex = 0;
    let latestRevNum = Number(vendor.revisions[0]?.revisionNumber ?? 0);

    vendor.revisions.forEach((rev: any, idx: number) => {
      const num = Number(rev?.revisionNumber ?? idx);
      if (num > latestRevNum) {
        latestRevNum = num;
        latestIndex = idx;
      }
    });

    return {
      revisionData: vendor.revisions[latestIndex],
      revisionKey: String(latestIndex),
    };
  }

  // Case 2: vendor.revisionNumber is a keyed object
  if (
    typeof vendor.revisionNumber === "object" &&
    vendor.revisionNumber !== null
  ) {
    const entries = Object.entries(vendor.revisionNumber);
    const numericEntries = entries.filter(([key]) => !isNaN(Number(key)));

    if (numericEntries.length > 0) {
      let latestKey = numericEntries[0][0];
      let latestRevNum = Number(
        (numericEntries[0][1] as any)?.revisionNumber ?? numericEntries[0][0],
      );

      numericEntries.forEach(([key, rev]) => {
        const num = Number((rev as any)?.revisionNumber ?? key);
        if (num > latestRevNum) {
          latestRevNum = num;
          latestKey = key;
        }
      });

      return {
        revisionData: (vendor.revisionNumber as any)[latestKey],
        revisionKey: latestKey,
      };
    }

    // Non-numeric-keyed object: treat the whole thing as the single revision
    return {
      revisionData: vendor.revisionNumber,
      revisionKey: "0",
    };
  }

  // Case 3: no revisions at all
  return {
    revisionData: null,
    revisionKey: "0",
  };
}

export default function BuyerPreview({
  rfpData,
  vendorResponses = [],
  buyerData,
  rfpUniqueId,
  rfpId,
  isLoggedIn,
  vendorsWithNewRevisions,
  urlResponseId,
  currentApproval,
  buyerRecommendations = [],
}: EnhancedBuyerPreviewProps) {
  const router = useRouter();

  const [localResponses, setLocalResponses] = useState<VendorResponse[]>([]);

  // Sync vendorResponses from props into localResponses state with qualificationStatus
  useEffect(() => {
    if (Array.isArray(vendorResponses) && vendorResponses.length > 0) {
      const formatted: VendorResponse[] = vendorResponses.map(
        (response: RawVendorResponse) => ({
          id: response.id?.toString() || response.vendorResponseId || "",
          vendorResponseId: response.vendorResponseId || "",
          vendorId: response.vendorId || "",
          revisionNumber: response.revisionNumber,
          revisions: response.revisions,
          status: response.status || "",
          isDraft: (response as any).isDraft || false,
          updatedAt: response.updatedAt || "",
          qualificationStatus:
            response.qualificationStatus ||
            (response as any).qualification_status ||
            "qualified",
          companydetails: {
            companyName:
              response.companydetails?.companyName ||
              response.companyDetails?.companyName ||
              "",
            addressLine1:
              response.companydetails?.addressLine1 ||
              response.companyDetails?.addressLine1 ||
              "",
            addressLine2:
              response.companydetails?.addressLine2 ||
              response.companyDetails?.addressLine2 ||
              "",
            city:
              response.companydetails?.city ||
              response.companyDetails?.city ||
              "",
            state:
              response.companydetails?.state ||
              response.companyDetails?.state ||
              "",
            country:
              response.companydetails?.country ||
              response.companyDetails?.country ||
              "",
            postalCode:
              response.companydetails?.postalCode ||
              response.companyDetails?.postalCode ||
              "",
            phone:
              response.companydetails?.phone ||
              response.companyDetails?.phone ||
              "",
            email:
              response.companydetails?.email ||
              response.companyDetails?.email ||
              "",
            businessType:
              response.companydetails?.businessType ||
              response.companyDetails?.businessType ||
              "",
          },
          logoUrl: response.logoUrl || "",
        }),
      );
      setLocalResponses(formatted);
    } else {
      setLocalResponses([]);
    }
  }, [vendorResponses]);

  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(
    defaultTemplateSettings,
  );
  // State management
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorContactDialogOpen, setVendorContactDialogOpen] =
    useState<boolean>(false);
  const [premiumFeaturesDialogOpen, setPremiumFeaturesDialogOpen] =
    useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRevision | null>(
    null,
  );
  const [selectedDisqualifiedVendor, setSelectedDisqualifiedVendor] =
    useState<VendorRevision | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeMainTab, setActiveMainTab] = useState("vendor-responses");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const qualifiedResponses = localResponses.filter(
    (v) => v.qualificationStatus !== "disqualified",
  );
  const disqualifiedResponses = localResponses.filter(
    (v) => v.qualificationStatus === "disqualified",
  );

  const handleQualificationChange = async (
    vendorResponseId: string,
    newStatus: "qualified" | "disqualified",
  ) => {
    try {
      const updatedResponses = localResponses.map((v) =>
        v.vendorResponseId === vendorResponseId
          ? { ...v, qualificationStatus: newStatus }
          : v,
      );
      setLocalResponses(updatedResponses);

      // If currently selected qualified vendor gets disqualified
      if (
        selectedVendor &&
        selectedVendor.vendorResponseId === vendorResponseId &&
        newStatus === "disqualified"
      ) {
        const remainingQualified = updatedResponses.filter(
          (v) =>
            v.qualificationStatus !== "disqualified" &&
            v.companydetails?.companyName,
        );
        if (remainingQualified.length > 0) {
          const nextVendor = remainingQualified[0];
          const { revisionData, revisionKey } =
            getLatestRevisionForVendor(nextVendor);
          setSelectedVendor({
            ...nextVendor,
            _revisionKey: revisionKey,
            revisionData,
            _originalVendorId: nextVendor.vendorId,
            _uniqueId: `${nextVendor.id}-${revisionKey}`,
          });
        } else {
          setSelectedVendor(null);
        }
      }

      // If currently selected disqualified vendor gets qualified
      if (
        selectedDisqualifiedVendor &&
        selectedDisqualifiedVendor.vendorResponseId === vendorResponseId &&
        newStatus === "qualified"
      ) {
        const remainingDisqualified = updatedResponses.filter(
          (v) =>
            v.qualificationStatus === "disqualified" &&
            v.companydetails?.companyName,
        );
        if (remainingDisqualified.length > 0) {
          const nextVendor = remainingDisqualified[0];
          const { revisionData, revisionKey } =
            getLatestRevisionForVendor(nextVendor);
          setSelectedDisqualifiedVendor({
            ...nextVendor,
            _revisionKey: revisionKey,
            revisionData,
            _originalVendorId: nextVendor.vendorId,
            _uniqueId: `${nextVendor.id}-${revisionKey}`,
          });
        } else {
          setSelectedDisqualifiedVendor(null);
          // Auto switch back to qualified vendor responses tab if no disqualified vendors remain
          setActiveMainTab("vendor-responses");
        }
      }

      const res = await fetch("/api/vendor-response/qualification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorResponseId,
          qualificationStatus: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update qualification status");
      }

      toast.success(
        newStatus === "disqualified"
          ? "Vendor response disqualified successfully"
          : "Vendor response qualified successfully",
      );
    } catch (err: any) {
      console.error("Error updating qualification status:", err);
      toast.error("Failed to update qualification status");
    }
  };

  useEffect(() => {
    if (qualifiedResponses?.length > 0 && !selectedVendor) {
      let targetVendor = null;
      if (urlResponseId) {
        targetVendor = qualifiedResponses.find(
          (v) =>
            v.vendorResponseId === urlResponseId &&
            v.companydetails?.companyName,
        );
      }
      if (!targetVendor) {
        targetVendor = qualifiedResponses.find(
          (v) => v.companydetails?.companyName,
        );
      }

      if (targetVendor) {
        const { revisionData, revisionKey } =
          getLatestRevisionForVendor(targetVendor);

        const selectedVendorData = {
          ...targetVendor,
          _revisionKey: revisionKey,
          revisionData,
          _originalVendorId: targetVendor.vendorId,
          _uniqueId: `${targetVendor.id}-${revisionKey}`,
        };
        setSelectedVendor(selectedVendorData);
      }
    }
  }, [qualifiedResponses, selectedVendor, urlResponseId]);

  useEffect(() => {
    if (disqualifiedResponses?.length > 0 && !selectedDisqualifiedVendor) {
      const targetVendor = disqualifiedResponses.find(
        (v) => v.companydetails?.companyName,
      );
      if (targetVendor) {
        const { revisionData, revisionKey } =
          getLatestRevisionForVendor(targetVendor);

        const selectedVendorData = {
          ...targetVendor,
          _revisionKey: revisionKey,
          revisionData,
          _originalVendorId: targetVendor.vendorId,
          _uniqueId: `${targetVendor.id}-${revisionKey}`,
        };
        setSelectedDisqualifiedVendor(selectedVendorData);
      }
    }
  }, [disqualifiedResponses, selectedDisqualifiedVendor]);

  // useEffect(() => {
  //   const fetchUserId = async () => {
  //     try {
  //       const response = await fetch("/api/user/current-membership");
  //       if (response.ok) {
  //         const data = await response.json();
  //         setUserId(data.userId);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user ID:", error);
  //     }
  //   };

  //   if (isLoggedIn) {
  //     fetchUserId();
  //   }
  // }, [isLoggedIn]);

  const fetchRecommendations = useCallback(async () => {
    if (!rfpId) return;

    try {
      // const response = await fetch(`/api/rfq/${rfpId}/recommendations`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setRecommendations(data.recommendations || []);
      // }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [rfpId]);

  useEffect(() => {
    if (rfpId) {
      fetchRecommendations();
    }
  }, [rfpId, fetchRecommendations]);

  useEffect(() => {
    const fetchTemplateSettings = async () => {
      try {
        // const response = await fetch(
        //   "/api/admin/global-defaults/template-settings",
        // );
        // if (response.ok) {
        //   const contentType = response.headers.get("content-type");
        //   if (contentType && contentType.includes("application/json")) {
        //     const data = await response.json();
        //     if (data.success && data.templateSettings) {
        //       setTemplateSettings({
        //         ...defaultTemplateSettings,
        //         ...data.templateSettings,
        //         includeSections: {
        //           ...defaultTemplateSettings.includeSections,
        //           ...data.templateSettings.includeSections,
        //         },
        //         fontSize: {
        //           ...defaultTemplateSettings.fontSize,
        //           ...data.templateSettings.fontSize,
        //         },
        //         pageMargins: {
        //           ...defaultTemplateSettings.pageMargins,
        //           ...data.templateSettings.pageMargins,
        //         },
        //       });
        //     }
        //   }
        // }
      } catch (error) {
        console.error("Error fetching template settings:", error);
      }
    };

    fetchTemplateSettings();
  }, []);

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };
  const today = formatDate(new Date());

  const shareToWhatsApp = () => {
    const projectName =
      rfpData?.projectName || "CMS : Content management Systems";
    const vendorName = selectedVendor?.companydetails?.companyName || "Vendor";
    const shareText = `Check out the RFQ response from ${vendorName} for project "${projectName}"`;
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    setShareMenuOpen(false);
  };
  const approvalRole = getUserApprovalRole(currentApproval, userId);
  const isApproved =
    buyerData?.rfp?.status === "approved" ||
    currentApproval?.status === "approved";
  const isRevisionRequested =
    buyerData?.rfp?.status === "revision_requested" ||
    isBuyerRevisionPending(currentApproval);
  // An outstanding revision request wins over the pending badge - the RFQ is
  // waiting on the buyer, not on an approver.
  const isPendingApproval =
    !isRevisionRequested &&
    (buyerData?.rfp?.status === "pending_approval" ||
      currentApproval?.status === "pending");

  const isGuestApprover = !isLoggedIn && Boolean(currentApproval?.status?.startsWith("pending")) && Boolean(urlResponseId);
  const isApprover = approvalRole.isLevel1Approver || approvalRole.isLevel2Approver || isGuestApprover;
  const isBuyer = isLoggedIn && !isApprover;
  // Gated on the approval record alone (status + level + assigned approver),
  // never on the rfps.status column - a stale column value must not be able to
  // hide the action buttons from the approver who has to unblock the RFQ.
  const canApprove = isApprover && approvalRole.canTakeAction;
  const canViewApprovalHistory = isLoggedIn || Boolean(currentApproval);

  const handleUnifiedApprovalDecision = async (
    action: "approve" | "reject" | "request-revision",
    comments: string,
    recommendedVendors: any[],
    revisionRecipient?: string,
  ) => {
    if (!rfpId) return;
    setApprovalLoading(true);
    try {
      const buyerEmail =
        buyerData?.contact?.contactEmail || buyerData?.contact?.email;
      const targetApprovalId = currentApproval?.id || rfpId;

      if (recommendedVendors.length > 0 && currentApproval?.id) {
        const recommendationPromises = recommendedVendors.map(
          async (vendor) => {
            await fetch(`/api/rfq/${rfpId}/recommend`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                vendorResponseId: vendor.vendorResponseId,
                reason: vendor.remarks?.trim() || "",
                approvalId: currentApproval.id,
                action,
              }),
            });
          },
        );

        await Promise.all(recommendationPromises);
      }

      // Always call /api/rfq/[id]/approve endpoint to update RFQ status and trigger buyer decision email
      const approveRes = await fetch(`/api/rfq/${rfpId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comments: comments.trim(),
          buyerEmail,
        }),
      });

      // Call /api/approvals/[id] endpoint to update approval history table
      const response = await fetch(`/api/approvals/${targetApprovalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comments: comments.trim(),
          buyerEmail,
          revisionRecipient: revisionRecipient || "buyer",
          selectedVendor:
            recommendedVendors.length > 0
              ? recommendedVendors[0].vendorResponseId
              : null,
          selectedVendors: recommendedVendors.map((v) => ({
            vendorResponseId: v.vendorResponseId,
            companyName: v.companyName,
            remarks: v.remarks,
          })),
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn("Response body non-JSON or empty:", err);
      }

      if (response.ok || approveRes.ok) {
        const actionText =
          action === "approve"
            ? "approved"
            : action === "reject"
              ? "rejected"
              : "revision requested";

        toast.success(`RFQ ${actionText} successfully! Email sent to buyer.`);
        fetchRecommendations();
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast.error(data.error || `Failed to ${action} RFQ`);
      }
    } catch (error) {
      console.error(`Error processing approval decision:`, error);
      toast.error("Failed to submit approval decision");
    } finally {
      setApprovalLoading(false);
    }
  };

  if (localResponses?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Awaiting Vendor Responses
            </h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 text-left">
                    No vendor responses have been received yet for this RFQ.
                    You&apos;ll be notified when vendors submit their quotes.
                  </p>
                </div>
              </div>
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition duration-200">
              Remind Vendors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      if (!selectedVendor) {
        toast.error("No vendor selected to download response");
        return;
      }
      const { pdf, Font } = await import("@react-pdf/renderer");
      await registerPDFFonts(Font);

      const blob = await pdf(
        <VendorResponseDocument
          buyerData={buyerData}
          selectedVendor={selectedVendor}
          rfpUniqueId={rfpUniqueId}
          templateSettings={templateSettings}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Format date and time
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();

      let hours = now.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, "0");
      link.download = `${selectedVendor.companydetails.companyName}_(${month}-${day}-${year})_(${String(hours).padStart(2, "0")}-${minutes})_${ampm}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleExpressInterest = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/express-interest", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rfpId: rfpId,
          contactEmail: buyerData?.contact?.contactEmail,
        }),
      });

      const emailRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "express-interest",
          data: {
            buyerName: buyerData?.contact?.contactName,
            companyName: buyerData?.company?.name,
            buyerEmail: buyerData?.contact?.contactEmail,
            phoneNumber: buyerData?.contact?.contactPhone,
            url: `/admin/subscription?email=${buyerData?.contact?.contactEmail}`,
          },
        }),
      });

      if (!response.ok || !emailRes.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to express interest");
      }
      toast.success("Your interest has been recorded!");
      setPremiumFeaturesDialogOpen(false);
    } catch (error) {
      console.error("Error express interest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    setIsNavigating(true);
    router.back();
  };

  // Determine which tabs to show based on login status
  const getTabsList = () => {
    const tabs = [
      {
        value: "vendor-responses",
        label: "Vendor Responses",
        icon: <Users className="h-4 w-4 mr-2" />,
        show: true,
      },
      {
        value: "disqualified-responses",
        label: `Disqualified Vendors (${disqualifiedResponses.length})`,
        icon: <XCircle className="h-4 w-4 mr-2 text-red-500" />,
        show: disqualifiedResponses.length > 0,
      },
      {
        value: "comparison",
        label: "Compare Vendors",
        icon: null,
        show: isLoggedIn || isApprover || !!urlResponseId,
      },
      {
        value: "approval-history",
        label: "Approval & Recommendations",
        icon: <FileText className="h-4 w-4 mr-2" />,
        show: isLoggedIn && canViewApprovalHistory,
      },
    ];

    return tabs.filter((tab) => tab.show);
  };

  const tabsList = getTabsList();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <header className="bg-gray-50 fixed top-0 left-0 right-0 z-20 w-full border-b shadow-xs">
        <div className="container mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-blue-600">
              RFQ Response Preview
            </h1>
            <p className="text-sm">
              <span className="text-blue-600">Project: </span>
              {buyerData?.requirement?.projectName ||
                "CMS : Content management Systems"}
            </p>
          </div>
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setActiveMainTab("vendor-responses")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                activeMainTab === "vendor-responses"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
              }`}
            >
              <UniqueVendorCount responses={localResponses}>
                {(count) => (
                  <>
                    RFQ Sent to {count} Vendor{count !== 1 ? "s" : ""}
                  </>
                )}
              </UniqueVendorCount>
            </button>

            {/* Disqualified Pill Tab in Header */}
            {disqualifiedResponses.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveMainTab("disqualified-responses")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMainTab === "disqualified-responses"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                <XCircle className="h-4 w-4 text-red-500" />
                Disqualified ({disqualifiedResponses.length})
              </button>
            )}

            {/* Status Badges */}
            {isRevisionRequested && (
              <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Edit className="h-4 w-4 inline mr-1" />
                Revision Requested
              </div>
            )}
            {isPendingApproval && (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4 inline mr-1" />
                Pending Approval
              </div>
            )}
            {isApproved && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Check className="h-4 w-4 inline mr-1" />
                Approved
              </div>
            )}

            {/* Approver Action Badge */}
            {canApprove && (
              <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4 inline mr-1" />
                Action Required
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Approver Alert Banner */}
      {canApprove && currentApproval && (
        <div className="bg-purple-50 border-b border-purple-200 pt-24 pb-3 sm:pt-28">
          <div className="container mx-auto py-3 px-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-800">
                  {currentApproval.currentLevel === 2 ? (
                    <>
                      Level 2 Approval Required: This RFP has been approved by
                      Level 1 and requires your final approval.
                    </>
                  ) : (
                    <>
                      Level 1 Approval Required: This RFP is pending your review
                      and approval decision.
                    </>
                  )}
                </p>
                <p className="text-xs text-purple-600">
                  Review vendor responses, add recommendations, and make your
                  approval decision in the comparison tab.
                  {currentApproval.requiredLevels === 2 &&
                    currentApproval.currentLevel === 1 && (
                      <>
                        {" "}
                        After your approval, it will be forwarded to Level 2
                        approver.
                      </>
                    )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`container mx-auto px-4 pb-36 space-y-6 ${
          canApprove ? "pt-4" : "pt-28 sm:pt-32"
        }`}
      >
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
          {tabsList.length > 0 && (
            <TabsList className="inline-flex h-auto w-full flex-wrap items-center justify-start gap-1.5 rounded-xl bg-gray-100/90 p-1.5 border border-gray-200 text-gray-500 mb-2">
              {tabsList.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all cursor-pointer"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="vendor-responses" className="space-y-6">
            <VendorActions
              formattedResponses={localResponses}
              selectedVendor={selectedVendor}
              setSelectedVendor={setSelectedVendor}
              comparisonMode={false}
              setComparisonMode={() => {}}
              setVendorContactDialogOpen={setVendorContactDialogOpen}
              setPremiumFeaturesDialogOpen={setPremiumFeaturesDialogOpen}
              handleDownload={handleDownload}
              shareMenuOpen={shareMenuOpen}
              setShareMenuOpen={setShareMenuOpen}
              shareToWhatsApp={shareToWhatsApp}
              rfpId={rfpId}
              projectName={buyerData?.requirement?.projectName}
              buyerData={buyerData}
              rfpData={rfpData}
              onRecommendationUpdate={fetchRecommendations}
              showCompareButton={false}
              isLoggedIn={isLoggedIn}
              urlResponseId={urlResponseId}
              onQualificationChange={handleQualificationChange}
            />

            <VendorContactDetails
              formattedResponses={localResponses}
              open={vendorContactDialogOpen}
              onOpenChange={setVendorContactDialogOpen}
            />

            <PremiumFeaturesDialog
              open={premiumFeaturesDialogOpen}
              onOpenChange={setPremiumFeaturesDialogOpen}
              handleExpressInterest={handleExpressInterest}
              vendorName={buyerData?.company?.name}
              isSubmitting={isSubmitting}
              contactId={buyerData?.contact?.id}
            />

            {/* All the existing section components */}
            <QuoteHeader
              buyerData={buyerData}
              rfpUniqueId={rfpUniqueId}
              selectedVendor={selectedVendor}
              today={today}
            />

            <AddressCards
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <CompanyIntroduction selectedVendor={selectedVendor} />

            <ScopeOfWork
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <BOQ buyerData={buyerData} selectedVendor={selectedVendor} />

            <EvaluationCriteria
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <FinancialTerms
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <GeneralTerms
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <SpecialTerms
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />

            <OtherInformation selectedVendor={selectedVendor} />

            <Attachments
              buyerData={buyerData}
              selectedVendor={selectedVendor}
            />
          </TabsContent>

          <TabsContent value="disqualified-responses" className="space-y-6">
            {disqualifiedResponses.length > 0 ? (
              <>
                <VendorActions
                  formattedResponses={localResponses}
                  selectedVendor={selectedDisqualifiedVendor}
                  setSelectedVendor={setSelectedDisqualifiedVendor}
                  comparisonMode={false}
                  setComparisonMode={() => {}}
                  setVendorContactDialogOpen={setVendorContactDialogOpen}
                  setPremiumFeaturesDialogOpen={setPremiumFeaturesDialogOpen}
                  handleDownload={handleDownload}
                  shareMenuOpen={shareMenuOpen}
                  setShareMenuOpen={setShareMenuOpen}
                  shareToWhatsApp={shareToWhatsApp}
                  rfpId={rfpId}
                  projectName={buyerData?.requirement?.projectName}
                  buyerData={buyerData}
                  rfpData={rfpData}
                  onRecommendationUpdate={fetchRecommendations}
                  showCompareButton={false}
                  isLoggedIn={isLoggedIn}
                  urlResponseId={urlResponseId}
                  onQualificationChange={handleQualificationChange}
                  isDisqualifiedView={true}
                  onBackToQualified={() => setActiveMainTab("vendor-responses")}
                />

                <VendorContactDetails
                  formattedResponses={localResponses}
                  open={vendorContactDialogOpen}
                  onOpenChange={setVendorContactDialogOpen}
                />

                <PremiumFeaturesDialog
                  open={premiumFeaturesDialogOpen}
                  onOpenChange={setPremiumFeaturesDialogOpen}
                  handleExpressInterest={handleExpressInterest}
                  vendorName={buyerData?.company?.name}
                  isSubmitting={isSubmitting}
                  contactId={buyerData?.contact?.id}
                />

                {/* Complete vendor response details for selected disqualified vendor */}
                <QuoteHeader
                  buyerData={buyerData}
                  rfpUniqueId={rfpUniqueId}
                  selectedVendor={selectedDisqualifiedVendor}
                  today={today}
                />

                <AddressCards
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <CompanyIntroduction selectedVendor={selectedDisqualifiedVendor} />

                <ScopeOfWork
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <BOQ buyerData={buyerData} selectedVendor={selectedDisqualifiedVendor} />

                <EvaluationCriteria
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <FinancialTerms
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <GeneralTerms
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <SpecialTerms
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />

                <OtherInformation selectedVendor={selectedDisqualifiedVendor} />

                <Attachments
                  buyerData={buyerData}
                  selectedVendor={selectedDisqualifiedVendor}
                />
              </>
            ) : (
              <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-4 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  No Disqualified Vendors
                </h2>
                <p className="text-sm text-gray-500 text-center">
                  All vendor responses are currently qualified.
                </p>
                <Button
                  onClick={() => setActiveMainTab("vendor-responses")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Qualified Vendor Responses
                </Button>
              </div>
            )}
          </TabsContent>

          {(isLoggedIn || isApprover || !!urlResponseId) && (
            <TabsContent value="comparison">

              {localResponses?.some(
                (res) =>
                  res.companydetails &&
                  Object.values(res.companydetails).some(
                    (val) => val && val !== "",
                  ),
              ) ? (
                <VendorComparison
                  formattedResponses={localResponses}
                  comparisonMode={true}
                  buyerInfo={{
                    company: buyerData?.company,
                    contact: buyerData?.contact,
                    requirements: buyerData?.requirement,
                  }}
                  buyerData={buyerData?.boq}
                  evaluationCriteria={buyerData?.evaluation}
                  document={buyerData?.documentsToShare}
                  contactId={buyerData?.contact?.id}
                  rfpId={rfpId}
                  onRecommendationUpdate={fetchRecommendations}
                  isLoggedIn={isLoggedIn}
                  vendorsWithNewRevisions={vendorsWithNewRevisions}
                  isApproverMode={isApprover}
                  approvalId={currentApproval?.id}
                  currentApproval={
                    currentApproval
                      ? { ...currentApproval, rfpId: rfpId || "" }
                      : undefined
                  }
                  onUnifiedApprovalDecision={
                    isApprover ? handleUnifiedApprovalDecision : undefined
                  }
                  buyerRecommendations={buyerRecommendations}
                  recommendations={recommendations}
                />
              ) : (
                <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
                  <Inbox className="w-16 h-16 text-gray-400" />
                  <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Nothing to compare – No vendor responses yet.
                  </h2>
                </div>
              )}
            </TabsContent>
          )}

          {isLoggedIn && canViewApprovalHistory && (
            <TabsContent value="approval-history">
              <ApprovalHistory rfpId={rfpId || ""} showMinimal={false} />

              {currentApproval && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Approval Request Details
                      {currentApproval.requiredLevels === 2 && (
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          (Two-Level Approval)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Requested By
                        </label>
                        <p className="text-sm text-gray-900">
                          {currentApproval.requester?.name ||
                            (currentApproval as any).requestedBy ||
                            "Buyer"}
                        </p>
                        {currentApproval.requester?.email && (
                          <p className="text-xs text-gray-500">
                            {currentApproval.requester.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Request Date
                        </label>
                        <p className="text-sm text-gray-900">
                          {currentApproval.requestedAt
                            ? new Date(
                                currentApproval.requestedAt,
                              ).toLocaleDateString()
                            : currentApproval.createdAt
                            ? new Date(
                                currentApproval.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Overall Status
                        </label>
                        <div className="flex items-center gap-2">
                          {currentApproval.status === "pending" && (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                          {currentApproval.status === "approved" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {currentApproval.status === "rejected" && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm text-gray-900 capitalize">
                            {currentApproval.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Comments */}
                    {currentApproval.buyerComments && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Requester Comments
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                          {currentApproval.buyerComments}
                        </p>
                      </div>
                    )}

                    {/* Level 1 Approval Section */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Level 1 Approval
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Level 1 Approver
                          </label>
                          <p className="text-sm text-gray-900">
                            {currentApproval.level1Approver?.name ||
                              "Not assigned"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentApproval.level1Approver?.email}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Level 1 Status
                          </label>
                          <div className="flex items-center gap-2">
                            {currentApproval.level1Status === "pending" && (
                              <Clock className="h-4 w-4 text-orange-500" />
                            )}
                            {currentApproval.level1Status === "approved" && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {currentApproval.level1Status === "rejected" && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-900 capitalize">
                              {currentApproval.level1Status}
                            </span>
                          </div>
                          {currentApproval.level1ReviewedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Reviewed:{" "}
                              {new Date(
                                currentApproval.level1ReviewedAt,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {currentApproval.level1Comments && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">
                              Level 1 Comments
                            </label>
                            <p className="text-sm text-gray-900 bg-white p-3 rounded-lg mt-1">
                              {currentApproval.level1Comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Level 2 Approval Section (if two-level) */}
                    {currentApproval.requiredLevels === 2 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Level 2 Approval
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Level 2 Approver
                            </label>
                            <p className="text-sm text-gray-900">
                              {currentApproval.level2Approver?.name ||
                                "Not assigned"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {currentApproval.level2Approver?.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Level 2 Status
                            </label>
                            <div className="flex items-center gap-2">
                              {currentApproval.level2Status === "pending" && (
                                <Clock className="h-4 w-4 text-orange-500" />
                              )}
                              {currentApproval.level2Status === "approved" && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {currentApproval.level2Status === "rejected" && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {!currentApproval.level2Status && (
                                <span className="text-sm text-gray-500 italic">
                                  Awaiting Level 1 approval
                                </span>
                              )}
                              {currentApproval.level2Status && (
                                <span className="text-sm text-gray-900 capitalize">
                                  {currentApproval.level2Status}
                                </span>
                              )}
                            </div>
                            {currentApproval.level2ReviewedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Reviewed:{" "}
                                {new Date(
                                  currentApproval.level2ReviewedAt,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {currentApproval.level2Comments && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">
                                Level 2 Comments
                              </label>
                              <p className="text-sm text-gray-900 bg-white p-3 rounded-lg mt-1">
                                {currentApproval.level2Comments}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Footer className="fixed bottom-0 w-full z-10" />
    </div>
  );
}
