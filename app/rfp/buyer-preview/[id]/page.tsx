/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/rfp/buyer_preview/[id]/page.tsx - FIXED to handle guest users properly
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
  level1Status: string;
  level1ReviewedAt?: string;
  level1Comments?: string;
  level1Approver?: {
    id: string;
    name: string;
    email: string;
  };
  
  level2ApproverId: string | null;
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
  
  const responseParam = searchParams.get('response');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [vendorResponses, setVendorResponses] = useState<VendorResponse[]>([]);
  const [buyerData, setBuyerData] = useState<DataType | null>(null);
  const [rfpUniqueId, setRfpUniqueId] = useState("");
  const [vendorsWithNewRevisions, setVendorsWithNewRevisions] = useState<VendorRevisionStatus[]>([]);
  const [currentApproval, setCurrentApproval] = useState<CurrentApproval | null>(null);
  const [buyerRecommendations, setBuyerRecommendations] = useState<BuyerRecommendation[]>([]);
  const [userRole, setUserRole] = useState<'buyer' | 'approver' | 'admin' | 'guest'>('guest');
  const [orgSlug, setOrgSlug] = useState<string>('');
  const { data: session, isPending: authLoading } = useSession();
  const isLoggedIn = !authLoading && !!session?.user;

  // Determine user role with proper approver detection
  const determineUserRole = useCallback(async () => {
    console.log('[BuyerPreview] determineUserRole called:', { 
      isLoggedIn, 
      hasSession: !!session?.user,
      sessionRole: session?.user?.role 
    });
    
    if (!isLoggedIn || !session?.user) {
      console.log('[BuyerPreview] Not logged in, setting guest');
      setUserRole('guest');
      return;
    }

    const userId = session.user.id;
    console.log('[BuyerPreview] User ID:', userId);

    try {
      // Get user's membership info
      const membershipRes = await fetch('/api/user/current-membership', {
        credentials: 'include'
      });
      
      console.log('[BuyerPreview] Membership response status:', membershipRes.status);
      
      if (membershipRes.ok) {
        const membershipData = await membershipRes.json();
        const role = membershipData?.role;
        const organizationSlug = membershipData?.organization?.slug;
        
        console.log('[BuyerPreview] Membership data:', { role, organizationSlug });
        
        if (organizationSlug) {
          setOrgSlug(organizationSlug);
        }
        
        // Check if user is an approver for THIS specific RFP
        if (currentApproval) {
          const isLevel1Approver = currentApproval.level1ApproverId === userId;
          const isLevel2Approver = currentApproval.level2ApproverId === userId;
          
          console.log('[BuyerPreview] Approver check:', {
            userId,
            level1ApproverId: currentApproval.level1ApproverId,
            level2ApproverId: currentApproval.level2ApproverId,
            isLevel1Approver,
            isLevel2Approver,
            buyerRecommendationsCount: buyerRecommendations.length
          });
          
          if (isLevel1Approver || isLevel2Approver) {
            setUserRole('approver');
            console.log('[BuyerPreview] User role set to: approver');
            return;
          }
        }
        
        // If not an approver, check organization role
        if (role === 'admin' || role === 'zopa_admin') {
          setUserRole('admin');
          console.log('[BuyerPreview] User role set to: admin');
        } else if (role === 'buyer' || role === 'buyer_admin') {
          setUserRole('buyer');
          console.log('[BuyerPreview] User role set to: buyer');
        } else if (role) {
          // If we have a role but it doesn't match, still treat as buyer (logged in user)
          setUserRole('buyer');
          console.log('[BuyerPreview] User role set to: buyer (fallback from role:', role, ')');
        } else {
          // No role in membership, but user is logged in - treat as buyer
          setUserRole('buyer');
          console.log('[BuyerPreview] User role set to: buyer (no role in membership but logged in)');
        }
      } else {
        // Membership API failed, but user is logged in
        console.log('[BuyerPreview] Membership fetch failed, checking session role');
        if (session.user.role === 'admin' || session.user.role === 'zopa_admin') {
          setUserRole('admin');
          console.log('[BuyerPreview] User role set to: admin (from session)');
        } else {
          // User is logged in but membership API failed - treat as buyer
          setUserRole('buyer');
          console.log('[BuyerPreview] User role set to: buyer (membership API failed but logged in)');
        }
      }
    } catch (error) {
      console.error('[BuyerPreview] Error determining user role:', error);
      // User is logged in but something failed - treat as buyer, not guest
      setUserRole('buyer');
      console.log('[BuyerPreview] User role set to: buyer (error fallback, user is logged in)');
    }
  }, [isLoggedIn, session?.user, currentApproval, buyerRecommendations.length]);


  const fetchApprovalData = useCallback(async (rfpId: string) => {
    if (!isLoggedIn) {
      return;
    }

    try {      
      const approvalRes = await fetch(`/api/rfp/${rfpId}/approval-history`);
      if (approvalRes.ok) {
        const approvalData = await approvalRes.json();
        
        if (approvalData.currentApproval) {
          setCurrentApproval(approvalData.currentApproval);
        }
        
        const recommendations = approvalData.recommendations || [];
        const buyerRecs = recommendations.filter((rec: BuyerRecommendation) => 
          rec.recommenderRole === 'buyer' || rec.recommenderRole === 'buyer_admin'
        );
        setBuyerRecommendations(buyerRecs);

        if (session?.user?.id && approvalData.currentApproval) {
          const userId = session.user.id;
          const approval = approvalData.currentApproval;
        }
      }
      // Silently ignore 403/401 - approval data is optional for buyer preview
    } catch (error) {
      console.error('Error fetching approval data:', error);
    }
  }, [session?.user?.id, isLoggedIn]);

    const checkVendorRevisions = useCallback(async (rfpId: string) => {
      if (!isLoggedIn) {
        return [];
      }
  
      try {
        const [approvalHistoryResponse, vendorResponsesResponse] =
          await Promise.all([
            fetch(`/api/rfp/${rfpId}/approval-history`),
            fetch(`/api/buyer-vendor-response?rfpId=${rfpId}`),
          ]);
  
        if (approvalHistoryResponse.status === 403 || vendorResponsesResponse.status === 403) {
          return [];
        }

        if (!vendorResponsesResponse.ok) {
          throw new Error("Failed to fetch vendor data");
        }
  
        const approvalHistory = approvalHistoryResponse.ok 
          ? await approvalHistoryResponse.json() 
          : { recommendations: [], currentApproval: null };
          
        const vendorResponses = await vendorResponsesResponse.json();
        
        // SET APPROVAL DATA AND BUYER RECOMMENDATIONS
        if (approvalHistory.currentApproval) {
          setCurrentApproval(approvalHistory.currentApproval);
          console.log('[BuyerPreview] Current approval set:', approvalHistory.currentApproval);
        }
        
        const recommendations = approvalHistory.recommendations || [];
        const buyerRecs = recommendations.filter((rec: BuyerRecommendation) => 
          rec.recommenderRole === 'buyer' || rec.recommenderRole === 'buyer_admin'
        );
        setBuyerRecommendations(buyerRecs);
        console.log('[BuyerPreview] Buyer recommendations set:', buyerRecs.length);
        
        const approvalVendors: ApprovalVendor[] =
          approvalHistory.recommendations?.map((rec: any) => ({
            vendorResponseId: rec.vendorResponseId,
            companyName:
              rec.vendorResponse?.companyDetails?.companyName ||
              "Unknown Company",
          })) || [];
        
        const allVendors = vendorResponses.map((vendor: any) => ({
          vendorResponseId: vendor.vendorResponseId,
          companyName: vendor.companydetails?.companyName || "Unknown Company",
          email: vendor.companydetails?.email,
          revisionData: vendor.revisionNumber || {},
        }));
  
        const vendorsWithRevisionStatus: VendorRevisionStatus[] = allVendors.map(
          (vendor: any) => {
            const isInApproval = approvalVendors.some(
              (approvalVendor: ApprovalVendor) =>
                approvalVendor.vendorResponseId === vendor.vendorResponseId
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
          }
        );
  
        return vendorsWithRevisionStatus.filter((v) => v.hasNewRevision);
      } catch (error) {
        console.error("Error checking vendor revisions:", error);
        return [];
      }
    }, [isLoggedIn]);

  // Main data fetching effect
  useEffect(() => {
    if (!rfpId) {
      setError("Invalid RFQ ID");
      setLoading(false);
      return;
    }

    if (authLoading) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch approval data only for logged-in users
        if (isLoggedIn) {
          await fetchApprovalData(rfpId);
        }
        
        // Fetch vendor responses (available to all users)
        const response = await fetch(`/api/buyer-vendor-response?rfpId=${rfpId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const vendorData = await response.json();
        setVendorResponses(vendorData || []);
        
        // Fetch RFP details (available to all users)
        const rfpRes = await fetch(`/api/rfp/${rfpId}`, {
          credentials: 'include',
          cache: 'no-cache'
        });
        if (!rfpRes.ok) throw new Error(`Failed to fetch RFQ details`);
        const rfpBuyerData = await rfpRes.json();
        setBuyerData(rfpBuyerData);

        // Get RFP unique ID from the main RFP data
        setRfpUniqueId(rfpBuyerData.rfp?.rfpuniqId || "");
        
        // Check vendor revisions only for logged-in users
        if (isLoggedIn) {
          const newRevisions = await checkVendorRevisions(rfpId);
          setVendorsWithNewRevisions(newRevisions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rfpId, authLoading, isLoggedIn, fetchApprovalData, checkVendorRevisions]); 

  // Determine user role after approval data is loaded
  // This must run after data fetching is complete
  useEffect(() => {
    if (!loading && !authLoading) {
      determineUserRole();
    }
  }, [loading, authLoading, currentApproval, buyerRecommendations, isLoggedIn, determineUserRole]);

  if (loading || authLoading) {
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