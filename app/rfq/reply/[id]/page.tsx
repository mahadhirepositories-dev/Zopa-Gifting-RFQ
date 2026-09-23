/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VendorReply } from "@/components/vendor_response/vendor_reply";
import { Back } from "@/components/svg";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { AlertCircle, Edit, Lock } from "lucide-react";

type DataType = {
  company?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
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
  evaluationCriteria?: any[];
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
  rfpDates?: {
    startDate?: string;
    endDate?: string;
    queryDate?: string;
    responseDate?: string;
  };
};

export default function VendorReplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rfpId = resolvedParams.id;
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [isloading, setIsloading] = useState<boolean>(false);
  const [vendorResponseId, setVendorResponseId] = useState<string | null>(null);
  const [buyerData, setBuyerData] = useState<DataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rfpUniqueId, setRfpUniqueId] = useState("");
  const [vendorDetails, setVendorDetails] = useState<any>(null);
  const [fromPreview, setFromPreview] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [isRevisionRequested, setIsRevisionRequested] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState<string | null>(null);
  const [organizationVendor, setOrganizationVendor] = useState<any>(null);

  useEffect(() => {
    const from = searchParams.get("from");
    setFromPreview(from === "preview");
  }, [searchParams]);

  const handleBackNavigation = () => {
    if (fromPreview) {
      router.push(`/rfq/preview/${rfpId}?response=${vendorResponseId}`);
    } else {
      router.push(`/rfq/preview/${rfpId}?response=${vendorResponseId}`);
    }
  };

  useEffect(() => {
    async function initializeVendorResponsePage() {
      if (!rfpId) {
        setError("RFQ ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const responseIdFromParams =
          searchParams.get("responseId") || searchParams.get("response");

        const apiUrl = `/api/rfps/${rfpId}`;
        const rfpRes = await fetch(apiUrl, { cache: "no-cache" });
        if (!rfpRes.ok) throw new Error("Failed to fetch RFQ details");
        const fetchedBuyerData = await rfpRes.json();

        setBuyerData(fetchedBuyerData);
        setRfpUniqueId(fetchedBuyerData?.rfpUniqueId || `RFQ-${rfpId.substring(0, 8)}`);

        let responseId = responseIdFromParams;

        try {
          const queryUrl = responseId
            ? `/api/vendor-response?responseId=${responseId}&rfpId=${rfpId}`
            : `/api/vendor-response?rfpId=${rfpId}`;
          const respRes = await fetch(queryUrl);
          if (respRes.ok) {
            const respJson = await respRes.json();
            if (respJson?.data?.vendorResponseId) {
              responseId = respJson.data.vendorResponseId;
            }
            if (respJson?.data?.status === "submitted") {
              setIsSubmitted(false);
            }
            if (respJson?.data?.vendorEmail && fetchedBuyerData?.vendorContacts) {
              const matchedVendor = fetchedBuyerData.vendorContacts.find(
                (contact: any) => contact.email?.toLowerCase() === respJson.data.vendorEmail?.toLowerCase()
              );
              if (matchedVendor) {
                setVendorDetails(matchedVendor);
                setOrganizationVendor(matchedVendor);
              }
            }
          }
        } catch (e) {
          console.warn("Could not load vendor response status:", e);
        }

        if (!responseId) {
          responseId = `VR-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        setVendorResponseId(responseId);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load page data.");
      } finally {
        setLoading(false);
      }
    }

    initializeVendorResponsePage();
  }, [rfpId, searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-semibold text-gray-600">Loading RFQ Reply Page...</p>
      </div>
    );
  }

  if (error || !buyerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <div className="text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-red-600 text-xl mb-4 font-bold">Error Loading RFQ</div>
        <div className="text-gray-700 mb-6 max-w-md">{error || "Could not load RFQ data."}</div>
        <Button onClick={() => router.back()} className="cursor-pointer">
          <Back /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white fixed top-0 left-0 right-0 z-20 w-full border-b border-gray-200 shadow-sm">
        <div className="p-5">
          <div className="flex justify-between items-center">
            <h1 className="text-lg md:text-xl font-bold text-blue-600 truncate pr-4">
              Response:{" "}
              <span className="text-slate-900 font-semibold">
                {buyerData?.requirement?.projectName || `RFQ #${rfpId}`}
              </span>
            </h1>

            <div className="text-base md:text-lg font-bold text-blue-600 truncate">
              RFQ ID: <span className="text-slate-900">{rfpUniqueId}</span>
            </div>
            <div className="shrink-0">
              <Button
                disabled={isloading}
                onClick={handleBackNavigation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Back /> {fromPreview ? "Back to Preview" : "Back to RFQ"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Revision Banner */}
      {isRevisionRequested && revisionMessage && (
        <div className="pt-20 pb-4 bg-blue-50 border-b border-blue-200">
          <div className="p-4 px-4">
            <div className="flex items-start gap-3">
              <Edit className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Revision Requested
                </p>
                <p className="text-sm text-blue-700">{revisionMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="grow pt-20 pb-20">
        <div className="p-4">
          <VendorReply
            rfpId={rfpId}
            vendorResponseId={vendorResponseId}
            buyerData={buyerData}
            vendorId={vendorId}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            vendorDetails={vendorDetails}
            organizationVendor={organizationVendor}
            isloading={isloading}
            setIsloading={setIsloading}
            fromPreview={fromPreview}
          />
        </div>
      </main>

      {/* Fixed Footer */}
      <Footer className="fixed bottom-0 w-full z-10" />
    </div>
  );
}
