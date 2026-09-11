/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { TermsAndCondition, TermsAndConditionsPopup } from "./terms_condition";
// REMOVED: CCEmailOverride import
import { toast } from "react-toastify";
import { generateRfpId } from "@/lib/rfpIdGenerator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Users,
  MessageCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { WhatsAppShareModal } from "./whatsapp-share";

interface ApiResponse {
  success: boolean;
  message: string;
  rfpId?: string;
  data?: any;
  error?: string;
}

interface VendorContact {
  id?: number;
  name: string;
  email: string;
  mobileNo: string;
  countryCode?: string;
  companyName?: string;
  isNew?: boolean;
  emailSent?: boolean;
  email_sent?: boolean;
  isFromMaster?: boolean;
  masterVendorId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
}

const updateRfpStatus = async (
  rfpId: string,
  rfpData: any,
  categorySelections: any,
  rfpUniqueId: string,
): Promise<ApiResponse> => {
  try {
    if (!rfpId) {
      throw new Error("RFQ ID is missing");
    }
    const vendorContactsWithStatus = (
      rfpData.vendorContacts ||
      rfpData.vendorcontacts ||
      []
    ).map((vc: VendorContact) => ({
      ...vc,
      isNew: vc.isNew || false,
    }));

    const dataToSave = {
      ...rfpData,
      vendorContacts: vendorContactsWithStatus,
      status: "Submitted",
      submissionDate: new Date().toISOString(),
      rfpUniqueId,
      isNew: false,
    };

    const apiUrl = `/api/rfps/${rfpId}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dataToSave,
        rfpId,
        categorySelection: categorySelections,
        rfpUniqueId,
      }),
    });
    const text = await response.text();
    if (!text) {
      throw new Error("Empty response received from server");
    }

    try {
      const jsonData = JSON.parse(text);
      if (!response.ok) {
        throw new Error(
          jsonData.error || jsonData.message || "Failed to update RFQ data",
        );
      }
      return {
        success: true,
        message: "RFQ updated successfully",
        rfpId: jsonData.rfpId,
        data: jsonData.data,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response from server");
    }
  } catch (error: any) {
    console.error("Error updating RFQ data:", error);
    return {
      success: false,
      message: error.message || "Failed to update RFQ data",
      error: error.toString(),
    };
  }
};

interface PreviewProps {
  data: any;
  isSubmitting: boolean;
  formData: any;
  categorySelections: any;
  activeSection: string;
  handleClick: any;
  navigateTo: (section: string) => void;
  rfpId?: string;
  disabled?: boolean;
  onChange?: (updatedData: any) => void;
  isLoggedIn: boolean | undefined;
}

export const Preview: React.FC<PreviewProps> = ({
  data,
  isSubmitting,
  handleClick,
  activeSection,
  navigateTo,
  rfpId,
  categorySelections,
  disabled,
  onChange,
  isLoggedIn,
}) => {
  const route = useRouter();
  const [selectedEmailAddresses, setSelectedEmailAddresses] = useState<
    string[]
  >([]);
  const [, setEmailError] = useState("");
  const [, setLogoBase64] = useState<string | null>(null);
  const [incompleteSections, setIncompleteSections] = useState<string[]>([]);
  const [formComplete, setFormComplete] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsData, setTermsData] = useState<TermsAndCondition[]>([]);
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [vendorResponseID, setVendorResponseID] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [rfpUniqueId, setRfpUniqueId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const safeDataRef = useRef<any>(null);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);
  const { data: session } = useSession();

  const organizationId = (session?.session as any)?.activeOrganizationId;

  const prepareLogoForPdf = useCallback((logoFile: File | undefined) => {
    return new Promise<string | null>((resolve) => {
      if (!logoFile) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });
  }, []);

  useEffect(() => {
    if (rfpId) {
      setRfpUniqueId(generateRfpId(rfpId as string));
    }
  }, [rfpId]);

  useEffect(() => {
    if (data.contact?.logo) {
      prepareLogoForPdf(data.contact.logo).then((base64Logo) => {
        setLogoBase64(base64Logo);
      });
    }
    if (data?.vendorContacts && data?.vendorContacts?.length > 0) {
      const emails = data?.vendorContacts.map((contact: any) => contact?.email);
      setSelectedEmailAddresses(emails);
    }
  }, [data?.contact?.logo, data?.vendorContacts, prepareLogoForPdf]);

  // Load terms on component mount
  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      const defaultTerms: TermsAndCondition[] = [
        {
          id: 1,
          title: "1. Acceptance of Terms",
          text: "By submitting quotes or participating in this Request for Quotation (RFQ), vendors agree to abide by all terms and conditions specified herein.",
          createdAt: null,
          updatedAt: null,
        },
        {
          id: 2,
          title: "2. Confidentiality",
          text: "All information provided in this RFQ document is confidential and proprietary to ZOPA. Vendors shall not disclose RFQ details to third parties without prior written approval.",
          createdAt: null,
          updatedAt: null,
        },
        {
          id: 3,
          title: "3. Submission & Validity",
          text: "Quotations must be submitted before the specified RFQ End Date. Quotations shall remain firm and valid for the evaluation period.",
          createdAt: null,
          updatedAt: null,
        },
        {
          id: 4,
          title: "4. Award of Contract",
          text: "ZOPA reserves the right to accept or reject any quotation, and to annul the RFQ process at any time without incurring liability to affected vendors.",
          createdAt: null,
          updatedAt: null,
        },
      ];

      try {
        setTermsLoading(true);
        const response = await fetch("/api/terms-and-conditions-frontend");

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.data) {
            setTermsData(data[0].data);
            setTermsError(null);
            return;
          }
        }
        setTermsData(defaultTerms);
        setTermsError(null);
      } catch (err) {
        console.warn("Using default terms & conditions:", err);
        setTermsData(defaultTerms);
        setTermsError(null);
      } finally {
        setTermsLoading(false);
      }
    };

    fetchTermsAndConditions();
  }, []);

  // AUTOMATIC CC LOGIC: Fetch directly from server, no user override
  const getFinalCCEmails = async (): Promise<string[]> => {
    if (!organizationId) {
      console.warn("Cannot fetch CC settings: Missing Organization ID");
      return [];
    }

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/cc-settings`,
      );

      if (!response.ok) return [];

      const data = await response.json();

      // Strict Check: Only return emails if explicitly enabled in Admin Panel
      if (data.ccEnabled && Array.isArray(data.ccEmails)) {
        return data.ccEmails;
      }

      return [];
    } catch (error) {
      console.error("Error fetching org CC emails:", error);
      return [];
    }
  };

  const safeData = {
    company: data?.company || {},
    requirement: data?.requirement || {},
    scopeOfWork: data?.scope?.deliverables || [],
    boq: data?.boq || [],
    evaluationCriteria:
      (Array.isArray(data?.evaluation) && data.evaluation.length > 0
        ? data.evaluation
        : Array.isArray(data?.evaluationCriteria) && data.evaluationCriteria.length > 0
          ? data.evaluationCriteria
          : data?.evaluation || data?.evaluationCriteria || []),
    financials: data?.financials || {},
    generalTerms:
      data?.generalTerms?.generalTerms || data?.generalTerms?.selectedTerms,
    specialTerms: data?.specialTerms?.specialTerms || "",
    documents:
      data?.documentsToShare?.documentsToShare ||
      (typeof data?.documentsToShare === "string"
        ? data.documentsToShare
        : null) ||
      data?.documents ||
      [],
    contact: data?.contact || {},
    vendors: data?.vendors || {},
    vendorContacts: data?.vendorContacts || [],
    rfpDates: data?.rfpDates || {},
    logo: data?.contact?.logo || null,
  };

  // Writing a ref during render is a React correctness violation — under
  // concurrent rendering a discarded render can leave the ref holding data
  // that was never committed. safeDataRef is only read from event handlers
  // (getIncompleteSections), so syncing it after commit is equivalent and safe.
  useEffect(() => {
    safeDataRef.current = safeData;
  });

  const validateEmail = useCallback((email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }, []);

  const handleSendClick = useCallback(async () => {
    if (!rfpId) {
      toast.error("RFQ ID is missing. Please save your RFQ first.");
      return;
    }

    if (!formComplete) {
      toast.error("Please fill in all required sections before submitting.");
      return;
    }

    if (!termsAccepted) {
      setAcceptanceError("Please accept the terms and conditions");
      return;
    }

    if (selectedEmailAddresses?.length === 0) {
      setEmailError("At least one email address is required");
      return;
    }
    for (const email of selectedEmailAddresses) {
      if (!validateEmail(email)) {
        setEmailError("Please ensure all email addresses are valid");
        return;
      }
    }

    // 1. Fetch CC Emails (Server Controlled)
    const ccEmails = await getFinalCCEmails();

    setEmailError("");
    setSubmissionStatus("submitting");

    try {
      // Filter only vendors that haven't had emails sent yet
      const vendorsToEmail = selectedEmailAddresses.filter((email) => {
        const contact = data.vendorContacts.find(
          (vc: VendorContact) => vc.email === email,
        );
        return !contact?.emailSent && !contact?.email_sent;
      });

      if (vendorsToEmail?.length === 0 && selectedEmailAddresses?.length > 0) {
        // If all vendors have already received emails, offer to update RFP data only
        const shouldUpdateOnly = window.confirm(
          "All selected vendors have already received the RFQ. Would you like to update the RFP data (including dates) without sending new emails? This will extend the deadline for existing vendors.",
        );

        if (!shouldUpdateOnly) {
          toast.info("All selected vendors have already received the RFQ");
          setSubmissionStatus("idle");
          return;
        }

        // Proceed with data update only (no emails will be sent)
        toast.info("Updating RFP data without sending new emails...");
      }

      // Prepare RFP data
      const contactData = {
        ...data.contact,
        logoData: data.contact?.logoData || null,
        logoMimeType: data.contact?.logoMimeType || null,
      };

      const completeRfpData = {
        ...data,
        contact: contactData,
        sendTo: selectedEmailAddresses,
        sendMethod: "email",
        submissionDate: new Date().toLocaleDateString("en-CA"),
        status: "Submitted",
        rfpId: rfpId,
        rfpName: data?.requirement?.projectName,
        contactName: data?.contact?.contactName,
        buyerEmail: data?.contact?.contactEmail,
      };

      // Update RFP status
      const updateResponse = await updateRfpStatus(
        rfpId,
        completeRfpData,
        categorySelections,
        rfpUniqueId,
      );

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || "Failed to update RFQ");
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://staging-rfp.zopapro.com";

      // Only process vendors if there are vendors to email
      let vendorProcessingPromises: Promise<any>[] = [];

      if (vendorsToEmail.length > 0) {
        vendorProcessingPromises = vendorsToEmail.map(async (email) => {
          try {
            let vendorId;
            let vendorData;
            let isFromMaster = false;
            let masterVendorId = null;
            const contact = data.vendorContacts.find(
              (vc: VendorContact) => vc.email === email,
            );

            if (!contact) {
              throw new Error(`Contact not found for email: ${email}`);
            }

            const vendorRes = await fetch(
              `/api/vendors?email=${encodeURIComponent(email)}`,
            );

            if (vendorRes.ok) {
              vendorData = await vendorRes.json();
              vendorId = vendorData.id;

              isFromMaster = contact?.isFromMaster || false;
              masterVendorId = contact?.masterVendorId || null;
            } else if (vendorRes.status === 404) {
              const createRes = await fetch("/api/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: contact.name || email.split("@")[0],
                  email: email,
                  companyName: contact.companyName || "Unknown",
                  mobileNo: contact.mobileNo || "",
                }),
              });

              if (!createRes.ok) {
                const err = await createRes.json();
                throw new Error(err?.error || "Failed to create vendor");
              }

              vendorData = await createRes.json();
              vendorId = vendorData.id;
            } else {
              const errText = await vendorRes.text();
              throw new Error(`Error checking vendor for ${email}: ${errText}`);
            }

            // Step 2: Create vendor response
            const responseRes = await fetch("/api/vendor-response", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rfpId,
                vendorId,
                vendorEmail: email,
                status: "draft",
                isFromMaster,
                masterVendorId,
              }),
            });

            if (!responseRes.ok) {
              const err = await responseRes.json();
              throw new Error(err?.error || "Failed to create vendor response");
            }

            const { vendorResponseId } = await responseRes.json();
            setVendorResponseID(vendorResponseId);

            // Step 3: Send RFP email to vendor
            const vendorUrl = `${baseUrl}/rfp/preview/${rfpId}?response=${vendorResponseId}`;

            const emailRes = await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "rfp-magic-link",
                data: {
                  email,
                  url: vendorUrl,
                  rfpName: data?.requirement?.projectName,
                  contactName: data?.contact?.contactName,
                  companyName: data?.company?.name,
                  expiredata: data.rfpDates?.endDate,
                  rfpId,
                  vendorResponseId,
                  buyerEmail: data?.contact?.contactEmail,
                },
              }),
            });

            if (!emailRes.ok) {
              const err = await emailRes.json();
              throw new Error(err?.error || "Failed to send RFP email");
            }

            // Step 4: Update email sent status
            await fetch("/api/update-vendor-email-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                rfpId,
                emailSent: true,
              }),
            });

            // Update local state
            const updatedContacts = data.vendorContacts.map(
              (vc: VendorContact) =>
                vc.email === email ? { ...vc, emailSent: true } : vc,
            );

            if (onChange) {
              onChange({ ...data, vendorContacts: updatedContacts });
            }

            return { email, success: true };
          } catch (error) {
            console.error(`Error processing vendor ${email}:`, error);
            return { email, success: false, error: (error as Error).message };
          }
        });
      } // End of if (vendorsToEmail.length > 0)

      // Send buyer thank-you email (should always be sent on successful submission)
      // let buyerThankYouPromise: Promise<any> | null = null;
      // const vendorsForEmail = vendorsToEmail.length > 0
      //   ? selectedEmailAddresses.map((email) => {
      //       const contact = data.vendorContacts.find(
      //         (vc: VendorContact) => vc.email === email
      //       );
      //       return {
      //         email,
      //         companyName: contact?.companyName || "Unknown Company",
      //       };
      //     })
      //   : data.vendorContacts.map((vc: VendorContact) => ({
      //       email: vc.email,
      //       companyName: vc.companyName || "Unknown Company",
      //     }));

      // buyerThankYouPromise = fetch("/api/email", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     type: "buyer-thank-you",
      //     data: {
      //       companyName: "ZOPA",
      //       projectName: data?.requirement?.projectName,
      //       vendors: vendorsForEmail,
      //       buyerEmail: data?.contact?.contactEmail,
      //       url: `${baseUrl}/rfp/${rfpId}`,
      //     },
      //   }),
      // });
      // const allPromises = [...vendorProcessingPromises];
      // allPromises.push(buyerThankYouPromise.then((res) => ({
      //   type: "buyer",
      //   success: res.ok,
      // })));

      // const results = await Promise.all(allPromises);
      // const failedVendors = results
      //   .filter((result) => !("type" in result) && !result.success)
      //   .map((result) => (result as any).email);

      // const buyerEmailResult = results.find(
      //   (result) => "type" in result && result.type === "buyer"
      // );

      // if (!buyerEmailResult?.success) {
      //   console.error("Failed to send buyer thank-you email");
      //   toast.warning("RFP submitted successfully, but confirmation email failed to send");
      // }

      // if (failedVendors.length > 0) {
      //   throw new Error(
      //     `Failed to process ${failedVendors.length} vendors: ${failedVendors.join(", ")}`
      //   );
      // }

      // NEW: Send CC emails automatically if Admin Configured
      // We use the 'ccEmails' variable we fetched at the start of the function
      if (ccEmails.length > 0 && vendorsToEmail.length > 0) {
        try {
          await fetch("/api/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "rfp-cc-notification",
              data: {
                ccEmails,
                rfpName: data?.requirement?.projectName,
                companyName: data?.company?.name,
                contactName: data?.contact?.contactName,
                expiredata: data.rfpDates?.endDate,
                rfpId,
                buyerEmail: data?.contact?.contactEmail,
                vendors: vendorsToEmail.map((email) => {
                  const contact = data.vendorContacts.find(
                    (vc: VendorContact) => vc.email === email,
                  );
                  return {
                    email,
                    companyName: contact?.companyName || "Unknown Company",
                  };
                }),
              },
            }),
          });
        } catch (ccError) {
          console.error("Failed to send CC emails:", ccError);
          // Don't fail the entire submission if CC emails fail
          toast.warning("RFP sent successfully, but CC notifications failed");
        }
      }

      setSubmissionStatus("success");

      if (vendorsToEmail.length > 0) {
        toast.success("RFQ submitted and emails sent successfully!");
      } else {
        toast.success(
          "RFQ data updated successfully! Existing vendors can continue using their original links with the new deadline.",
        );
      }

      setTimeout(() => {
        route.push(`/rfp/confirmation/${rfpId}`);
      }, 2000);
    } catch (error: any) {
      setSubmissionStatus("error");
      setErrorMessage(error.message || "Failed to submit RFQ");
      toast.error(error.message || "Failed to submit RFQ");
    }
  }, [
    formComplete,
    selectedEmailAddresses,
    validateEmail,
    rfpId,
    termsAccepted,
    data,
    categorySelections,
    rfpUniqueId,
    onChange,
    organizationId,
  ]);

  const loggedIn = Boolean(
    isLoggedIn || session?.user || session?.user?.email,
  );

  interface SectionStatus {
    name: string;
    id: string;
    isComplete: boolean;
  }

  const getIncompleteSections = useCallback((): SectionStatus[] => {
    const sData = {
      company: data?.company || safeDataRef.current?.company || {},
      requirement: data?.requirement || safeDataRef.current?.requirement || {},
      scopeOfWork: data?.scope?.deliverables || data?.scope || safeDataRef.current?.scopeOfWork || [],
      boq: data?.boq || safeDataRef.current?.boq || [],
      evaluationCriteria:
        (Array.isArray(data?.evaluation) && data.evaluation.length > 0
          ? data.evaluation
          : Array.isArray(data?.evaluationCriteria) && data.evaluationCriteria.length > 0
            ? data.evaluationCriteria
            : (Array.isArray(safeDataRef.current?.evaluationCriteria) && safeDataRef.current.evaluationCriteria.length > 0
                ? safeDataRef.current.evaluationCriteria
                : data?.evaluation || data?.evaluationCriteria || safeDataRef.current?.evaluationCriteria || [])),
      financials: data?.financials || safeDataRef.current?.financials || {},
      generalTerms:
        data?.generalTerms?.selectedTerms || data?.generalTerms || safeDataRef.current?.generalTerms || [],
      specialTerms: data?.specialTerms || safeDataRef.current?.specialTerms,
      documents: data?.documentsToShare || data?.documents || safeDataRef.current?.documents || [],
      contact: data?.contact || safeDataRef.current?.contact || {},
      vendors: data?.vendors || safeDataRef.current?.vendors || {},
      vendorContacts: data?.vendorContacts || data?.vendorcontacts || safeDataRef.current?.vendorContacts || [],
      rfpDates: data?.rfpDates || data?.dates || safeDataRef.current?.rfpDates || {},
    };

    const sections: SectionStatus[] = [];

    if (!loggedIn) {
      sections.push({
        name: "1. COMPANY INTRODUCTION",
        id: "company",
        isComplete: Boolean(sData.company?.name || sData.company?.companyName),
      });
    }

    sections.push(
      {
        name: "2. ABOUT THE REQUIREMENT",
        id: "requirement",
        isComplete: Boolean(sData.requirement?.projectName || sData.requirement?.purpose),
      },
      {
        name: "3. SCOPE OF WORK",
        id: "scope",
        isComplete:
          (Array.isArray(sData.scopeOfWork) && sData.scopeOfWork.length > 0) ||
          (typeof sData.scopeOfWork === "object" && sData.scopeOfWork?.deliverables?.length > 0) ||
          (typeof sData.scopeOfWork === "string" && sData.scopeOfWork.length > 0),
      },
      {
        name: "4. BOQ/BOM",
        id: "boq",
        isComplete: Array.isArray(sData.boq) && sData.boq.length > 0,
      },
      {
        name: "5. EVALUATION CRITERIA",
        id: "evaluation",
        isComplete: (() => {
          const evalList =
            (Array.isArray(sData.evaluationCriteria) && sData.evaluationCriteria.length > 0
              ? sData.evaluationCriteria
              : Array.isArray(data?.evaluation) && data.evaluation.length > 0
                ? data.evaluation
                : Array.isArray(data?.evaluationCriteria) && data.evaluationCriteria.length > 0
                  ? data.evaluationCriteria
                  : []);
          return evalList.length > 0;
        })(),
      },
      {
        name: "6. FINANCIALS",
        id: "financials",
        isComplete: Boolean(
          sData.financials &&
            (sData.financials.budgetType ||
              sData.financials.priceModel ||
              sData.financials.currency ||
              sData.financials.paymentTerm ||
              (Array.isArray(sData.financials.paymentMilestones) && sData.financials.paymentMilestones.length > 0)),
        ),
      },
      {
        name: "7. GENERAL TERMS & CONDITIONS",
        id: "generalTerms",
        isComplete: Boolean(
          sData.generalTerms &&
            (sData.generalTerms.selectedTerms?.length > 0 ||
              (Array.isArray(sData.generalTerms) && sData.generalTerms.length > 0) ||
              sData.generalTerms.deliveryTimeValue),
        ),
      },
      {
        name: "8. SPECIAL TERMS & CONDITIONS",
        id: "specialTerms",
        isComplete: true,
      },
      {
        name: "9. DOCUMENTS TO SHARE",
        id: "documents",
        isComplete: (() => {
          const checkDocs = (docData: any): boolean => {
            if (!docData) return false;
            let raw = docData;
            if (typeof raw === "object" && !Array.isArray(raw) && raw !== null) {
              if (raw.documentsToShare !== undefined) raw = raw.documentsToShare;
              else if (raw.documents !== undefined) raw = raw.documents;
            }
            if (typeof raw === "string") {
              const trimmed = raw.trim();
              if (!trimmed || trimmed === "[]" || trimmed === "{}" || trimmed === "null") return false;
              try {
                const parsed = JSON.parse(trimmed);
                return checkDocs(parsed);
              } catch {
                return true;
              }
            }
            if (Array.isArray(raw)) {
              return raw.length > 0;
            }
            return Boolean(raw);
          };
          return checkDocs(sData.documents);
        })(),
      },
      {
        name: "10. ADD VENDORS",
        id: "vendorcontacts",
        isComplete: Array.isArray(sData.vendorContacts) && sData.vendorContacts.length > 0,
      },
      {
        name: "11. RFQ START AND END DATE",
        id: "dates",
        isComplete: Boolean(sData.rfpDates && (sData.rfpDates.startDate || sData.rfpDates.endDate)),
      },
    );

    return sections.filter((s) => !s.isComplete);
  }, [data, loggedIn]);

  useEffect(() => {
    const incomplete = getIncompleteSections();
    setIncompleteSections(incomplete.map((s) => s.name));
    setFormComplete(incomplete.length === 0);
  }, [getIncompleteSections]);

  const handleResendEmail = async (email: string) => {
    if (!rfpId) return;
    try {
      setResendingEmail(email);
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://staging-rfp.zopapro.com";

      const contact = data.vendorContacts.find(
        (vc: VendorContact) => vc.email === email,
      );
      if (!contact) throw new Error("Contact not found");

      const vendorRes = await fetch(
        `/api/vendors?email=${encodeURIComponent(email)}`,
      );
      let vendorId;
      let isFromMaster = false;
      let masterVendorId = null;

      if (vendorRes.ok) {
        const vendorData = await vendorRes.json();
        vendorId = vendorData.id;
        isFromMaster = Boolean(contact.isFromMaster || vendorData.isFromMaster);
        masterVendorId =
          vendorData.masterVendorId || contact.masterVendorId || null;
      } else {
        const newVendorRes = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contact.companyName || contact.name,
            email: email,
            phone: contact.mobileNo || "",
            companyName: contact.companyName || "NA",
            contactName: contact.name,
            role: "vendor",
          }),
        });
        if (!newVendorRes.ok) throw new Error("Failed to create vendor");
        const newVendor = await newVendorRes.json();
        vendorId = newVendor.id;
      }

      const responseRes = await fetch("/api/vendor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfpId,
          vendorId,
          vendorEmail: email,
          status: "draft",
          isFromMaster,
          masterVendorId,
        }),
      });

      if (!responseRes.ok) {
        const err = await responseRes.json();
        throw new Error(err?.error || "Failed to create vendor response");
      }

      const { vendorResponseId } = await responseRes.json();

      const vendorUrl = `${baseUrl}/rfp/preview/${rfpId}?response=${vendorResponseId}`;
      const emailRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rfp-magic-link",
          data: {
            email,
            url: vendorUrl,
            rfpName: data?.requirement?.projectName,
            contactName: data?.contact?.contactName,
            companyName: data?.company?.name,
            expiredata: data.rfpDates?.endDate,
            rfpId,
            vendorResponseId,
            buyerEmail: data?.contact?.contactEmail,
          },
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.json();
        throw new Error(err?.error || "Failed to send RFP email");
      }

      toast.success(`Email resent successfully to ${email}`);
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error(error.message || "Failed to resend email");
    } finally {
      setResendingEmail(null);
    }
  };

  const handleEmailCheckboxChange = (email: string, checked: boolean) => {
    const contact = data.vendorContacts.find(
      (vc: VendorContact) => vc.email === email,
    );

    if (contact?.emailSent) {
      toast.warning("This vendor has already received the RFQ");
      return;
    }

    if (checked) {
      if (!selectedEmailAddresses.includes(email)) {
        setSelectedEmailAddresses([...selectedEmailAddresses, email]);
      }
    } else {
      setSelectedEmailAddresses(
        selectedEmailAddresses.filter((e) => e !== email),
      );
    }
  };

  const navigateToVendorContacts = () => {
    navigateTo("vendorcontacts");
  };

  const currentIncompleteSections = getIncompleteSections();

  return (
    <div className="space-y-6">
      <p className="text-xs font-mono text-gray-500 mb-6">
        Review your RFQ before submitting it. You can download a PDF copy, send it via email.
      </p>

      {!rfpId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>RFQ ID Missing!</AlertTitle>
          <AlertDescription>
            Please save your RFQ first before attempting to submit.
          </AlertDescription>
        </Alert>
      )}

      {currentIncompleteSections.length > 0 && (
        <div className="bg-[#FFF5F5] border border-red-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <h4 className="text-xs font-bold font-mono tracking-tight text-red-600 uppercase">
              Incomplete Sections!
            </h4>
          </div>
          <p className="text-xs font-mono text-red-600">
            The following sections are incomplete. Please provide the required information.
          </p>
          <div className="flex gap-2.5 flex-wrap pt-1">
            {currentIncompleteSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => navigateTo(sec.id)}
                className="border border-red-500 hover:bg-red-100 text-red-600 rounded-lg font-mono text-[11px] font-semibold px-3 py-1.5 uppercase transition-colors"
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Recipients</h3>
        </div>
        <p className="text-xs font-mono text-gray-500">
          Select vendor contacts to receive the RFQ or add new email addresses.
        </p>

        {safeData.vendorContacts && safeData.vendorContacts.length > 0 ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="bg-[#1E6BFF] text-white font-semibold text-xs px-3.5 py-1 rounded-full">
                Vendor Contacts
              </span>
            </div>

             <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
              <table className="w-full text-xs font-mono">
                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600">
                  <tr>
                    <th className="p-3 text-left w-12">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Company</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Mobile</th>
                    <th className="p-3 text-center w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {safeData.vendorContacts.map((contact: any, index: number) => (
                    <tr
                      key={contact.email || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-3">
                        <Checkbox
                          id={`contact-table-${index}`}
                          checked={selectedEmailAddresses.includes(contact.email)}
                          onCheckedChange={(checked) =>
                            handleEmailCheckboxChange(contact.email, checked as boolean)
                          }
                          disabled={(disabled && !contact.isNew) || contact.email_sent}
                          className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-[#1E6BFF]"
                        />
                      </td>
                      <td className="p-3 font-sans font-medium text-slate-900">
                        {contact.name}
                      </td>
                      <td className="p-3 text-slate-800">{contact.companyName}</td>
                      <td className="p-3 text-slate-600">{contact.email}</td>
                      <td className="p-3 text-slate-500">{contact.mobileNo || "-"}</td>
                      <td className="p-3 text-center">
                        {contact.email_sent || contact.emailSent ? (
                          <div className="flex flex-col items-center gap-1.5 py-0.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                              Email Sent
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[11px] px-2 font-mono"
                              disabled={resendingEmail === contact.email}
                              onClick={() => handleResendEmail(contact.email)}
                            >
                              {resendingEmail === contact.email ? "Sending..." : "Resend"}
                            </Button>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={navigateToVendorContacts}
                className="text-xs font-mono font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                ADD VENDOR CONTACTS
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl p-6 text-center space-y-3 bg-white">
            <div className="flex justify-center">
              <span className="bg-[#1E6BFF] text-white font-semibold text-xs px-3.5 py-1 rounded-full">
                Vendor Contacts
              </span>
            </div>
            <p className="text-xs font-mono text-gray-500">No vendor contacts found.</p>
            <div>
              <button
                type="button"
                onClick={navigateToVendorContacts}
                className="text-xs font-mono font-semibold text-[#1E6BFF] hover:underline flex items-center gap-1.5 mx-auto"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                ADD VENDOR CONTACTS
              </button>
            </div>
          </div>
        )}
      </div>

      {submissionStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {submissionStatus === "success" && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your RFQ has been successfully submitted.
          </AlertDescription>
        </Alert>
      )}

      {/* Terms Acceptance Checkbox */}
      <div className="pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms-acceptance"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setTermsAccepted(checked as boolean);
              setAcceptanceError(null);
            }}
            className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-[#1E6BFF]"
          />
          <label htmlFor="terms-acceptance" className="text-xs font-normal text-slate-800 cursor-pointer">
            I accept the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
              className="text-[#1E6BFF] hover:underline font-medium"
            >
              Terms and Conditions
            </button>
          </label>
        </div>
        {acceptanceError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-500 text-xs">{acceptanceError}</p>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigateTo("dates")}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs uppercase px-5 h-10 rounded-lg border-none"
        >
          PREVIOUS
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => setShowWhatsAppModal(true)}
            disabled={
              !rfpId || !safeData.vendorContacts || safeData.vendorContacts.length === 0
            }
            variant="outline"
            className="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold text-xs uppercase px-4 h-10 rounded-lg flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            SHARE VIA WHATSAPP
          </Button>

          <Button
            type="button"
            onClick={handleSendClick}
            disabled={isSubmitting || submissionStatus === "submitting" || !rfpId}
            className="bg-[#1D61E7] hover:bg-blue-700 text-white font-bold text-xs uppercase px-6 h-10 rounded-lg shadow-2xs flex items-center gap-2"
          >
            {submissionStatus === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SENDING...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                SEND RFQ
              </>
            )}
          </Button>
        </div>
      </div>

      <TermsAndConditionsPopup
        show={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        termsData={termsData}
        loading={termsLoading}
        error={termsError}
      />

      <WhatsAppShareModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        vendors={safeData.vendorContacts || []}
        rfpId={rfpId || ""}
        rfpName={data?.requirement?.projectName || "RFQ"}
        companyName={data?.company?.name || data?.contact?.companyName || ""}
        endDate={data?.rfpDates?.endDate || ""}
        onSuccess={() => {
          if (onChange) {
            onChange({ ...data });
          }
        }}
      />
    </div>
  );
};
