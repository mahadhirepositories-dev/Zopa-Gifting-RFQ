import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type VendorReplyFormData = {
  companydetails: {
    companyName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
    email: string;
    businessType: string;
    logoUpload?: string;
    logoUrl?: string;
  };
  boqDetails: {
    description?: string;
    uom?: string;
    qty?: number;
    targetPrice?: number;
    specification?: string;
    items: {
      id?: string;
      itemName: string;
      quotePrice: number;
      gst: number;
      make?: string;
      model?: string;
      compliance: string;
      remarks?: string;
      vendorAttachmentUrl?: string;
      vendorAttachmentName?: string;
      vendorAttachments?: { url: string; name: string }[];
    }[];
  }[];
  paymentTerms: {
    costTax: boolean;
    paymentSchedule: string;
    prsOrder: boolean;
  };
  financialTerms: {
    budgetType: boolean;
    budgetTypeAgreement: "agree" | "disagree";
    currency: boolean;
    currencyAgreement: "agree" | "disagree";
    pbgAmount?: boolean;
    pbgAmountAgreement?: "agree" | "disagree";
    paymentTerms?: boolean;
    paymentTermsAgreement?: "agree" | "disagree";
    financialNotesAgreement?: "agree" | "disagree";
    pbgNotesAgreement?: "agree" | "disagree";
    remarks?: string;
    pbgAmountRemarks?: string;
    paymentTermsRemarks?: string;
    pbgNotesRemarks?: string;
    financialNotesRemarks?: string;
  };
  generalTerms: {
    remarks: string;
    agreement?: "agree" | "disagree";
    [key: `agreement.${number}`]: "agree" | "disagree";
    deliveryTimeValue?: number | string;
    deliveryTimeUnit?: string;
    deliveryLocations?: string[];
    dispatchLocation: string;
  };
  evaluation: {
    value: string;
    remarks: string;
  }[];
  specialTerms: {
    remarks: string;
    agreement?: "agree" | "disagree";
    [key: `agreement.${number}`]: "agree" | "disagree";
  };
  scopeOfWork: {
    agreement?: "agree" | "disagree";
    remarks?: string;
  };
  buyerNotes: {
    agreement?: "agree" | "disagree";
    remarks?: string;
  };

  servicesOffered: {
    remarks?: string;
  };
  otherInformation: {
    warranty: string;
    amc: string;
  };
  uploadedAttachments: {
    checked: boolean;
  }[];
  attachments: Array<{
    hasDocument?: "yes" | "no";
    files?: File[];
    documentName: string;
    checked: boolean;
  }>;
};

export interface VendorReplyProps {
  rfpId?: string;
  buyerData?: any;
  vendorResponseId?: string | null;
  vendorId?: string | null;
  setIsSubmitted: any;
  isSubmitted?: any;
  vendorDetails?: any;
  isloading?: boolean | undefined;
  setIsloading?: any;
  fromPreview?: boolean;
  organizationVendor?: any;
}

export interface BOQItem {
  id: string;
  description: string;
  qty: string;
  uom?: string;
  targetPrice: string;
  specification?: string;
}

export interface DocumentAttachmentsProps {
  requiredDocuments: string[];
  documentValidation: Record<
    number,
    {
      message: React.ReactNode;
      valid?: boolean;
      selected?: boolean;
    }
  >;
  submissionAttempted: boolean;
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  documentAttachments: {
    [key: number]: {
      hasDocument: boolean;
      documentName: string;
      files: File[];
    };
  };
  handleDocumentSelection: (index: number, hasDocument: boolean) => void;
  handleDocumentFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    documentIndex: number,
    documentName: string
  ) => void;
  validateDocuments: () => void;
  removeDocumentAttachment: (documentIndex: number, fileIndex: number) => void;
  attachments: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
}

export interface DocumentItemProps {
  index: number;
  documentName: string;
  documentValidation: Record<
    number,
    {
      message: React.ReactNode;
      valid?: boolean;
      selected?: boolean;
    }
  >;
  submissionAttempted: boolean;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  documentAttachments: {
    [key: number]: {
      hasDocument: boolean;
      documentName: string;
      files: File[];
    };
  };
  handleDocumentSelection: (index: number, hasDocument: boolean) => void;
  handleDocumentFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    documentIndex: number,
    documentName: string
  ) => void;
  validateDocuments: () => void;
  removeDocumentAttachment: (documentIndex: number, fileIndex: number) => void;
}

export interface UploadedFileProps {
  file: File;
  onRemove: () => void;
  variant?: "default" | "success";
}

export interface AdditionalDocumentsProps {
  attachments: File[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (index: number) => void;
}

export interface SpecialNoteProps {
  register: UseFormRegister<VendorReplyFormData>;
  title?: string;
  description?: string;
  placeholder?: string;
}
