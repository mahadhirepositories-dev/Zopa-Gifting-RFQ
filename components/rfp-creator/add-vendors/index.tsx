/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as XLSX from "xlsx";
import { FaUpload, FaFileDownload } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { toast } from "react-toastify";
import { z } from "zod";
import ValidationErrorModal from "./validation-error-modal";
import { Edit, Trash2, Package, MapPin, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Vendor } from "./vendor-types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { VendorLimitStatus } from "./vendor-limit-status";
import { VendorLimitPopup } from "./vendor-limit-popup";
import { OrganizationVendorsTable } from "./organization-vendors-table";
import { MasterVendorsTable } from "./master-vendors-table";
import {
  parseFlexibleArrayField,
  displayFlexibleArrayField,
} from "@/lib/vendor-field-parser";

const vendorContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  mobileNo: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .refine((val) => /^\+?[0-9\s-]{10,15}$/.test(val), {
      message: "Invalid mobile number format",
    }),
  countryCode: z.string().min(1, "Country code is required"),
  companyName: z.string().min(1, "Company Name is required"),
});

const vendorContactsArraySchema = z
  .array(vendorContactSchema)
  .min(1, "At least one vendor contact is required");

interface VendorContact {
  name: string;
  email: string;
  mobileNo: string;
  countryCode?: string;
  companyName?: string;
  isNew?: boolean;
  email_sent?: boolean;
  isFromMaster?: boolean;
  masterVendorId?: string | number;
}

interface BOQItem {
  id: number;
  category?: string;
  categoryName?: string;
  description: string;
  tags?: string[];
}

// Some BOQ payloads use `category`, others `categoryName` — read whichever is present.
const getBoqCategoryText = (item?: BOQItem | null): string =>
  item?.category || item?.categoryName || "";

interface RFPData {
  boqItems: BOQItem[];
  deliveryLocations: string[];
}

interface VendorContactsProps {
  data?: VendorContact[];
  onChange: (data: VendorContact[]) => void;
  errors?: Record<string, string>;
  onValidation?: (isValid: boolean) => void;
  setErrors?: (errors: Record<string, string>) => void;
  disabled?: boolean;
  masterVendors?: Vendor[];
  rfpId?: string;
  orgSlug?: string;
}

// ---------------------------------------------------------------------------
// Matching helpers — Category + Description + Tags based matching
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "are",
  "was",
  "were",
  "has",
  "have",
  "will",
  "shall",
  "service",
  "services",
  "provide",
  "providing",
  "provider",
  "into",
  "your",
  "our",
  "their",
  "any",
  "all",
  "etc",
  "each",
  "such",
  "per",
  "via",
  "not",
  "can",
  "could",
]);

const normalizeText = (value?: string | null): string =>
  (value || "").toLowerCase().trim();

const tokenize = (value?: string | null): string[] => {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
};

export const VendorContacts: React.FC<VendorContactsProps> = ({
  data = [],
  onChange,
  onValidation = () => {},
  setErrors = () => {},
  errors,
  disabled,
  masterVendors: propMasterVendors = [],
  rfpId,
  orgSlug,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<VendorContact>({
    name: "",
    email: "",
    mobileNo: "",
    countryCode: "+91",
    companyName: "",
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({
    name: "",
    email: "",
    mobileNo: "",
    companyName: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Array<{ row: number; errors: string[] }>
  >([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const shouldDisableForm = disabled && (data.length > 0 || !errors?._general);
  const [masterVendors, setMasterVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMasterVendors, setIsLoadingMasterVendors] = useState(false);
  const [vendorLimitInfo, setVendorLimitInfo] = useState<any>(null);
  const [showVendorLimitPopup, setShowVendorLimitPopup] = useState(false);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deliveryLocations, setDeliveryLocations] = useState<string[]>([]);
  const [rfpData, setRfpData] = useState<RFPData | null>(null);
  const [isLoadingRfpData, setIsLoadingRfpData] = useState(false);
  const [showRfpData, setShowRfpData] = useState(true);
  const [hasRfpData, setHasRfpData] = useState(false);
  const [matchingVendors, setMatchingVendors] = useState<Vendor[]>([]);
  const [orgVendors, setOrgVendors] = useState<Vendor[]>([]);
  const [isLoadingOrgVendors, setIsLoadingOrgVendors] = useState(false);

  // Refs to track fetched data
  const hasFetchedData = useRef({
    masterVendors: false,
    rfpData: false,
    vendorLimit: false,
  });

  // Memoized session information
  const sessionInfo = useMemo(
    () => ({
      userId: session?.user?.id,
      orgId: (session?.session as any)?.activeOrganizationId,
      email: session?.user?.email,
      isLoggedIn: !!(
        session?.user?.id && (session?.session as any)?.activeOrganizationId
      ),
    }),
    [
      session?.user?.id,
      (session?.session as any)?.activeOrganizationId,
      session?.user?.email,
    ],
  );

  const isAtLimit = useMemo(() => {
    if (!vendorLimitInfo) return false;
    return data.length >= vendorLimitInfo.maxLimit || vendorLimitInfo.isExpired;
  }, [vendorLimitInfo, data.length]);

  const canAddMore = useMemo(() => {
    if (!vendorLimitInfo) return true;
    return data.length < vendorLimitInfo.maxLimit && !vendorLimitInfo.isExpired;
  }, [vendorLimitInfo, data.length]);

  const shouldDisableAdd = useMemo(() => {
    return (
      shouldDisableForm ||
      isCheckingLimit ||
      isAtLimit ||
      vendorLimitInfo?.isExpired
    );
  }, [
    shouldDisableForm,
    isCheckingLimit,
    isAtLimit,
    vendorLimitInfo?.isExpired,
  ]);

  // -------------------------------------------------------------------------
  // Matching: Category + Description + Tags
  // -------------------------------------------------------------------------
  //
  // A vendor is considered a match for the RFP's BOQ items if ANY of the
  // following is true, evaluated against ANY boq item on the RFP:
  //   1. Category match       — vendor.category equals / contains / is
  //                              contained by the BOQ item's category
  //   2. Tag match             — one of the vendor's tags matches the BOQ
  //                              category or shares a keyword with the BOQ
  //                              description
  //   3. Description match     — the vendor's description shares a
  //                              meaningful keyword with the BOQ description
  //
  // This intentionally casts a slightly wide net (OR, not AND) since Category
  // alone is often too strict (buyers phrase categories slightly differently)
  // while Tags/Description let vendors self-describe their capabilities.
  const findMatchingVendors = useMemo(
    () =>
      (allVendors: Vendor[], rfp: RFPData | null): Vendor[] => {
        if (!rfp || !rfp.boqItems?.length) {
          return [];
        }

        const boqCategoryTexts = rfp.boqItems
          .map((item) => normalizeText(getBoqCategoryText(item)))
          .filter(Boolean);

        const boqCategoryTokens = new Set(
          rfp.boqItems.flatMap((item) => tokenize(getBoqCategoryText(item))),
        );

        const boqDescriptionTokens = new Set(
          rfp.boqItems.flatMap((item) => tokenize(item.description)),
        );

        const boqTagTokens = new Set(
          rfp.boqItems
            .flatMap((item) => item.tags || [])
            .map((tag) => normalizeText(tag))
            .filter(Boolean),
        );

        // Nothing meaningful to match against
        if (
          boqCategoryTexts.length === 0 &&
          boqCategoryTokens.size === 0 &&
          boqDescriptionTokens.size === 0 &&
          boqTagTokens.size === 0
        ) {
          return [];
        }

        return allVendors.filter((vendor) => {
          // Vendor fields can arrive as Postgres array literals (`{"IT Hardware"}`),
          // JSON array strings (`["Desktop"]`), or plain strings — normalize all
          // of them the same way before comparing.
          const vendorCategories = parseFlexibleArrayField(vendor.category).map(
            normalizeText,
          );
          const vendorTags = parseFlexibleArrayField((vendor as any).tags).map(
            normalizeText,
          );
          const vendorDescriptionValues = parseFlexibleArrayField(
            vendor.description,
          );
          const vendorDescriptionTokens = vendorDescriptionValues.flatMap((d) =>
            tokenize(d),
          );

          // 1. Category match (exact or substring, either direction)
          const categoryMatch = vendorCategories.some((vendorCategory) =>
            boqCategoryTexts.some(
              (boqCategory) =>
                boqCategory &&
                vendorCategory &&
                (vendorCategory === boqCategory ||
                  vendorCategory.includes(boqCategory) ||
                  boqCategory.includes(vendorCategory)),
            ),
          );

          // 2. Tag match against BOQ category / description / tag tokens
          const tagMatch = vendorTags.some(
            (tag) =>
              boqCategoryTokens.has(tag) ||
              boqDescriptionTokens.has(tag) ||
              boqTagTokens.has(tag),
          );

          // 3. Description keyword overlap (also checked against BOQ tags)
          const descriptionMatch = vendorDescriptionTokens.some(
            (token) =>
              boqDescriptionTokens.has(token) || boqTagTokens.has(token),
          );

          return categoryMatch || tagMatch || descriptionMatch;
        });
      },
    [],
  );

  // Vendor limit check
  const checkVendorLimit = useCallback(
    async (additionalVendors: number = 0) => {
      return {
        canAdd: true,
        limitInfo: null,
      };
    },
    [],
  );

  const handleVendorLimitCheck = useCallback(
    (canAdd: boolean, limitInfo: any) => {
      if (limitInfo) {
        setVendorLimitInfo((prevInfo: any) => {
          if (
            !prevInfo ||
            prevInfo.currentCount !== limitInfo.currentCount ||
            prevInfo.maxLimit !== limitInfo.maxLimit ||
            prevInfo.isExpired !== limitInfo.isExpired
          ) {
            return {
              ...limitInfo,
              userType: sessionInfo.isLoggedIn ? "organization" : "contact",
            };
          }
          return prevInfo;
        });
      }

      if (!canAdd) {
        setShowVendorLimitPopup(true);
        return false;
      }
      return true;
    },
    [sessionInfo.isLoggedIn],
  );

  // Fetch RFP data (category / description come from BOQ items)
  const fetchRfpData = useCallback(async (rfpId: string) => {
    if (!rfpId) {
      console.warn("RFP ID is undefined, skipping RFP data fetch");
      setHasRfpData(false);
      return null;
    }

    setIsLoadingRfpData(true);
    try {
      const response = await fetch(`/api/rfps/${rfpId}`);
      if (!response.ok) {
        setHasRfpData(false);
        return null;
      }

      const result = await response.json();
      const fetchedRfpData: RFPData = result?.data || result;
      if (fetchedRfpData) {
        setRfpData(fetchedRfpData);
        setCategory(getBoqCategoryText(fetchedRfpData?.boqItems?.[0]));
        setDescription(fetchedRfpData?.boqItems?.[0]?.description || "");

        const rawLocations = fetchedRfpData?.deliveryLocations || [];
        const processedLocations = rawLocations.map((loc: any) => {
          if (typeof loc === "string") return loc;
          return (
            loc?.name ||
            loc?.label ||
            loc?.value ||
            loc?.locationName ||
            "Unknown Location"
          );
        });

        setDeliveryLocations(processedLocations);
        setHasRfpData(true);
        return fetchedRfpData;
      }
      setHasRfpData(false);
      return null;
    } catch (error) {
      console.warn("Could not load additional RFP metadata:", error);
      setRfpData(null);
      setHasRfpData(false);
      return null;
    } finally {
      setIsLoadingRfpData(false);
    }
  }, []);

  // Fetch all approved master vendors
  const fetchMasterVendors = useCallback(async () => {
    setIsLoadingMasterVendors(true);
    try {
      const response = await fetch("/api/gifting-vendor");
      if (!response.ok) throw new Error("Failed to fetch master vendors");
      const vendors = await response.json();
      setMasterVendors(vendors);
      return vendors;
    } catch (error) {
      console.error("Error fetching master vendors:", error);
      toast.error("Failed to load master vendors");
      return [];
    } finally {
      setIsLoadingMasterVendors(false);
    }
  }, []);

  const validateAllContacts = useCallback((): boolean => {
    try {
      const contactsArray = Array.isArray(data) ? data : [];

      if (contactsArray.length === 0) {
        if (hasAttemptedSubmit) {
          setErrors({ _general: "At least one vendor contact is required" });
        }
        onValidation(false);
        return false;
      }

      vendorContactsArraySchema.parse(contactsArray);
      setErrors({});
      onValidation(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length === 0) {
            newErrors["_general"] = err.message;
          } else if (err.path.length === 2) {
            const indexStr = String(err.path[0]);
            const fieldStr = String(err.path[1]);
            newErrors[`${indexStr}_${fieldStr}`] = err.message;
          }
        });
        setErrors(newErrors);
      }
      onValidation(false);
      return false;
    }
  }, [data, hasAttemptedSubmit, setErrors, onValidation]);

  // Initial data fetching effect
  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      if (!hasFetchedData.current.vendorLimit) {
        try {
          const { limitInfo } = await checkVendorLimit(0);
          if (isMounted && limitInfo) {
            setVendorLimitInfo({
              ...(limitInfo as any),
              userType: sessionInfo.isLoggedIn ? "organization" : "contact",
            });
          }
          hasFetchedData.current.vendorLimit = true;
        } catch (error) {
          console.error("Error fetching vendor limit:", error);
        }
      }

      let currentRfpData: RFPData | null = null;
      if (rfpId && !hasFetchedData.current.rfpData) {
        try {
          currentRfpData = await fetchRfpData(rfpId);
          hasFetchedData.current.rfpData = true;
        } catch (error) {
          console.error("Error fetching RFP data:", error);
        }
      }

      if (
        propMasterVendors.length === 0 &&
        !hasFetchedData.current.masterVendors
      ) {
        try {
          const allVendors = await fetchMasterVendors();
          hasFetchedData.current.masterVendors = true;

          if (isMounted && currentRfpData && allVendors.length > 0) {
            const matching = findMatchingVendors(allVendors, currentRfpData);
            setMatchingVendors(matching);
          } else if (isMounted && !rfpId) {
            setMatchingVendors(allVendors);
          }
        } catch (error) {
          console.error("Error fetching master vendors:", error);
        }
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [rfpId, sessionInfo.isLoggedIn]);

  // Stable effect for updating matching vendors
  useEffect(() => {
    const allVendors =
      propMasterVendors.length > 0 ? propMasterVendors : masterVendors;

    if (allVendors.length > 0) {
      let newMatchingVendors: Vendor[] = [];

      if (rfpData) {
        newMatchingVendors = findMatchingVendors(allVendors, rfpData);
      } else if (!rfpId) {
        newMatchingVendors = allVendors;
      } else {
        newMatchingVendors = [];
      }

      setMatchingVendors((prev) => {
        if (
          JSON.stringify(prev.map((v) => v.id)) !==
          JSON.stringify(newMatchingVendors.map((v) => v.id))
        ) {
          return newMatchingVendors;
        }
        return prev;
      });
    }
  }, [masterVendors, propMasterVendors, rfpData, rfpId, findMatchingVendors]);

  // Refetch vendor contacts to get updated email_sent status
  useEffect(() => {
    const refetchVendorContacts = async () => {
      if (!rfpId) return;

      try {
        const response = await fetch(`/api/rfps/${rfpId}`);
        if (response.ok) {
          const rfpResponseData = await response.json();
          if (
            rfpResponseData.vendorContacts &&
            Array.isArray(rfpResponseData.vendorContacts)
          ) {
            onChange(rfpResponseData.vendorContacts);
          }
        }
      } catch (error) {
        console.error("Error refetching vendor contacts:", error);
      }
    };

    refetchVendorContacts();
  }, [rfpId]);

  // Fetch organization-specific vendors
  useEffect(() => {
    const fetchOrgVendors = async () => {
      if (!orgSlug || !sessionInfo.isLoggedIn) {
        setOrgVendors([]);
        return;
      }

      setIsLoadingOrgVendors(true);
      try {
        const response = await fetch(
          `/api/organizations/slug/${orgSlug}/vendors`,
        );
        if (!response.ok) {
          console.error("Failed to fetch organization vendors");
          return;
        }

        const result = await response.json();
        if (result.success && result.vendors) {
          setOrgVendors(result.vendors);
        }
      } catch (error) {
        console.error("Error fetching organization vendors:", error);
      } finally {
        setIsLoadingOrgVendors(false);
      }
    };

    fetchOrgVendors();
  }, [orgSlug, sessionInfo.isLoggedIn]);

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateAllContacts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data, validateAllContacts, initialRender]);

  useEffect(() => {
    if (!hasFetchedData.current.vendorLimit) return;

    const updateVendorLimit = async () => {
      try {
        const { limitInfo } = await checkVendorLimit(0);
        if (limitInfo) {
          const lInfo = limitInfo as any;
          setVendorLimitInfo((prev: any) => {
            if (
              !prev ||
              prev.currentCount !== lInfo.currentCount ||
              prev.maxLimit !== lInfo.maxLimit ||
              prev.isExpired !== lInfo.isExpired
            ) {
              return {
                ...lInfo,
                userType: sessionInfo.isLoggedIn ? "organization" : "contact",
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error updating vendor limit:", error);
      }
    };

    const timeoutId = setTimeout(updateVendorLimit, 300);
    return () => clearTimeout(timeoutId);
  }, [data?.length, sessionInfo?.isLoggedIn]);

  // Filtered vendors for display (apply search filter)
  const matchingMasterVendors = useMemo(() => {
    if (!masterVendors.length) return [];

    if (rfpData) {
      return findMatchingVendors(masterVendors, rfpData);
    }
    return masterVendors;
  }, [masterVendors, rfpData, findMatchingVendors]);

  const matchingOrgVendors = useMemo(() => {
    if (!orgVendors.length) return [];
    return orgVendors;
  }, [orgVendors]);

  const filteredMasterVendors = useMemo(() => {
    if (!searchTerm) return matchingMasterVendors;

    const term = searchTerm.toLowerCase();
    return matchingMasterVendors.filter((vendor) => {
      // vendor.category / tags may be Postgres-array-literal or JSON-array
      // strings — parse before comparing so search works regardless of format.
      const categoryText = displayFlexibleArrayField(
        vendor.category,
      ).toLowerCase();
      const tagsText = displayFlexibleArrayField(
        (vendor as any).tags,
      ).toLowerCase();

      return (
        vendor.name?.toLowerCase().includes(term) ||
        vendor.companyName?.toLowerCase().includes(term) ||
        vendor.email?.toLowerCase().includes(term) ||
        categoryText.includes(term) ||
        tagsText.includes(term)
      );
    });
  }, [matchingMasterVendors, searchTerm]);

  const filteredOrgVendorsForDisplay = useMemo(() => {
    if (!searchTerm) return matchingOrgVendors;

    const term = searchTerm.toLowerCase();
    return matchingOrgVendors.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(term) ||
        vendor.companyName?.toLowerCase().includes(term) ||
        vendor.email?.toLowerCase().includes(term),
    );
  }, [matchingOrgVendors, searchTerm]);

  const validateField = useCallback((fieldName: string, value: string) => {
    try {
      const fieldSchema = vendorContactSchema.pick({
        [fieldName]: true,
      } as any);
      fieldSchema.parse({ [fieldName]: value });
      setContactErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0].toString();
          newErrors[field] = err.message;
        });

        setContactErrors((prev) => ({
          ...prev,
          [fieldName]: newErrors[fieldName] || "",
        }));
      }
    }
  }, []);

  const validateContact = useCallback(
    (contactToValidate: VendorContact): boolean => {
      try {
        vendorContactSchema.parse(contactToValidate);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          error.issues.forEach((err) => {
            const field = err.path[0].toString();
            newErrors[field] = err.message;
          });
          setContactErrors({
            name: newErrors.name || "",
            email: newErrors.email || "",
            mobileNo: newErrors.mobileNo || "",
            companyName: newErrors.companyName || "",
          });
        }
        return false;
      }
    },
    [],
  );

  const resetForm = useCallback(() => {
    setContact({
      name: "",
      email: "",
      mobileNo: "",
      countryCode: "+91",
      companyName: "",
    });
    setContactErrors({
      name: "",
      email: "",
      mobileNo: "",
      companyName: "",
    });
    setEditingIndex(null);
  }, []);

  const addContact = useCallback(async () => {
    setHasAttemptedSubmit(true);
    if (!validateContact(contact)) {
      return;
    }
    const { canAdd, limitInfo } = await checkVendorLimit(1);
    if (!canAdd) {
      handleVendorLimitCheck(canAdd, limitInfo);
      return;
    }

    try {
      const currentData = Array.isArray(data) ? data : [];
      const newData = [...currentData, { ...contact, isNew: true }];
      onChange(newData);
      resetForm();
      toast.success("Contact added successfully");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  }, [
    contact,
    validateContact,
    checkVendorLimit,
    handleVendorLimitCheck,
    data,
    onChange,
    resetForm,
  ]);

  const startEditing = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setContact(data[index]);
    },
    [data],
  );

  const updateContact = useCallback(() => {
    setHasAttemptedSubmit(true);
    if (editingIndex !== null && validateContact(contact)) {
      try {
        const currentData = Array.isArray(data) ? data : [];
        const newData = [...currentData];
        const existingContact = currentData[editingIndex];
        const updatedContact = { ...contact };
        
        if (existingContact.email !== contact.email) {
          updatedContact.email_sent = false;
        }
        
        newData[editingIndex] = updatedContact;
        onChange(newData);
        resetForm();
        toast.success("Contact updated successfully");
      } catch (error) {
        console.error("Error updating contact:", error);
        toast.error("Failed to update contact");
      }
    } else {
      toast.error("Please fill all required fields correctly");
    }
  }, [editingIndex, contact, validateContact, data, onChange, resetForm]);

  const cancelEditing = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const removeContact = useCallback(
    (index: number) => {
      if (data[index]?.email_sent) {
        toast.warning("Cannot delete vendor who has already received the RFQ");
        return;
      }

      try {
        const currentData = Array.isArray(data) ? data : [];
        const newData = currentData.filter((_, i) => i !== index);
        onChange(newData);
        if (editingIndex === index) {
          resetForm();
        } else if (editingIndex !== null && index < editingIndex) {
          setEditingIndex(editingIndex - 1);
        }
        toast.success("Contact removed successfully");
      } catch (error) {
        console.error("Error removing contact:", error);
      }
    },
    [data, editingIndex, onChange, resetForm],
  );

  const handleContactChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setContact((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (contactErrors[name as keyof typeof contactErrors]) {
        setContactErrors((prev) => ({ ...prev, [name]: "" }));
      }
      validateField(name, value);
    },
    [contactErrors, validateField],
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setContact((prev) => ({
        ...prev,
        mobileNo: value || "",
      }));
      if (contactErrors.mobileNo) {
        setContactErrors((prev) => ({ ...prev, mobileNo: "" }));
      }
      validateField("mobileNo", value || "");
    },
    [contactErrors.mobileNo, validateField],
  );

  const handleBulkUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result;
          if (!arrayBuffer) {
            throw new Error("Failed to read file content");
          }

          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("No sheets found in the workbook");
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          if (!Array.isArray(jsonData) || jsonData.length <= 1) {
            throw new Error(
              "No data found in the file or only header row present",
            );
          }
          const headers = ((jsonData[0] as any[]) || []).map((h) =>
            String(h).trim().toLowerCase(),
          );
          const expectedHeaders = [
            "name",
            "company name",
            "email",
            "mobile number",
          ];

          const missingHeaders = expectedHeaders.filter(
            (h) => !headers.includes(h),
          );
          if (missingHeaders.length > 0) {
            throw new Error(
              `Missing required columns: ${missingHeaders.join(", ")}`,
            );
          }

          const rowValidationErrors: Array<{ row: number; errors: string[] }> =
            [];
          const validContacts: VendorContact[] = [];
          (jsonData.slice(1) as any[][]).forEach((row: any[], rowIndex) => {
            if (
              row.every(
                (cell) =>
                  cell === undefined ||
                  cell === null ||
                  String(cell).trim() === "",
              )
            ) {
              return;
            }

            const contact: VendorContact = {
              name: String(row[0] || "").trim(),
              companyName: String(row[1] || "").trim(),
              email: String(row[2] || "").trim(),
              mobileNo: String(row[3] || "").trim(),
              countryCode: "+91",
              email_sent: undefined,
            };

            try {
              vendorContactSchema.parse(contact);
              validContacts.push(contact);
            } catch (error) {
              if (error instanceof z.ZodError) {
                const rowNumber = rowIndex + 2;
                const errorMessages = error.issues.map((e) => e.message);
                rowValidationErrors.push({
                  row: rowNumber,
                  errors: errorMessages,
                });
              }
            }
          });

          if (rowValidationErrors.length > 0) {
            setValidationErrors(rowValidationErrors);
            setShowValidationModal(true);
            setIsLoading(false);
            return;
          }

          if (validContacts.length === 0) {
            toast.error("No valid contacts found in the uploaded file");
            setIsLoading(false);
            return;
          }
          const { canAdd, limitInfo } = await checkVendorLimit(
            validContacts.length,
          );
          if (!canAdd) {
            const maxLimit = (limitInfo as any)?.maxLimit ?? 0;
            const maxAllowed = Math.max(0, maxLimit - data.length);
            toast.error(
              `Cannot add ${validContacts.length} contacts. You can only add ${maxAllowed} more contact${maxAllowed !== 1 ? "s" : ""} (Limit: ${maxLimit}, Current: ${data.length})`,
            );
            handleVendorLimitCheck(canAdd, limitInfo);
            setIsLoading(false);
            return;
          }

          const currentData = Array.isArray(data) ? data : [];
          onChange([...currentData, ...validContacts]);
          setUploadedFile(file.name);
          toast.success(
            `Successfully imported ${validContacts.length} contacts`,
          );
        } catch (error) {
          console.error("Error parsing file:", error);
          toast.error(
            error instanceof Error ? error.message : "Error parsing file",
          );
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error(
          "Error reading the file: " +
            (reader.error?.message || "Unknown error"),
        );
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [checkVendorLimit, handleVendorLimitCheck, data, onChange],
  );

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const downloadSampleExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const headers = ["Name", "Company Name", "Email", "Mobile Number"];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, "Vendor Contacts Template");
    XLSX.writeFile(wb, "vendor-contacts-template.xlsx");
  }, []);

  const handleVendorToggle = useCallback(
    async (vendor: any, isSelected: boolean) => {
      const currentData = Array.isArray(data) ? data : [];

      if (isSelected) {
        if (
          vendorLimitInfo &&
          (data.length >= vendorLimitInfo.maxLimit || vendorLimitInfo.isExpired)
        ) {
          setShowVendorLimitPopup(true);
          return;
        }

        const { canAdd, limitInfo } = await checkVendorLimit(1);
        if (!canAdd) {
          handleVendorLimitCheck(canAdd, limitInfo);
          return;
        }

        const newContact: VendorContact = {
          name: vendor.name || vendor.contactName || vendor.companyName || "",
          email: vendor.email || vendor.contactEmail || "",
          mobileNo:
            vendor.phoneNumber || vendor.mobileNo || vendor.mobile || "",
          countryCode: vendor.countryCode || "+91",
          companyName:
            vendor.companyName ||
            vendor.company ||
            vendor.organizationName ||
            "",
          isNew: true,
          isFromMaster: true,
          masterVendorId: vendor.id,
        };

        const existingIndex = currentData.findIndex(
          (contact) =>
            (contact.email || "") ===
              (vendor.email || vendor.contactEmail || "") &&
            (contact.companyName || "") ===
              (vendor.companyName ||
                vendor.company ||
                vendor.organizationName ||
                ""),
        );

        if (existingIndex === -1) {
          onChange([...currentData, newContact]);
          toast.success(
            `Added ${vendor.name || vendor.companyName || vendor.email || "vendor"} to contacts`,
          );
        } else {
          toast.info(
            `${vendor.name || vendor.companyName || vendor.email || "vendor"} is already in your contacts`,
          );
        }
      } else {
        const updatedData = currentData.filter(
          (contact) =>
            !(
              (contact.email || "") ===
                (vendor.email || vendor.contactEmail || "") &&
              (contact.companyName || "") ===
                (vendor.companyName ||
                  vendor.company ||
                  vendor.organizationName ||
                  "")
            ),
        );
        onChange(updatedData);
        toast.success(
          `Removed ${vendor.name || vendor.companyName || vendor.email || "vendor"} from contacts`,
        );
      }
    },
    [data, vendorLimitInfo, checkVendorLimit, handleVendorLimitCheck, onChange],
  );

  const handleRedirectForVendors = useCallback(() => {
    setShowVendorLimitPopup(false);
    router.push(sessionInfo.isLoggedIn ? "/" : "/");
  }, [router, sessionInfo.isLoggedIn]);

  const handleClosePopup = useCallback(() => {
    setShowVendorLimitPopup(false);
  }, []);

  // Determine what message to show when no vendors are found
  const getNoVendorsMessage = useCallback(() => {
    if (rfpId && rfpData && (category || description)) {
      return {
        title: "No matching vendors found for this RFQ",
        description: `No vendors match the RFQ criteria${
          category ? ` (Category: ${category}` : ""
        }${
          description
            ? `${category ? ", " : " ("}Description: ${description.slice(0, 80)}${description.length > 80 ? "..." : ""})`
            : category
              ? ")"
              : ""
        }. Try adding matching Category / Tags to vendors in the Master Vendor Database.`,
      };
    } else if (rfpId && !rfpData && !isLoadingRfpData) {
      return {
        title: "No RFP data available",
        description: "Unable to load RFP details to filter vendors",
      };
    } else if (rfpId && isLoadingRfpData) {
      return {
        title: "Loading RFP data...",
        description: "Please wait while we load the RFP details",
      };
    } else if (!rfpId) {
      return {
        title: "No vendors available",
        description: "No vendors available in the master database",
      };
    } else {
      return {
        title: "No matching data",
        description: "No vendors match the current criteria",
      };
    }
  }, [rfpId, rfpData, category, description, isLoadingRfpData]);

  const noVendorsMessage = getNoVendorsMessage();

  return (
    <div className="text-sm">
      <p className="text-gray-600 mb-4 text-sm">
        You can either select from Predefined Vendors or Add vendor contacts
        individually / upload a bulk list using the template provided.
      </p>

      {/* Predefined Vendors Selection Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Select from Vendors
        </h3>

        {/* RFP Info Display — now shows Category + Description, the fields matching runs on */}
        {rfpId && rfpData && (category || description) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm font-medium mb-1">
              Filtering vendors based on RFQ&apos;s BOQ Category, Description
              &amp; Tags:
            </p>
            <div className="text-blue-600 text-sm space-y-0.5">
              {category && (
                <div>
                  Category: <strong>{category}</strong>
                </div>
              )}
              {description && (
                <div>
                  Description:{" "}
                  <strong>
                    {description.slice(0, 140)}
                    {description.length > 140 ? "..." : ""}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search/Filter */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search vendors by name, company, category or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            disabled={shouldDisableAdd}
          />
        </div>

        {/* Organization Vendors Section */}
        {sessionInfo.isLoggedIn && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Your Organization&apos;s Vendors
                <span className="text-sm font-normal text-gray-500">
                  ({filteredOrgVendorsForDisplay.length})
                </span>
              </h4>
            </div>

            {isLoadingOrgVendors ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-lg font-medium mb-2">
                  Loading organization vendors...
                </p>
              </div>
            ) : filteredOrgVendorsForDisplay.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium mb-1">
                  No organization vendors found
                </p>
                <p className="text-xs">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Add vendors to your organization to see them here"}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-64 rounded-md border text-sm">
                <OrganizationVendorsTable
                  data={filteredOrgVendorsForDisplay as any}
                  onVendorToggle={handleVendorToggle}
                  addedContacts={data}
                  disabled={shouldDisableAdd}
                  isCheckingLimit={isCheckingLimit}
                />
              </ScrollArea>
            )}
          </div>
        )}
        {/* Master Vendors Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Master Vendor Database
              <span className="text-sm font-normal text-gray-500">
                ({filteredMasterVendors.length})
              </span>
            </h4>
          </div>

          {isLoadingMasterVendors ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-lg font-medium mb-2">
                Loading master vendors...
              </p>
            </div>
          ) : filteredMasterVendors.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium mb-1">
                {noVendorsMessage.title}
              </p>
              <p className="text-xs">{noVendorsMessage.description}</p>
            </div>
          ) : (
            <ScrollArea className="h-96 rounded-md border text-sm">
              <MasterVendorsTable
                data={filteredMasterVendors}
                onVendorToggle={handleVendorToggle}
                addedContacts={data}
                disabled={shouldDisableAdd}
                isCheckingLimit={isCheckingLimit}
              />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Add/Edit Contact Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {editingIndex !== null ? "Edit Contact" : "Add New Contact"}
        </h3>

        {isAtLimit && editingIndex === null && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm font-medium">
              Cannot add new contacts - limit reached ({data.length}/
              {vendorLimitInfo?.maxLimit})
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              className={cn(
                contactErrors.name &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              value={contact.name}
              onChange={handleContactChange}
              placeholder="Enter contact name"
              disabled={shouldDisableAdd}
            />
            {contactErrors.name && (
              <p className="text-destructive text-sm">{contactErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="companyName"
              name="companyName"
              className={cn(
                contactErrors.companyName &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              value={contact.companyName}
              onChange={handleContactChange}
              placeholder="Enter Company Name"
              disabled={shouldDisableAdd}
            />
            {contactErrors.companyName && (
              <p className="text-destructive text-sm">
                {contactErrors.companyName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              className={cn(
                contactErrors.email &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              value={contact.email}
              onChange={handleContactChange}
              placeholder="Enter email address"
              disabled={shouldDisableAdd}
            />
            {contactErrors.email && (
              <p className="text-destructive text-sm">{contactErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <CustomPhoneInput
              value={contact.mobileNo}
              onChange={handlePhoneChange}
              countryCode={contact.countryCode || "+91"}
              onCountryChange={(code) =>
                setContact((prev) => ({ ...prev, countryCode: code }))
              }
              error={contactErrors.mobileNo}
              required={true}
              validateOnChange={true}
              disabled={shouldDisableAdd}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={editingIndex !== null ? updateContact : addContact}
            disabled={
              editingIndex !== null
                ? shouldDisableForm || isCheckingLimit
                : shouldDisableAdd
            }
          >
            {isCheckingLimit
              ? "Checking..."
              : editingIndex !== null
                ? "Update Contact"
                : "Add Contact"}
          </Button>
          {editingIndex !== null && (
            <Button
              variant="outline"
              onClick={cancelEditing}
              disabled={shouldDisableForm}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Bulk Upload</h3>
          <Button onClick={downloadSampleExcel} variant="outline">
            <FaFileDownload className="w-4 h-4 mr-2" /> Download Template
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Upload a <strong>CSV</strong> or <strong>Excel (.xlsx)</strong> file
          using the template format.
        </p>

        {isAtLimit && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm font-medium">
              Cannot upload more vendors - limit reached ({data.length}/
              {vendorLimitInfo?.maxLimit})
            </p>
          </div>
        )}

        <div className="flex flex-col items-center p-6 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg transition-colors duration-200 hover:border-blue-400">
          <div className="flex flex-row items-center gap-4 mb-4">
            <Label
              htmlFor="bulkUpload"
              className={cn(
                "cursor-pointer flex items-center gap-2",
                uploadedFile ? "text-green-600" : "text-blue-600",
                shouldDisableAdd && "cursor-not-allowed opacity-50",
              )}
            >
              <Button
                type="button"
                variant={uploadedFile ? "default" : "outline"}
                className={cn(
                  uploadedFile && "bg-green-600 hover:bg-green-700 text-white",
                  shouldDisableAdd && "cursor-not-allowed",
                )}
                disabled={shouldDisableAdd || isLoading}
                asChild
              >
                <span>
                  <FaUpload className="w-4 h-4 mr-2" />
                  {isLoading
                    ? "Uploading..."
                    : uploadedFile
                      ? "File Selected"
                      : "Choose File"}
                </span>
              </Button>
            </Label>
            {uploadedFile && (
              <Button
                variant="destructive"
                onClick={removeUploadedFile}
                title={`Remove ${uploadedFile}`}
                disabled={shouldDisableForm}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Remove File
              </Button>
            )}
          </div>

          {uploadedFile && (
            <p
              className="text-sm text-gray-700 mb-2 font-medium truncate max-w-xs"
              title={uploadedFile}
            >
              {uploadedFile}
            </p>
          )}

          <input
            type="file"
            id="bulkUpload"
            accept=".csv,.xlsx,.xls"
            onChange={handleBulkUpload}
            className="hidden"
            ref={fileInputRef}
            disabled={isLoading || shouldDisableAdd}
          />

          <p className="text-xs text-gray-500">
            Accepted formats: <strong>.csv, .xlsx, .xls</strong>
          </p>
        </div>
      </div>

      {/* Added Contacts Table */}
      {data && data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Added Contacts ({data.length})
            </h3>
            {vendorLimitInfo && (
              <div className="text-sm text-gray-600">
                Limit: {data.length}/{vendorLimitInfo.maxLimit}
              </div>
            )}
          </div>
         <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="p-1 border border-gray-300 font-medium">
                    S.No.
                  </th>
                  <th className="p-1 border border-gray-300 font-medium">
                    Name
                  </th>
                  <th className="p-1 border border-gray-300 font-medium">
                    Company Name
                  </th>
                  <th className="p-1 border border-gray-300 font-medium">
                    Email
                  </th>
                  <th className="p-1 border border-gray-300 font-medium">
                    Mobile Number
                  </th>
                  <th className="p-1 border border-gray-300 font-medium">
                    Status
                  </th>
                  <th className="p-1 border border-gray-300 font-medium text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((contact, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      editingIndex === index && "bg-blue-50",
                    )}
                  >
                    <td className="p-1 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    <td className="p-1 border border-gray-300">
                      {contact.name}
                    </td>
                    <td className="p-1 border border-gray-300">
                      {contact.companyName}
                    </td>
                    <td className="p-1 border border-gray-300">
                      {contact.email}
                    </td>
                    <td className="p-1 border border-gray-300">
                      {contact.mobileNo}
                    </td>
                    <td className="p-1 border border-gray-300">
                      {contact.email_sent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Email Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-1 border border-gray-300 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          size="icon"
                          onClick={() => startEditing(index)}
                          title="Edit Contact"
                          disabled={
                            editingIndex === index ||
                            (disabled && !contact.isNew)
                          }
                          aria-label="Edit contact"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeContact(index)}
                          title="Remove Contact"
                          disabled={
                            (disabled && !contact.isNew) || contact.email_sent
                          }
                          aria-label="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* General Error Display */}
      {errors?._general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-destructive text-sm">{errors._general}</p>
        </div>
      )}

      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
      />

      {/* Vendor Limit Popup */}
      <VendorLimitPopup
        isOpen={showVendorLimitPopup}
        limitInfo={vendorLimitInfo}
        onRedirect={handleRedirectForVendors}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export { vendorContactSchema, vendorContactsArraySchema };
