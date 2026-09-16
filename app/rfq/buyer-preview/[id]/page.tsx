/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/rfq/buyer_preview/[id]/page.tsx - FIXED to handle guest users properly
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import BuyerPreview from "@/components/buyer-preview/buyer-preview-data/index";
import BuyerPreviewSkeleton from "./buyer-preview-skeleton";
import { RFPData } from "@/lib/types";
import { useSession } from "@/lib/auth-client";

interface VendorResponse {
  id: string;
  vendorResponseId: string;
  vendorId: string;
  companydetails: {
    companyName: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    phone: string;
    email: string;
    businessType?: string;
  };
  revisionNumber: Record<string, any>;
  status: string;
  logoUrl?: string;
  updatedAt?: string;
}

interface ApprovalVendor {
  vendorResponseId: string;
  companyName: string;
}

interface VendorRevisionStatus {
  vendorResponseId: string;
  companyName: string;
  hasNewRevision: boolean;
  totalRevisions: number;
  isInApprovalHistory: boolean;
}

interface CurrentApproval {
  id: number;
  rfpId: string;
  status: string;
  currentLevel: number;
  requiredLevels: number;

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

  revisionRequestRecipient?: string | null;

  requestedBy: string;
  requestedAt: string;
  reviewedAt?: string;
  buyerComments?: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  history?: any[];
  createdAt: string;
  updatedAt: string;
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

type DataType = {
  company?: {
    name?: string;
    address?: string;
    businessType?: string;
  };
  requirement?: {
    projectName?: string;
    purpose?: string;
  };
  contact?: {
    logoUrl?: string;
    contactName?: string;
    contactTitle?: string;
    contactDepartment?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    contactCity?: string;
  };
  scope?: {
    deliverables?: Array<{ text: string }>;
  };
  boq?: Array<{
    id?: number | string;
    category?: string;
    description?: string;
    uom?: string;
    qty?: string | number;
    targetPrice?: string | number;
    specification?: string;
    remarks?: string;
  }>;
  evaluation?: string[];
  financials?: {
    budgetType?: string;
    currency?: string;
    paymentTerm?: string;
    pbgAmount?: string | number;
    pbgNotes?: string;
    financialNotes?: string;
  };
  generalTerms?: {
    selectedTerms?: string[];
  };
  specialTerms?: {
    selectedTerms?: string[];
  };
  documentsToShare?: {
    documentsToShare?: string | Array<{ id: string; name: string }>;
  };
  vendors?: {
    vendorList?: string[];
    selectionMethod?: string;
    vendorRequirements?: string;
    vendorSelectionProcess?: string;
  };
  rfpDates?: {
    startDate?: string;
    endDate?: string;
    queryDate?: string;
    responseDate?: string;
  };
  rfp?: {
    status?: string;
  };
};

export default function BuyerPreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const idParam = params.id;
  const rfpId = Array.isArray(idParam) ? idParam[0] : idParam;

  const responseParam = searchParams.get("response");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [vendorResponses, setVendorResponses] = useState<VendorResponse[]>([]);
  const [buyerData, setBuyerData] = useState<DataType | null>(null);
  const [rfpUniqueId, setRfpUniqueId] = useState("");
  const [vendorsWithNewRevisions, setVendorsWithNewRevisions] = useState<
    VendorRevisionStatus[]
  >([]);
  const [currentApproval, setCurrentApproval] =
    useState<CurrentApproval | null>(null);
  const [buyerRecommendations, setBuyerRecommendations] = useState<
    BuyerRecommendation[]
  >([]);
  const [userRole, setUserRole] = useState<
    "buyer" | "approver" | "admin" | "guest"
  >("guest");
  const [orgSlug, setOrgSlug] = useState<string>("");
  const { data: session, isPending: authLoading } = useSession();
  const isLoggedIn = !authLoading && !!session?.user;

  const safeJson = async (res: Response, fallback: any = null) => {
    if (!res.ok) return fallback;
    const contentType = res.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return fallback;
    }
    try {
      return await res.json();
    } catch {
      return fallback;
    }
  };

  // Determine user role with proper approver detection
  const determineUserRole = useCallback(async () => {
    console.log("[BuyerPreview] determineUserRole called:", {
      isLoggedIn,
      hasSession: !!session?.user,
      sessionRole: (session?.user as any)?.role,
      responseParam,
    });

    const userEmail = session?.user?.email?.toLowerCase();
    const userId = session?.user?.id;

    // Check if user is an approver for THIS specific RFP
    if (currentApproval) {
      const isLevel1Email =
        currentApproval.level1ApproverEmail &&
        userEmail &&
        currentApproval.level1ApproverEmail.toLowerCase() === userEmail;

      const isLevel2Email =
        currentApproval.level2ApproverEmail &&
        userEmail &&
        currentApproval.level2ApproverEmail.toLowerCase() === userEmail;

      const isLevel1Approver =
        currentApproval.level1ApproverId === userId || isLevel1Email;
      const isLevel2Approver =
        currentApproval.level2ApproverId === userId || isLevel2Email;

      // If user came via email link or email matches or status is pending approval
      if (
        isLevel1Approver ||
        isLevel2Approver ||
        responseParam ||
        (currentApproval.status === "pending_approval" && (responseParam || !isLoggedIn))
      ) {
        setUserRole("approver");
        console.log("[BuyerPreview] User role set to: approver");
        return;
      }
    }

    if (responseParam) {
      setUserRole("approver");
      console.log("[BuyerPreview] User role set to approver via URL responseParam");
      return;
    }

    if (!isLoggedIn || !session?.user) {
      console.log("[BuyerPreview] Not logged in, setting guest");
      setUserRole("guest");
      return;
    }

    try {
      // Get user's membership info
      // const membershipRes = await fetch("/api/user/current-membership", {
      //   credentials: "include",
      // });

      // if (membershipRes.ok) {
      //   const membershipData = await safeJson(membershipRes, null);
      //   const role = membershipData?.role;
      //   const organizationSlug = membershipData?.organization?.slug;

      //   if (organizationSlug) {
      //     setOrgSlug(organizationSlug);
      //   }

      //   // Check organization role
      //   if (role === "admin" || role === "zopa_admin") {
      //     setUserRole("admin");
      //   } else {
      //     setUserRole("buyer");
      //   }
      // } else {
      //   setUserRole("buyer");
      // }
    } catch (error) {
      console.error("[BuyerPreview] Error determining user role:", error);
      setUserRole("buyer");
    }
  }, [isLoggedIn, session, currentApproval, buyerRecommendations.length, responseParam]);

  const fetchApprovalData = useCallback(
    async (rfpId: string) => {
      try {
        const approvalRes = await fetch(`/api/rfq/${rfpId}/approval-history`);
        if (approvalRes.ok) {
          const approvalData = await safeJson(approvalRes, null);
          if (!approvalData) return;

          if (approvalData.currentApproval) {
            setCurrentApproval(approvalData.currentApproval);
          }

          const recommendations = approvalData.recommendations || [];
          setBuyerRecommendations(recommendations);
        }
      } catch (error) {
        console.error("Error fetching approval data:", error);
      }
    },
    [],
  );


  const checkVendorRevisions = useCallback(
    async (rfpId: string) => {
      if (!isLoggedIn) {
        return [];
      }

      try {
        const [approvalHistoryResponse, vendorResponsesResponse] =
          await Promise.all([
            fetch(`/api/rfq/${rfpId}/approval-history`),
            fetch(`/api/vendor-response?rfpId=${rfpId}`),
          ]);

        if (
          approvalHistoryResponse.status === 403 ||
          vendorResponsesResponse.status === 403
        ) {
          return [];
        }

        const approvalHistory = approvalHistoryResponse.ok
          ? await safeJson(approvalHistoryResponse, { recommendations: [], currentApproval: null })
          : { recommendations: [], currentApproval: null };

        const vendorResponsesRaw = await safeJson(vendorResponsesResponse, []);
        const vendorResponsesList = Array.isArray(vendorResponsesRaw?.data)
          ? vendorResponsesRaw.data
          : Array.isArray(vendorResponsesRaw)
          ? vendorResponsesRaw
          : [];

        const allVendors = vendorResponsesList.map((vendor: any) => ({
          vendorResponseId: vendor.vendorResponseId,
          companyName: vendor.companydetails?.companyName || "",
          email: vendor.companydetails?.email,
          revisionData: vendor.revisionNumber || {},
        }));

        const approvalVendors: ApprovalVendor[] =
          approvalHistory.recommendations?.map((rec: any) => ({
            vendorResponseId: rec.vendorResponseId,
            companyName: rec.vendorResponse?.companyDetails?.companyName || "",
          })) || [];

        const vendorsWithRevisionStatus: VendorRevisionStatus[] =
          allVendors.map((vendor: any) => {
            const isInApproval = approvalVendors.some(
              (approvalVendor: ApprovalVendor) =>
                approvalVendor.vendorResponseId === vendor.vendorResponseId,
            );
            const revisionKeys = Object.keys(vendor.revisionData || {});
            const hasMultipleRevisions = revisionKeys.length > 1;
            const hasNewRevision = !isInApproval || hasMultipleRevisions;

            return {
              vendorResponseId: vendor.vendorResponseId,
              companyName: vendor.companyName,
              hasNewRevision: hasNewRevision,
              totalRevisions: revisionKeys.length,
              isInApprovalHistory: isInApproval,
              email: vendor.email,
            };
          });

        return vendorsWithRevisionStatus.filter((v) => v.hasNewRevision);
      } catch (error) {
        console.error("Error checking vendor revisions:", error);
        return [];
      }
    },
    [isLoggedIn],
  );

  // Main data fetching effect - works for both logged in and guest users without requiring auth
  useEffect(() => {
    if (!rfpId) {
      const timer = window.setTimeout(() => {
        setError("Invalid RFQ ID");
        setLoading(false);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch vendor responses (public / available to all users)
        const response = await fetch(
          `/api/vendor-response?rfpId=${rfpId}`,
        );
        if (response.ok) {
          const vendorDataJson = await safeJson(response, []);
          const vendorData = vendorDataJson?.data || vendorDataJson || [];
          setVendorResponses(Array.isArray(vendorData) ? vendorData : []);
        }

        // Fetch RFP details (public / available to all users)
        const rfpRes = await fetch(`/api/rfps/${rfpId}`, {
          credentials: "include",
          cache: "no-cache",
        });
        if (rfpRes.ok) {
          const rfpBuyerData = await safeJson(rfpRes, null);
          if (rfpBuyerData) {
            setBuyerData(rfpBuyerData);
            setRfpUniqueId(rfpBuyerData.rfp?.rfpuniqId || "");
          }
        }

        // Fetch approval data for all users (logged-in and guest approvers)
        try {
          await fetchApprovalData(rfpId);
        } catch (e) {
          console.log("[BuyerPreview] Approval data fetch skipped:", e);
        }

        if (isLoggedIn) {
          try {
            const newRevisions = await checkVendorRevisions(rfpId);
            setVendorsWithNewRevisions(newRevisions);
          } catch (e) {
            console.log("[BuyerPreview] Optional auth data fetch skipped:", e);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rfpId, isLoggedIn, fetchApprovalData, checkVendorRevisions]);

  useEffect(() => {
    if (!loading) {
      const timer = window.setTimeout(() => {
        void determineUserRole();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [
    loading,
    currentApproval,
    buyerRecommendations,
    isLoggedIn,
    determineUserRole,
  ]);

  if (loading) {
    return <BuyerPreviewSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BuyerPreview
      rfpData={rfpData || undefined}
      vendorResponses={vendorResponses}
      buyerData={buyerData}
      rfpUniqueId={rfpUniqueId}
      rfpId={rfpId}
      isLoggedIn={isLoggedIn}
      vendorsWithNewRevisions={vendorsWithNewRevisions}
      userRole={userRole}
      orgSlug={orgSlug}
      currentApproval={currentApproval ?? undefined}
      buyerRecommendations={buyerRecommendations}
      urlResponseId={responseParam}
    />
  );
}
