/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavigationProvider } from "@/components/navigation-context";
import { Sidebar } from "@/components/rfp-creator/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainContent } from "@/components/rfp-creator/main-content";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getTargetSection,
  type RFPStatus,
  validateSection,
} from "@/lib/utils/rfp-steps";

interface Selection {
  id?: number;
  category?: string;
  subCategory?: string;
  secondaryQuestionId?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  rfpId?: string;
  orgSlug?: string;
}

export default function RFPSectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const resolvedParams = use(params);
  const initialRfpId = resolvedParams.id;
  const initialSection = resolvedParams.section;

  return (
    <RfpCreatorPage
      initialRfpId={initialRfpId}
      initialSection={initialSection}
    />
  );
}

export function RfpCreatorPage({
  initialRfpId,
  initialSection,
  orgSlug,
}: {
  initialRfpId?: string;
  initialSection?: string;
  orgSlug?: string;
}) {
  const router = useRouter();
  const { data: session, isPending: authLoading } = useSession();

  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null,
  );
  const [rfpId] = useState<string | null>(initialRfpId || null);
  const [rfpStatus, setRfpStatus] = useState<RFPStatus | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("company");
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [storedOrgSlug, setStoredOrgSlug] = useState<string | undefined>(
    orgSlug,
  );
  const hasInitializedRef = useRef(false);
  const [formData, setFormData] = useState<any>({
    company: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      businessType: "",
    },
    requirement: {
      projectName: "",
      purpose: "",
    },
    scope: { deliverables: [] },
    boq: [],
    evaluationCriteria: [],
    financials: {
      budgetMin: "",
      budgetMax: "",
      budgetType: "",
      currency: "",
      financialNotes: "",
      paymentTerm: "",
      paymentTerms: "",
      pbg: "",
      pricingModel: "",
      pbgAmount: "",
      pbgNotes: "",
    },
    generalTerms: {
      selectedTerms: [],
      deliveryTimeValue: undefined,
      deliveryTimeUnit: "days",
      deliveryLocations: [],
    },
    specialTerms: {
      generalTerms: "",
    },
    documentsToShare: {
      documentsToShare: [],
    },
    contact: {
      contactName: "",
      contactTitle: "",
      contactAddressLine1: "",
      contactAddressLine2: "",
      contactCity: "",
      contactState: "",
      contactPostalCode: "",
      contactCountry: "",
      contactDepartment: "",
      contactEmail: "",
      contactPhone: "",
      contactPhoneCountry: "+1",
      logodata: null,
      logoPath: null,
      logoMimeType: null,
      logoUrl: null,
    },
    vendors: {
      selectionMethod: "",
      vendorRequirements: [],
      vendorSelectionProcess: "",
      additionalRequirements: "",
    },
    vendorContacts: [],
    rfpDates: {
      startDate: "",
      endDate: "",
    },
    organizationName: "",
    logo: null,
  });

  const isLoggedIn = useMemo(() => {
    return !authLoading && !!session?.user;
  }, [authLoading, session?.user]);

  const role = useMemo(() => {
    return (session?.user as any)?.role || null;
  }, [session?.user]);

  useEffect(() => {
    async function fetchOrgSlug() {
      if (!(session?.session as any)?.activeOrganizationId || storedOrgSlug)
        return;

      try {
        const response = await fetch(
          `/api/organizations/${(session?.session as any).activeOrganizationId}`,
        );
        if (response.ok) {
          const orgData = await response.json();
          if (orgData?.slug) {
            setStoredOrgSlug(orgData.slug);
          }
        }
      } catch (error) {
        console.error("Error fetching organization slug:", error);
      }
    }

    if (isLoggedIn && !authLoading) {
      fetchOrgSlug();
    }
  }, [session?.session, isLoggedIn, authLoading, storedOrgSlug]);

  const extractSectionFromURL = useCallback(() => {
    if (typeof window === "undefined") return initialSection || "company";

    const pathParts = window.location.pathname.split("/");
    const urlSection = pathParts[pathParts.length - 1];

    if (validateSection(urlSection)) {
      return urlSection;
    }

    return initialSection || "company";
  }, [initialSection]);

  const updateURL = useCallback(
    (section: string) => {
      if (!rfpId || typeof window === "undefined") return;

      const newPath = `/rfp/${rfpId}/${section}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, "", newPath);
      }
    },
    [rfpId],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const urlSection = extractSectionFromURL();
      setCurrentSection(urlSection);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [extractSectionFromURL]);

  // Adjusting state during render (React's recommended pattern for syncing
  // state to a prop): when `initialSection` changes — e.g. Next.js gives us
  // a new route param — resync `currentSection` from the URL right now,
  // during this render, instead of in a useEffect. React detects the
  // setState call during render, discards the in-progress render, and
  // re-renders immediately with the corrected value before anything
  // commits to the screen. This replaces the old
  // useEffect(() => { if (urlSection !== currentSection) setCurrentSection(urlSection) }, [extractSectionFromURL, currentSection])
  // which caused an extra commit + effect + re-render cascade on every
  // section change.
  const [prevInitialSection, setPrevInitialSection] = useState(initialSection);
  if (initialSection !== prevInitialSection) {
    setPrevInitialSection(initialSection);
    setCurrentSection(extractSectionFromURL());
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      if (hasInitializedRef.current) return;
      setIsLoading(true);
      setAccessDenied(false);

      try {
        if (!rfpId) {
          const targetSection = getTargetSection({
            isLoggedIn,
            rfpStatus: null,
            requestedSection: initialSection,
          });

          if (isMounted) {
            setCurrentSection(targetSection);
            setIsLoading(false);
            hasInitializedRef.current = true;
          }
          return;
        }

        if (isLoggedIn) {
          const accessResponse = await fetch(
            `/api/rfps/${rfpId}/check-access`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (accessResponse.status === 403) {
            router.push("/login");
            return;
          }

          if (!accessResponse.ok) {
            console.warn("Check access check skipped for session");
          }
        }

        const response = await fetch(`/api/rfps/${rfpId}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const rfpData = await response.json();

          const status: RFPStatus = {
            isSubmitted:
              rfpData.rfpsData?.status === "Submitted" ||
              rfpData.rfpsData?.status === "revision_requested",
            exists: true,
            isNew: rfpData.rfpsData?.isNew ?? false,
          };

          if (!isMounted) return;

          hasInitializedRef.current = true;
          setRfpStatus(status);
          setFormData((prev: any) => ({ ...prev, ...rfpData }));
          if (rfpData.organization?.slug && !storedOrgSlug) {
            setStoredOrgSlug(rfpData.organization.slug);
          }

          const urlSection = extractSectionFromURL();
          const targetSection = getTargetSection({
            isLoggedIn,
            rfpStatus: status,
            requestedSection: urlSection,
          });

          setCurrentSection(targetSection);
          if (urlSection !== targetSection) {
            updateURL(targetSection);
          }
        } else {
          // If API isn't active yet, proceed gracefully
          if (isMounted) {
            hasInitializedRef.current = true;
            setCurrentSection(initialSection || "company");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!authLoading) {
      initializeApp();
    }

    return () => {
      isMounted = false;
    };
  }, [
    rfpId,
    initialSection,
    isLoggedIn,
    authLoading,
    router,
    updateURL,
    extractSectionFromURL,
    storedOrgSlug,
  ]);

  const handleInputChange = useCallback((section: string, data: any) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [section]: data,
    }));
  }, []);

  const handleSectionChange = useCallback(
    (section: string) => {
      setCurrentSection(section);
      updateURL(section);
    },
    [updateURL],
  );

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this RFP.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600">Loading RFP...</span>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider
      rfpId={rfpId || undefined}
      initialSection={currentSection}
      initialIsSubmitted={rfpStatus?.isSubmitted}
      onSectionChange={handleSectionChange}
      isLoggedIn={isLoggedIn}
    >
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar
            isSubmitted={rfpStatus?.isSubmitted}
            isLoggedIn={isLoggedIn}
          />

          <div className="flex-1 min-w-0 overflow-hidden">
            <MainContent
              selection={selection}
              setSelection={setSelection}
              formData={formData}
              handleInputChange={handleInputChange}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              rfpId={rfpId || ""}
              setFormData={setFormData}
              isSubmitted={rfpStatus?.isSubmitted || false}
              isLoggedIn={isLoggedIn}
              orgSlug={storedOrgSlug}
              role={role}
            />
          </div>
        </div>
      </SidebarProvider>
    </NavigationProvider>
  );
}
