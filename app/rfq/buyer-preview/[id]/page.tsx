/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/rfq/buyer_preview/[id]/page.tsx - FIXED to handle guest users properly
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, Clock, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const idParam = params.id;
  const rfpId = Array.isArray(idParam) ? idParam[0] : idParam;

  const responseParam = searchParams.get("response");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [vendorResponses, setVendorResponses] = useState<VendorResponse[]>([]);
  const [totalVendorsSent, setTotalVendorsSent] = useState<number>(0);
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
  const [userRole, setUserRole] = useState<string>("guest");
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
    if (!isLoggedIn || !session?.user) {
      setUserRole("guest");
      return;
    }

    const userEmail = session?.user?.email?.toLowerCase();
    const userId = session?.user?.id;
    const role = ((session?.user as any)?.role || "").toLowerCase().trim();

    if (role === "admin" || searchParams.get("from") === "admin") {
      setUserRole("admin");
      return;
    }

    // Check if user is an explicitly assigned level 1 or level 2 approver for THIS specific RFP
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
        (Boolean(currentApproval.level1ApproverId) && currentApproval.level1ApproverId === userId) || Boolean(isLevel1Email);
      const isLevel2Approver =
        (Boolean(currentApproval.level2ApproverId) && currentApproval.level2ApproverId === userId) || Boolean(isLevel2Email);

      if (isLevel1Approver || isLevel2Approver) {
        setUserRole("approver");
        return;
      }
    }

    // Default to buyer role for logged-in user
    setUserRole("buyer");
  }, [isLoggedIn, session, currentApproval]);

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
        let actualSubmittedVendors: any[] = [];
        let allResponsesList: any[] = [];
        if (response.ok) {
          const vendorDataJson = await safeJson(response, []);
          const vendorData = vendorDataJson?.data || vendorDataJson || [];
          allResponsesList = Array.isArray(vendorData) ? vendorData : [];
          actualSubmittedVendors = allResponsesList.filter((v: any) => v.status && v.status.toLowerCase() !== "draft");
          setVendorResponses(actualSubmittedVendors);
        }

        // Fetch RFP details (public / available to all users)
        let rfpBuyerData: any = null;
        const rfpRes = await fetch(`/api/rfps/${rfpId}`, {
          credentials: "include",
          cache: "no-cache",
        });
        if (rfpRes.ok) {
          rfpBuyerData = await safeJson(rfpRes, null);
          if (rfpBuyerData) {
            setBuyerData(rfpBuyerData);
            setRfpUniqueId(rfpBuyerData.rfp?.rfpuniqId || "");
          }
        }

        // Compute total vendors sent from contacts, vendor list, or all invite responses
        const vendorContactsCount = Array.isArray(rfpBuyerData?.vendorContacts)
          ? rfpBuyerData.vendorContacts.length
          : Array.isArray(rfpBuyerData?.vendorcontacts)
            ? rfpBuyerData.vendorcontacts.length
            : 0;
        const vendorListCount = Array.isArray(rfpBuyerData?.vendors?.vendorList)
          ? rfpBuyerData.vendors.vendorList.length
          : 0;

        const maxVendorsSent = Math.max(
          vendorContactsCount,
          vendorListCount,
          allResponsesList.length,
          actualSubmittedVendors.length,
          1
        );
        setTotalVendorsSent(maxVendorsSent);

        // If no vendors have replied yet, do not fetch approval/revision data or show comparison view
        if (actualSubmittedVendors.length === 0) {
          setLoading(false);
          return;
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
  }, [rfpId, isLoggedIn, fetchApprovalData, checkVendorRevisions, responseParam, router]);

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

  // If no vendors have replied yet, do not render BuyerPreview comparison view
  if (vendorResponses.length === 0) {
    const isDraft = (buyerData?.rfp?.status || "").toLowerCase() === "draft";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-md w-full text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              {isDraft ? "RFQ in Draft Status" : "No Vendor Has Replied"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isDraft
                ? "This RFQ is currently in draft. No vendor has replied yet. Please complete and publish the RFQ, then wait for at least one vendor to reply."
                : "No vendor has replied yet. Please wait for at least one vendor to reply for the RFQ."}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            {isDraft ? (
              <Button
                onClick={() =>
                  router.push(
                    userRole === "admin" || searchParams.get("from") === "admin"
                      ? `/admin/rfqs/${rfpId}`
                      : `/rfq/${rfpId}/requirement`
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                {userRole === "admin" || searchParams.get("from") === "admin"
                  ? "Back to Admin RFQ"
                  : "Continue Editing RFQ"}
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                const isAdmin =
                  userRole === "admin" ||
                  searchParams.get("from") === "admin" ||
                  ((session?.user as any)?.role || "").toLowerCase().trim() === "admin";

                if (isAdmin) {
                  router.push("/admin");
                } else if (isLoggedIn) {
                  router.push("/dashboard");
                } else {
                  router.push("/");
                }
              }}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              {isLoggedIn || userRole === "admin" || searchParams.get("from") === "admin"
                ? "Go to Dashboard"
                : "Return Home"}
            </Button>
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
      currentApproval={currentApproval ?? undefined}
      buyerRecommendations={buyerRecommendations}
      urlResponseId={responseParam}
      totalVendorsSent={totalVendorsSent}
      userId={session?.user?.id}
      userEmail={session?.user?.email}
    />
  );
}
