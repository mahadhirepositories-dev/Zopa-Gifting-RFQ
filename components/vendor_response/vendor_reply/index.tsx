/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  VendorReplyFormData,
  VendorReplyProps,
} from "@/lib/types/vendor-reply";
import { HeaderSection } from "./header-section";
import { BuyerSection } from "./buyer-section";
import { VendorReplyForm } from "./vendor-reply-form";

export const VendorReply: React.FC<VendorReplyProps> = ({
  rfpId,
  buyerData,
  vendorResponseId,
  setIsSubmitted,
  isSubmitted,
  vendorDetails,
  isloading,
  setIsloading,
  fromPreview,
  organizationVendor,
}) => {
  const router = useRouter();
  const [attachments, setAttachments] = useState<(File | any)[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  const [citiesOptions, setCitiesOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [contact, setContact] = useState({ countryCode: "+91", mobileNo: "" });
  const [documentAttachments, setDocumentAttachments] = useState<{
    [key: number]: {
      hasDocument: boolean;
      documentName: string;
      files: File[];
    };
  }>({});
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [documentValidation, setDocumentValidation] = useState<
    Record<number, { message: ReactNode; valid?: boolean; selected?: boolean }>
  >({});
  const [expandedSpecs, setExpandedSpecs] = useState<Record<number, boolean>>(
    {}
  );
  const [revisionNumber, setRevisionNumber] = useState(0);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  const [vendorBoqAttachments, setVendorBoqAttachments] = useState<
    Record<number, { url: string; name: string } | null>
  >({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
  } = useForm<VendorReplyFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      specialTerms: { agreement: "agree", remarks: "" },
      generalTerms: { agreement: "agree", remarks: "" },
      scopeOfWork: { agreement: "agree", remarks: "" },
      financialTerms: {
        budgetTypeAgreement: "agree",
        currencyAgreement: "agree",
        pbgAmountAgreement: "agree",
        paymentTermsAgreement: "agree",
        financialNotesAgreement: "agree",
        pbgNotesAgreement: "agree",
        remarks: "",
      },
      buyerNotes: { agreement: "agree", remarks: "" },
    },
  });

  const watchBoqDetails = watch("boqDetails");
  const [calculationTrigger, setCalculationTrigger] = useState(0);

  const handleBoqAttachmentUpload = useCallback(
    async (index: number, file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "boq");

        const res = await fetch("/api/vendor-upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          setVendorBoqAttachments((prev) => ({
            ...prev,
            [index]: { url, name: file.name },
          }));
          setValue(`boqDetails.${index}.vendorAttachmentUrl` as any, url);
          setValue(
            `boqDetails.${index}.vendorAttachmentName` as any,
            file.name
          );
          toast.success(`Attachment uploaded for item ${index + 1}`);
        } else {
          toast.error("Failed to upload attachment");
        }
      } catch {
        toast.error("Upload error");
      }
    },
    [setValue]
  );

  const handleBoqAttachmentRemove = useCallback(
    (index: number) => {
      setVendorBoqAttachments((prev) => ({ ...prev, [index]: null }));
      setValue(`boqDetails.${index}.vendorAttachmentUrl` as any, "");
      setValue(`boqDetails.${index}.vendorAttachmentName` as any, "");
    },
    [setValue]
  );

  const boqList = buyerData?.boq || buyerData?.rfpBoqItems || [];

  const calculateItemTotal = useCallback(
    (index: number) => {
      const buyerItem = boqList[index];
      const formItem = watchBoqDetails?.[index];

      if (!buyerItem || !formItem) {
        return { itemTotal: 0, itemGST: 0, grandTotal: 0, gstPercentage: 0 };
      }

      const qty = parseFloat(buyerItem.qty || buyerItem.quantity || "0");
      const quotePrice = parseFloat(formItem.quotePrice?.toString() || "0");
      const gstPercentage = parseFloat(formItem.gst?.toString() || "0");

      const itemTotal = qty * quotePrice;
      const itemGST = itemTotal * (gstPercentage / 100);
      const grandTotal = itemTotal + itemGST;

      return {
        itemTotal: isNaN(itemTotal) ? 0 : itemTotal,
        itemGST: isNaN(itemGST) ? 0 : itemGST,
        grandTotal: isNaN(grandTotal) ? 0 : grandTotal,
        gstPercentage: isNaN(gstPercentage) ? 0 : gstPercentage,
      };
    },
    [boqList, watchBoqDetails, calculationTrigger]
  );

  const itemTotals = useMemo(() => {
    if (!boqList.length || !watchBoqDetails) return [];
    return boqList.map((_: any, index: number) => calculateItemTotal(index));
  }, [boqList, watchBoqDetails, calculateItemTotal, calculationTrigger]);

  const calculateOverallTotals = useCallback(() => {
    if (!itemTotals || itemTotals.length === 0) {
      return { subTotal: 0, totalGST: 0, grandTotal: 0 };
    }
    return itemTotals.reduce(
      (
        totals: { subTotal: any; totalGST: any; grandTotal: any },
        item: { itemTotal: any; itemGST: any; grandTotal: any }
      ) => ({
        subTotal: totals.subTotal + (item.itemTotal || 0),
        totalGST: totals.totalGST + (item.itemGST || 0),
        grandTotal: totals.grandTotal + (item.grandTotal || 0),
      }),
      { subTotal: 0, totalGST: 0, grandTotal: 0 }
    );
  }, [itemTotals]);

  const overallTotals = useMemo(
    () => calculateOverallTotals(),
    [calculateOverallTotals]
  );

  const getGSTMessage = () => {
    const boqDetails = watch("boqDetails") || [];
    if (boqDetails.length === 0) return null;
    const zeroGSTItems = boqDetails.filter((item) => item?.gst === 0);
    const totalItems = boqDetails.length;
    if (zeroGSTItems.length === 0) return null;
    if (zeroGSTItems.length === totalItems)
      return "You're proceeding with 0% GST";
    return "You're proceeding with 0% GST for one of your BOQ items";
  };

  const [hasSubmittedPast, setHasSubmittedPast] = useState(false);
  const [revisionsList, setRevisionsList] = useState<any[]>([]);
  const [latestRevisionNumber, setLatestRevisionNumber] = useState<number>(0);
  const [selectedRevisionNumber, setSelectedRevisionNumber] = useState<number>(0);

  const loadRevisionData = useCallback(
    async (targetRevNum?: number) => {
      if (!vendorResponseId && !rfpId) return;

      try {
        let url = `/api/vendor-response?rfpId=${rfpId}`;
        if (vendorResponseId) {
          url = `/api/vendor-response?responseId=${vendorResponseId}&rfpId=${rfpId}`;
        }
        if (targetRevNum !== undefined && targetRevNum !== null) {
          url += `&revision=${targetRevNum}`;
        }

        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        const respData = data?.data;
        if (!respData) return;

        if (respData?.status === "submitted") {
          setHasSubmittedPast(true);
        }
        if (respData?.revisions) {
          setRevisionsList(respData.revisions);
        }
        if (respData?.latestRevisionNumber !== undefined) {
          setLatestRevisionNumber(respData.latestRevisionNumber);
        }
        if (respData?.revisionNumber !== undefined) {
          setRevisionNumber(respData.revisionNumber);
          setSelectedRevisionNumber(respData.revisionNumber);
        }
        if (respData?.companyInfo) {
          Object.entries(respData.companyInfo).forEach(([k, v]) => {
            setValue(`companydetails.${k}` as any, v);
          });
          if (respData.companyInfo.logoUrl) {
            setLogoPreview(respData.companyInfo.logoUrl);
          }
          if (respData.companyInfo.phone) {
            setContact((prev) => ({ ...prev, mobileNo: respData.companyInfo.phone }));
          }
        }
        if (respData?.scopeAgreement) {
          setValue("scopeOfWork.agreement", respData.scopeAgreement);
        }
        if (respData?.scopeRemarks) {
          setValue("scopeOfWork.remarks", respData.scopeRemarks);
        }
        if (respData?.evalCompliance) {
          setValue("evaluation", respData.evalCompliance);
        }
        if (respData?.paymentRemarks) {
          setValue("financialTerms.remarks", respData.paymentRemarks);
        }
        if (respData?.generalAgreement) {
          setValue("generalTerms.agreement", respData.generalAgreement);
        }
        if (respData?.generalRemarks) {
          setValue("generalTerms.remarks", respData.generalRemarks);
        }
        if (respData?.specialAgreement) {
          setValue("specialTerms.agreement", respData.specialAgreement);
        }
        if (respData?.specialRemarks) {
          setValue("specialTerms.remarks", respData.specialRemarks);
        }
        if (respData?.specialNote) {
          setValue("otherInformation.warranty", respData.specialNote);
        }
        if (respData?.boqQuotes) {
          const boqArray = boqList.map((item: any, idx: number) => {
            const key = item.id || `boq_${idx}`;
            const q = Array.isArray(respData.boqQuotes)
              ? respData.boqQuotes[idx] || {}
              : respData.boqQuotes[key] || {};
            return {
              description: item.description || "",
              uom: item.uom || "EA",
              qty: parseFloat(item.qty || item.quantity) || 1,
              targetPrice: parseFloat(item.targetPrice) || 0,
              quotePrice: parseFloat(q.quotePrice || q.price) || 0,
              make: q.make || "",
              model: q.model || "",
              specification: item.specification || "",
              productDetails: q.productDetails || "",
              compliance: q.compliance || "Complied",
              remarks: q.remarks || "",
              gst: parseFloat(q.gstPercent || q.gst) || 0,
              deviation: q.deviation || "",
              vendorAttachmentUrl: q.vendorAttachmentUrl || "",
              vendorAttachmentName: q.vendorAttachmentName || "",
            };
          });
          setValue("boqDetails", boqArray);
        }
      } catch (err) {
        console.error("Error loading vendor response data:", err);
      }
    },
    [vendorResponseId, rfpId, boqList, setValue]
  );

  useEffect(() => {
    loadRevisionData();
  }, [loadRevisionData]);

  const displayRevisionNumber =
    !isSubmitted && hasSubmittedPast ? latestRevisionNumber + 1 : selectedRevisionNumber;

  useEffect(() => {
    if (boqList.length > 0 && (!watchBoqDetails || watchBoqDetails.length === 0)) {
      const initialBoqDetails = boqList.map((item: any) => ({
        description: item.description || "",
        uom: item.uom || "Nos",
        qty: parseFloat(item.qty || item.quantity) || 1,
        targetPrice: parseFloat(item.targetPrice) || 0,
        quotePrice: 0,
        make: "",
        model: "",
        specification: item.specification || "",
        productDetails: "",
        compliance: "Complied",
        remarks: "",
        gst: 0,
        deviation: "",
        vendorAttachmentUrl: "",
        vendorAttachmentName: "",
      }));
      setValue("boqDetails", initialBoqDetails);
    }
  }, [boqList.length]);

  const priorityCities = useMemo(
    () => [
      "Mumbai, Maharashtra",
      "Delhi, Delhi",
      "Bengaluru, Karnataka",
      "Hyderabad, Telangana",
      "Ahmedabad, Gujarat",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Pune, Maharashtra",
    ],
    []
  );

  useEffect(() => {
    const loadAllIndiaCities = async () => {
      setLoadingCities(true);
      try {
        const india = Country.getAllCountries().find((c) => c.name === "India");
        if (!india) {
          setLoadingCities(false);
          return;
        }

        const allStates = State.getStatesOfCountry(india.isoCode);
        const allCityOptions: any[] = [];

        for (const state of allStates) {
          const stateCities = City.getCitiesOfState(
            india.isoCode,
            state.isoCode
          );
          stateCities.forEach((city) => {
            allCityOptions.push({
              value: `${city.name}|${state.name}|${city.latitude || "0"}|${city.longitude || "0"}`,
              label: `${city.name}, ${state.name}`,
            });
          });
        }

        setCitiesOptions(allCityOptions);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    loadAllIndiaCities();
  }, []);

  const requiredDocuments = useMemo(() => {
    const docs = buyerData?.documentsToShare?.documentsToShare || buyerData?.documentsToShare;
    if (Array.isArray(docs)) return docs.map((d: any) => typeof d === "object" ? d.name || d.id : String(d));
    if (typeof docs === "string")
      return docs.split(",").map((d: string) => d.trim());
    return ["Pan Card / Registration Certificate", "ISO / Compliance Certificate"];
  }, [buyerData]);

  const safeParseFloat = (value: any): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getFullYear()}`;
  };

  const getCurrencySymbol = (currencyCode: any) => {
    switch (currencyCode) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "₹";
    }
  };

  const toggleSpecification = useCallback((index: number) => {
    setExpandedSpecs((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleDocumentSelection = (index: number, hasDocument: boolean) => {
    setDocumentAttachments((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        hasDocument,
        files: hasDocument ? prev[index]?.files || [] : [],
        documentName: requiredDocuments[index] || `Document ${index}`,
      },
    }));
  };

  const handleDocumentFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    documentIndex: number,
    documentName: string
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setValue(`attachments.${documentIndex}.files`, files);
      setDocumentAttachments((prev) => ({
        ...prev,
        [documentIndex]: { hasDocument: true, documentName, files },
      }));
    }
  };

  const validateDocuments = () => true;

  const removeDocumentAttachment = (
    documentIndex: number,
    fileIndex: number
  ) => {
    const currentFiles = getValues(`attachments.${documentIndex}.files`);
    const updatedFiles = Array.isArray(currentFiles)
      ? currentFiles.filter((_, i) => i !== fileIndex)
      : [];
    setValue(`attachments.${documentIndex}.files`, updatedFiles);
    setDocumentAttachments((prev) => ({
      ...prev,
      [documentIndex]: { ...prev[documentIndex], files: updatedFiles },
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (e.target.id === "logoUpload") {
        const logoFile = files[0];
        const objectUrl = URL.createObjectURL(logoFile);
        setLogoPreview(objectUrl);
        setLogoFileName(logoFile.name);

        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("type", "logo");
        try {
          const uploadRes = await fetch("/api/vendor-upload", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            setValue("companydetails.logoUrl" as any, url);
            setLogoPreview(url);
          }
        } catch (err) {
          console.warn("Logo upload failed:", err);
        }
      } else {
        setAttachments((prev) => [...prev, ...files]);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<VendorReplyFormData | null>(null);

  const prepareSubmit = useCallback(
    (data: VendorReplyFormData) => {
      setPendingFormData(data);
      setShowConfirmation(true);
    },
    []
  );

  const handleConfirmedSubmit = useCallback(async () => {
    if (!pendingFormData) return;
    if (setIsloading) setIsloading(true);
    try {
      const data = pendingFormData;
      const boqQuotesMap: Record<string, any> = {};
      boqList.forEach((item: any, idx: number) => {
        const key = item.id || `boq_${idx}`;
        const formItem = data.boqDetails?.[idx] || {};
        boqQuotesMap[key] = {
          quotePrice: String(formItem.quotePrice || 0),
          gstPercent: String(formItem.gst || 0),
          make: formItem.make || "",
          model: formItem.model || "",
          compliance: formItem.compliance || "Complied",
          remarks: formItem.remarks || "",
          vendorAttachmentUrl: formItem.vendorAttachmentUrl || "",
          vendorAttachmentName: formItem.vendorAttachmentName || "",
        };
      });

      const payload = {
        rfpId,
        vendorResponseId:
          vendorResponseId && !vendorResponseId.startsWith("vr_")
            ? vendorResponseId
            : `VR-${Math.floor(1000 + Math.random() * 9000)}`,
        companyInfo: data.companydetails,
        companydetails: data.companydetails,
        logoUrl: logoPreview,
        scopeAgreement: data.scopeOfWork?.agreement || "agree",
        scopeRemarks: data.scopeOfWork?.remarks || "",
        boqQuotes: boqQuotesMap,
        boqDetails: data.boqDetails,
        evalCompliance: data.evaluation,
        evaluation: data.evaluation,
        paymentRemarks: data.financialTerms?.remarks || "",
        financialTerms: data.financialTerms,
        generalAgreement: data.generalTerms?.agreement || "agree",
        generalRemarks: data.generalTerms?.remarks || "",
        generalTerms: data.generalTerms,
        specialAgreement: data.specialTerms?.agreement || "agree",
        specialRemarks: data.specialTerms?.remarks || "",
        specialTerms: data.specialTerms,
        specialNote: data.otherInformation?.warranty || "",
        otherInformation: data.otherInformation,
        grandTotal: overallTotals.grandTotal.toFixed(2),
        status: "submitted",
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/vendor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const jsonRes = await res.json();
        if (jsonRes?.revisionNumber !== undefined && jsonRes?.revisionNumber !== null) {
          setRevisionNumber(jsonRes.revisionNumber);
        }
        setHasSubmittedPast(true);
        setIsSubmitted(true);
        setShowConfirmation(false);

        const vendorCompanyName =
          data.companydetails?.companyName ||
          organizationVendor?.companyName ||
          "UrbanNest Interiors";
        const vendorEmail =
          data.companydetails?.email ||
          vendorDetails?.email ||
          organizationVendor?.email ||
          "priyavenkatesan41@gmail.com";
        const buyerCompanyName =
          buyerData?.company?.name ||
          buyerData?.buyerCompanyName ||
          "KG Corp";
        const buyerEmail =
          buyerData?.contact?.contactEmail ||
          buyerData?.buyerEmail ||
          "buyer@zopapro.com";
        const projectName =
          buyerData?.requirement?.projectName ||
          buyerData?.projectName ||
          buyerData?.rfpTitle ||
          "Facility Expansion & Automation";
        const submissionUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/rfq/reply/${rfpId}?responseId=${vendorResponseId}`
            : "";

        // Trigger notifications to Buyer and Vendor
        try {
          await Promise.all([
            fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "vendor-submission",
                data: {
                  companyName: vendorCompanyName,
                  projectName,
                  vendorEmail,
                  buyerEmail,
                  url: submissionUrl,
                },
              }),
            }),
            fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "vendor-preview-submission",
                data: {
                  companyName: buyerCompanyName,
                  projectName,
                  vendorEmail,
                  VendorCompanyName: vendorCompanyName,
                  buyerEmail,
                  url: submissionUrl,
                },
              }),
            }),
          ]);
        } catch (e) {
          console.error("Failed to send notification emails:", e);
        }

        toast.success("Response submitted successfully!");
        router.push("/rfq/thankyou");
      } else {
        toast.error("Failed to submit response. Please try again.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("An error occurred during submission.");
    } finally {
      if (setIsloading) setIsloading(false);
    }
  }, [
    pendingFormData,
    rfpId,
    vendorResponseId,
    boqList,
    overallTotals,
    logoPreview,
    setIsSubmitted,
    setIsloading,
    organizationVendor,
    vendorDetails,
    buyerData,
    router,
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      <HeaderSection
        buyerData={buyerData}
        getCurrentDate={getCurrentDate}
        logoPreview={logoPreview}
        revisionNumber={displayRevisionNumber}
        revisions={revisionsList}
        selectedRevisionNumber={selectedRevisionNumber}
        onSelectRevision={(revNum) => loadRevisionData(revNum)}
      />

      <BuyerSection buyerData={buyerData} watch={watch} />

      <h2 className="text-xl font-bold text-blue-600 uppercase tracking-wide">
        Vendor Response Quote
      </h2>

      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-4 shadow-xs">
          <h3 className="text-2xl font-bold text-emerald-800">
            Response Submitted Successfully (Revision R-{revisionNumber})
          </h3>
          <p className="text-sm text-emerald-700">
            Thank you for submitting your quote for RFQ #{buyerData?.rfpUniqueId || rfpId}.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md shadow cursor-pointer text-sm"
            >
              Edit / Submit New Revision (R-{revisionNumber + 1})
            </Button>
          </div>
        </div>
      )}

      <VendorReplyForm
        register={register}
        watch={watch}
        setValue={setValue}
        trigger={trigger}
        clearErrors={clearErrors}
        errors={errors}
        handleSubmit={handleSubmit}
        prepareSubmit={prepareSubmit}
        contact={contact}
        setContact={setContact}
        handleFileChange={handleFileChange}
        logoPreview={logoPreview}
        logoFileName={logoFileName}
        buyerData={buyerData}
        itemTotals={itemTotals}
        expandedSpecs={expandedSpecs}
        toggleSpecification={toggleSpecification}
        calculateItemTotal={calculateItemTotal}
        overallTotals={overallTotals}
        getCurrencySymbol={getCurrencySymbol}
        safeParseFloat={safeParseFloat}
        calculationTrigger={calculationTrigger}
        setCalculationTrigger={setCalculationTrigger}
        getGSTMessage={getGSTMessage}
        citiesOptions={citiesOptions}
        priorityCities={priorityCities}
        loadingCities={loadingCities}
        requiredDocuments={requiredDocuments}
        documentValidation={documentValidation}
        submissionAttempted={submissionAttempted}
        documentAttachments={documentAttachments}
        handleDocumentSelection={handleDocumentSelection}
        handleDocumentFileChange={handleDocumentFileChange}
        validateDocuments={validateDocuments}
        removeDocumentAttachment={removeDocumentAttachment}
        attachments={attachments}
        removeAttachment={removeAttachment}
        isSubmitted={isSubmitted}
        isloading={isloading}
        fieldsDisabled={isSubmitted}
        vendorBoqAttachments={vendorBoqAttachments}
        onBoqAttachmentUpload={handleBoqAttachmentUpload}
        onBoqAttachmentRemove={handleBoqAttachmentRemove}
      />

      {/* Confirmation Modal Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6 text-left border border-slate-100">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Confirm Submission</h3>
              <p className="text-sm text-slate-600">
                Are you sure you want to submit this RFQ response?
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 font-bold px-4 py-2 rounded-md uppercase text-xs tracking-wider"
              >
                CANCEL
              </Button>
              <Button
                type="button"
                onClick={handleConfirmedSubmit}
                disabled={isloading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md uppercase text-xs tracking-wider shadow"
              >
                {isloading ? "SUBMITTING..." : "CONFIRM SUBMISSION"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
