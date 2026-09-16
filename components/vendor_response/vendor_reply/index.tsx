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
      files: any[];
    };
  }>({});
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const [documentValidation, setDocumentValidation] = useState<
    Record<number, { message: ReactNode; valid?: boolean; selected?: boolean }>
  >({});
  const [expandedSpecs, setExpandedSpecs] = useState<Record<number, boolean>>(
    {},
  );
  const [revisionNumber, setRevisionNumber] = useState(0);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  const [vendorBoqAttachments, setVendorBoqAttachments] = useState<
    Record<string, { url: string; name: string }[]>
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
    async (
      groupIndex: number,
      subItemIndex: number,
      files: FileList | File[]
    ) => {
      try {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        const newUploadedFiles: { url: string; name: string }[] = [];

        for (const file of fileArray) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "boq");

          const res = await fetch("/api/vendor-upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const { url } = await res.json();
            newUploadedFiles.push({ url, name: file.name });
          }
        }

        if (newUploadedFiles.length > 0) {
          const key = `${groupIndex}_${subItemIndex}`;
          let updatedList: { url: string; name: string }[] = [];

          setVendorBoqAttachments((prev) => {
            const current = prev[key] || [];
            updatedList = [...current, ...newUploadedFiles];
            return {
              ...prev,
              [key]: updatedList,
            };
          });

          const currentFormAtts =
            getValues(
              `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachments` as any
            ) || [];
          const combinedFormAtts = [...currentFormAtts, ...newUploadedFiles];

          setValue(
            `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachments` as any,
            combinedFormAtts
          );
          setValue(
            `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachmentUrl` as any,
            combinedFormAtts[0]?.url || ""
          );
          setValue(
            `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachmentName` as any,
            combinedFormAtts[0]?.name || ""
          );

          toast.success(
            `${newUploadedFiles.length} file(s) uploaded for item ${
              subItemIndex + 1
            }`
          );
        }
      } catch {
        toast.error("Upload error");
      }
    },
    [getValues, setValue]
  );

  const handleBoqAttachmentRemove = useCallback(
    (groupIndex: number, subItemIndex: number, fileIndex: number) => {
      const key = `${groupIndex}_${subItemIndex}`;
      let updatedList: { url: string; name: string }[] = [];

      setVendorBoqAttachments((prev) => {
        const current = prev[key] || [];
        updatedList = current.filter((_, idx) => idx !== fileIndex);
        return {
          ...prev,
          [key]: updatedList,
        };
      });

      setValue(
        `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachments` as any,
        updatedList
      );
      setValue(
        `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachmentUrl` as any,
        updatedList[0]?.url || ""
      );
      setValue(
        `boqDetails.${groupIndex}.items.${subItemIndex}.vendorAttachmentName` as any,
        updatedList[0]?.name || ""
      );
    },
    [setValue]
  );

  const handleAddSubItem = useCallback(
    (groupIndex: number) => {
      const currentGroups = getValues("boqDetails") || [];
      const targetGroup = currentGroups[groupIndex] || { items: [] };
      const currentItems = targetGroup.items || [];
      const newItem = {
        id: `sub_${Date.now()}_${currentItems.length}`,
        itemName: "",
        quotePrice: 0,
        gst: 0,
        make: "",
        model: "",
        compliance: "Complied",
        remarks: "",
        vendorAttachmentUrl: "",
        vendorAttachmentName: "",
      };
      const updatedItems = [...currentItems, newItem];
      setValue(`boqDetails.${groupIndex}.items`, updatedItems, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCalculationTrigger((prev) => prev + 1);
    },
    [getValues, setValue],
  );

  const handleRemoveSubItem = useCallback(
    (groupIndex: number, subItemIndex: number) => {
      const currentGroups = getValues("boqDetails") || [];
      const targetGroup = currentGroups[groupIndex] || { items: [] };
      const currentItems = targetGroup.items || [];
      if (currentItems.length <= 1) return;
      const updatedItems = currentItems.filter(
        (_, idx) => idx !== subItemIndex
      );
      setValue(`boqDetails.${groupIndex}.items`, updatedItems, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCalculationTrigger((prev) => prev + 1);
    },
    [getValues, setValue],
  );

  const boqList = buyerData?.boq || buyerData?.rfpBoqItems || [];

  const calculateSubItemTotal = useCallback(
    (groupIndex: number, subItemIndex: number) => {
      const buyerItem = boqList[groupIndex];
      const formGroup = watchBoqDetails?.[groupIndex];
      const formSubItem = formGroup?.items?.[subItemIndex];

      if (!buyerItem || !formSubItem) {
        return { itemTotal: 0, itemGST: 0, grandTotal: 0, gstPercentage: 0 };
      }

      const qty = parseFloat(buyerItem.qty || buyerItem.quantity || "0");
      const quotePrice = parseFloat(formSubItem.quotePrice?.toString() || "0");
      const gstPercentage = parseFloat(formSubItem.gst?.toString() || "0");

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
    [boqList, watchBoqDetails, calculationTrigger],
  );

  const calculateOverallTotals = useCallback(() => {
    if (!boqList.length || !watchBoqDetails) {
      return { subTotal: 0, totalGST: 0, grandTotal: 0 };
    }
    let subTotal = 0;
    let totalGST = 0;
    let grandTotal = 0;

    boqList.forEach((_: any, groupIndex: number) => {
      const items = watchBoqDetails[groupIndex]?.items || [];
      items.forEach((_: any, subItemIndex: number) => {
        const totals = calculateSubItemTotal(groupIndex, subItemIndex);
        subTotal += totals.itemTotal;
        totalGST += totals.itemGST;
        grandTotal += totals.grandTotal;
      });
    });

    return { subTotal, totalGST, grandTotal };
  }, [boqList, watchBoqDetails, calculateSubItemTotal]);

  const overallTotals = useMemo(
    () => calculateOverallTotals(),
    [calculateOverallTotals],
  );

  const getGSTMessage = () => {
    const boqDetails = watch("boqDetails") || [];
    if (boqDetails.length === 0) return null;
    let zeroCount = 0;
    let totalCount = 0;
    boqDetails.forEach((group) => {
      const items = group?.items || [];
      items.forEach((sub) => {
        totalCount++;
        if (sub?.gst === 0) zeroCount++;
      });
    });
    if (totalCount === 0 || zeroCount === 0) return null;
    if (zeroCount === totalCount) return "You're proceeding with 0% GST";
    return "You're proceeding with 0% GST for one or more of your BOQ items";
  };

  const [hasSubmittedPast, setHasSubmittedPast] = useState(false);
  const [revisionsList, setRevisionsList] = useState<any[]>([]);
  const [latestRevisionNumber, setLatestRevisionNumber] = useState<number>(0);
  const [selectedRevisionNumber, setSelectedRevisionNumber] =
    useState<number>(0);

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

        if (respData?.status === "submitted" && Array.isArray(respData?.revisions) && respData.revisions.length > 0) {
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
            const strVal = String(v || "");
            if (
              strVal === "Address 1" ||
              strVal === "Unknown" ||
              strVal === "000000" ||
              strVal === "0000000000"
            ) {
              setValue(`companydetails.${k}` as any, "");
            } else {
              setValue(`companydetails.${k}` as any, v);
            }
          });
          if (respData.companyInfo.logoUrl) {
            setLogoPreview(respData.companyInfo.logoUrl);
          }
          if (
            respData.companyInfo.phone &&
            respData.companyInfo.phone !== "0000000000"
          ) {
            setContact((prev) => ({
              ...prev,
              mobileNo: respData.companyInfo.phone,
            }));
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
        if (respData?.boqQuotes || respData?.boqDetails) {
          const boqSource = respData.boqQuotes || respData.boqDetails;
          const initialAttachmentMap: Record<
            string,
            { url: string; name: string }[]
          > = {};

          const boqArray = boqList.map((item: any, idx: number) => {
            const key = item.id || `boq_${idx}`;
            const storedData = Array.isArray(boqSource)
              ? boqSource[idx] || {}
              : boqSource[key] || {};

            let subItemsList: any[] = [];

            if (
              Array.isArray(storedData?.items) &&
              storedData.items.length > 0
            ) {
              subItemsList = storedData.items.map(
                (sub: any, subIdx: number) => {
                  let atts: { url: string; name: string }[] = [];
                  if (
                    Array.isArray(sub.vendorAttachments) &&
                    sub.vendorAttachments.length > 0
                  ) {
                    atts = sub.vendorAttachments;
                  } else if (sub.vendorAttachmentUrl) {
                    atts = [
                      {
                        url: sub.vendorAttachmentUrl,
                        name: sub.vendorAttachmentName || "Attachment",
                      },
                    ];
                  }

                  if (atts.length > 0) {
                    initialAttachmentMap[`${idx}_${subIdx}`] = atts;
                  }

                  return {
                    id: sub.id || `sub_${idx}_${subIdx}`,
                    itemName: sub.itemName || sub.name || "",
                    quotePrice: parseFloat(sub.quotePrice || sub.price) || 0,
                    gst: parseFloat(sub.gstPercent || sub.gst) || 0,
                    make: sub.make || "",
                    model: sub.model || "",
                    compliance: sub.compliance || "Complied",
                    remarks: sub.remarks || "",
                    vendorAttachmentUrl: atts[0]?.url || "",
                    vendorAttachmentName: atts[0]?.name || "",
                    vendorAttachments: atts,
                  };
                }
              );
            } else {
              let atts: { url: string; name: string }[] = [];
              if (
                Array.isArray(storedData.vendorAttachments) &&
                storedData.vendorAttachments.length > 0
              ) {
                atts = storedData.vendorAttachments;
              } else if (storedData.vendorAttachmentUrl) {
                atts = [
                  {
                    url: storedData.vendorAttachmentUrl,
                    name: storedData.vendorAttachmentName || "Attachment",
                  },
                ];
              }

              if (atts.length > 0) {
                initialAttachmentMap[`${idx}_0`] = atts;
              }

              subItemsList = [
                {
                  id: `sub_${idx}_0`,
                  itemName: storedData.itemName || "",
                  quotePrice:
                    parseFloat(storedData.quotePrice || storedData.price) || 0,
                  gst: parseFloat(storedData.gstPercent || storedData.gst) || 0,
                  make: storedData.make || "",
                  model: storedData.model || "",
                  compliance: storedData.compliance || "Complied",
                  remarks: storedData.remarks || "",
                  vendorAttachmentUrl: atts[0]?.url || "",
                  vendorAttachmentName: atts[0]?.name || "",
                  vendorAttachments: atts,
                },
              ];
            }

            return {
              description: item.description || "",
              uom: item.uom || "EA",
              qty: parseFloat(item.qty || item.quantity) || 1,
              targetPrice: parseFloat(item.targetPrice) || 0,
              specification: item.specification || "",
              items: subItemsList,
            };
          });

          setVendorBoqAttachments(initialAttachmentMap);
          setValue("boqDetails", boqArray);
        }
      } catch (err) {
        console.error("Error loading vendor response data:", err);
      }
    },
    [vendorResponseId, rfpId, boqList, setValue],
  );

  useEffect(() => {
    loadRevisionData();
  }, [loadRevisionData]);

  const displayRevisionNumber =
    !isSubmitted && hasSubmittedPast
      ? latestRevisionNumber + 1
      : selectedRevisionNumber;

  useEffect(() => {
    if (
      boqList.length > 0 &&
      (!watchBoqDetails || watchBoqDetails.length === 0)
    ) {
      const initialBoqDetails = boqList.map((item: any, idx: number) => ({
        description: item.description || "",
        uom: item.uom || "Nos",
        qty: parseFloat(item.qty || item.quantity) || 1,
        targetPrice: parseFloat(item.targetPrice) || 0,
        specification: item.specification || "",
        items: [
          {
            id: `sub_${idx}_0`,
            itemName: "",
            quotePrice: 0,
            gst: 0,
            make: "",
            model: "",
            compliance: "Complied",
            remarks: "",
            vendorAttachmentUrl: "",
            vendorAttachmentName: "",
          },
        ],
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
    [],
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
            state.isoCode,
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
    const docs =
      buyerData?.documentsToShare?.documentsToShare ||
      buyerData?.documentsToShare;
    if (Array.isArray(docs))
      return docs.map((d: any) =>
        typeof d === "object" ? d.name || d.id : String(d),
      );
    if (typeof docs === "string")
      return docs.split(",").map((d: string) => d.trim());
    return [
      "Pan Card / Registration Certificate",
      "ISO / Compliance Certificate",
    ];
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
    const valueStr = hasDocument ? "yes" : "no";
    setValue(`attachments.${index}.hasDocument`, valueStr as "yes" | "no", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDocumentAttachments((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        hasDocument,
        files: hasDocument ? prev[index]?.files || [] : [],
        documentName: requiredDocuments[index] || `Document ${index}`,
      },
    }));
    setTimeout(() => {
      validateDocuments();
    }, 0);
  };

  const handleDocumentFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentIndex: number,
    documentName: string,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    console.log(
      `[GST Document Upload] Selected ${selectedFiles.length} file(s) for ${documentName}:`,
      selectedFiles.map((f) => f.name),
    );

    try {
      const uploadedFileObjects: Array<{
        name: string;
        url: string;
        size: number;
        type: string;
        documentName: string;
      }> = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentName", documentName);
        formData.append("type", "documents");

        console.log(
          `[GST Document Upload] Immediately triggering POST /api/vendor-upload for:`,
          file.name,
        );

        const res = await fetch("/api/vendor-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        console.log(
          `[GST Document Upload] Upload API response received for ${file.name}:`,
          data,
        );

        uploadedFileObjects.push({
          name: data.name || file.name,
          url: data.url,
          size: data.size || data.fileSize || file.size,
          type: data.type || data.fileType || file.type,
          documentName: documentName,
        });
      }

      const existingFiles = documentAttachments[documentIndex]?.files || [];
      const combinedFiles = [...existingFiles, ...uploadedFileObjects];

      setValue(`attachments.${documentIndex}.files` as any, combinedFiles, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setDocumentAttachments((prev) => ({
        ...prev,
        [documentIndex]: {
          hasDocument: true,
          documentName,
          files: combinedFiles,
        },
      }));

      toast.success(
        `Uploaded ${uploadedFileObjects.length} file(s) for ${documentName}`,
      );
    } catch (err: any) {
      console.error(
        `[GST Document Upload] Error uploading ${documentName}:`,
        err,
      );
      toast.error(err?.message || `Failed to upload ${documentName}`);
    } finally {
      setTimeout(() => {
        validateDocuments();
      }, 0);
    }
  };

  const validateDocuments = useCallback(() => {
    let allValid = true;
    const newValidation: Record<
      number,
      { message: ReactNode; valid?: boolean; selected?: boolean }
    > = {};

    requiredDocuments.forEach((docName, index) => {
      const hasDocVal = getValues(`attachments.${index}.hasDocument`);

      if (!hasDocVal) {
        allValid = false;
        newValidation[index] = {
          valid: false,
          selected: false,
          message: "Please select Yes or No.",
        };
      } else if (hasDocVal === "yes") {
        const files =
          documentAttachments[index]?.files ||
          getValues(`attachments.${index}.files`) ||
          [];
        if (!files || files.length === 0) {
          allValid = false;
          newValidation[index] = {
            valid: false,
            selected: true,
            message: `Please upload documents for ${docName}`,
          };
        } else {
          newValidation[index] = {
            valid: true,
            selected: true,
            message: "",
          };
        }
      } else {
        newValidation[index] = {
          valid: true,
          selected: true,
          message: "",
        };
      }
    });

    setDocumentValidation(newValidation);
    return allValid;
  }, [requiredDocuments, getValues, documentAttachments]);

  const removeDocumentAttachment = (
    documentIndex: number,
    fileIndex: number,
  ) => {
    const currentFiles = getValues(`attachments.${documentIndex}.files`);
    const updatedFiles = Array.isArray(currentFiles)
      ? currentFiles.filter((_, i) => i !== fileIndex)
      : [];
    setValue(`attachments.${documentIndex}.files`, updatedFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDocumentAttachments((prev) => ({
      ...prev,
      [documentIndex]: { ...prev[documentIndex], files: updatedFiles },
    }));
    setTimeout(() => {
      validateDocuments();
    }, 0);
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
  const [pendingFormData, setPendingFormData] =
    useState<VendorReplyFormData | null>(null);

  const prepareSubmit = useCallback(
    (data: VendorReplyFormData) => {
      setSubmissionAttempted(true);
      const isDocsValid = validateDocuments();
      if (!isDocsValid) {
        toast.error("Please select Yes or No for all required documents.");
        const elem = document.getElementById("document-attachments-section");
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      setPendingFormData(data);
      setShowConfirmation(true);
    },
    [validateDocuments],
  );

  const handleConfirmedSubmit = useCallback(async () => {
    if (!pendingFormData) return;
    if (setIsloading) setIsloading(true);
    try {
      const data = pendingFormData;
      const boqQuotesMap: Record<string, any> = {};
      boqList.forEach((item: any, idx: number) => {
        const key = item.id || `boq_${idx}`;
        const formGroup = data.boqDetails?.[idx] || { items: [] };
        const itemsList = formGroup.items || [];
        boqQuotesMap[key] = {
          description: item.description || "",
          qty: item.qty || item.quantity || 1,
          uom: item.uom || "EA",
          items: itemsList.map((sub: any) => {
            const atts = Array.isArray(sub.vendorAttachments)
              ? sub.vendorAttachments
              : sub.vendorAttachmentUrl
              ? [
                  {
                    url: sub.vendorAttachmentUrl,
                    name: sub.vendorAttachmentName || "Attachment",
                  },
                ]
              : [];

            return {
              id: sub.id,
              itemName: sub.itemName || "",
              quotePrice: String(sub.quotePrice || 0),
              gstPercent: String(sub.gst || 0),
              make: sub.make || "",
              model: sub.model || "",
              compliance: sub.compliance || "Complied",
              remarks: sub.remarks || "",
              vendorAttachmentUrl: atts[0]?.url || "",
              vendorAttachmentName: atts[0]?.name || "",
              vendorAttachments: atts,
            };
          }),
        };
      });

      const allUploadedDocAttachments: Array<{
        documentName: string;
        name: string;
        url: string;
        size?: number;
      }> = [];

      Object.values(documentAttachments).forEach((docGroup: any) => {
        if (docGroup?.files && Array.isArray(docGroup.files)) {
          docGroup.files.forEach((fileObj: any) => {
            if (fileObj.url) {
              allUploadedDocAttachments.push({
                documentName:
                  docGroup.documentName || fileObj.documentName || "Document",
                name: fileObj.name,
                url: fileObj.url,
                size: fileObj.size,
              });
            }
          });
        }
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
        attachments: allUploadedDocAttachments,
        documentAttachments: allUploadedDocAttachments,
        grandTotal: overallTotals.grandTotal.toFixed(2),
        status: "submitted",
        submittedAt: new Date().toISOString(),
        isNewRevision: hasSubmittedPast,
      };

      const res = await fetch("/api/vendor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const jsonRes = await res.json();
        const returnedRevNum = jsonRes?.revisionNumber ?? jsonRes?.data?.revisionNumber;
        if (
          returnedRevNum !== undefined &&
          returnedRevNum !== null
        ) {
          setRevisionNumber(returnedRevNum);
          setLatestRevisionNumber(returnedRevNum);
          setSelectedRevisionNumber(returnedRevNum);
        }
        setHasSubmittedPast(true);
        setIsSubmitted(true);
        setShowConfirmation(false);

        const actualResponseId =
          jsonRes?.vendorResponseId ||
          jsonRes?.data?.vendorResponseId ||
          payload.vendorResponseId ||
          vendorResponseId;

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
          buyerData?.company?.name || buyerData?.buyerCompanyName || "KG Corp";
        const buyerEmail =
          buyerData?.contact?.contactEmail ||
          buyerData?.buyerEmail ||
          "buyer@zopapro.com";
        const projectName =
          buyerData?.requirement?.projectName ||
          buyerData?.projectName ||
          buyerData?.rfpTitle ||
          "Facility Expansion & Automation";

        const baseURL =
          process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000");

        const buyerPreviewUrl = `${baseURL}/rfq/buyer_preview/${rfpId}?response=${actualResponseId}`;
        const vendorReplyUrl = `${baseURL}/rfq/reply/${rfpId}?responseId=${actualResponseId}`;

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
                  url: buyerPreviewUrl,
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
                  url: vendorReplyUrl,
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
    <div className="space-y-8 px-4 py-6">
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
            Thank you for submitting your quote for RFQ #
            {buyerData?.rfpUniqueId || rfpId}.
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
        expandedSpecs={expandedSpecs}
        toggleSpecification={toggleSpecification}
        calculateSubItemTotal={calculateSubItemTotal}
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
        onAddSubItem={handleAddSubItem}
        onRemoveSubItem={handleRemoveSubItem}
      />

      {/* Confirmation Modal Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6 text-left border border-slate-100">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Confirm Submission
              </h3>
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
