export interface EmailTemplateProps {
  MagicLink: {
    url: string;
  };
  Welcome: {
    username: string;
    verificationUrl: string;
  };
  VerificationOTP: {
    email: string;
    otp: string;
    type: "signup" | "login" | "reset-password";
  };
  RfpMagicLink: {
    url: string;
    rfpName: string;
    companyName: string;
    expiryHours: string;
    contactName: string;
  };
  VendorSubmission: {
    companyName: string;
    projectName: string;
    vendorEmail: string;
    buyerEmail: string;
    url: string;
  };
  BuyerThankYou: {
    companyName: string;
    projectName: string;
    buyerEmail: string;
    url: string;
    vendors: { email: string; companyName: string }[];
  };
  VendorPreviewSubmission: {
    companyName: string;
    projectName: string;
    url: string;
    buyerEmail: string;
    VendorCompanyName: string;
  };
  ExpressInterestSubscription: {
    buyerName: string;
    companyName: string;
    buyerEmail: string;
    phoneNumber: string;
    url: string;
    adminURL: string;
  };
  ApprovalRequest: {
    approverName: string;
    requesterName: string;
    rfpId: string;
    projectName: string;
    comments?: string;
    approvalUrl: string;
    approvalLevel?: number;
  };
  ApprovalDecision: {
    requesterName: string;
    approverName: string;
    rfpId: string;
    projectName: string;
    status: "approved" | "rejected" | "revision_requested";
    comments?: string;
    rfpUrl: string;
    approvalLevel?: number;
  };
  RfpLimitRequest: {
    organizationName: string;
    requesterEmail: string;
    rfpLimit?: number | null;
    buyerLimit?: number | null;
    maxVendorsPerRfp?: number | null;
    creditExpiresAt?: string | null;
    notes?: string;
    requestId: string;
  };
  VendorApproveEmail: {
    vendorCompanyName: string;
    projectName: string;
    buyerCompanyName: string;
    approverName: string;
    approverComments?: string;
    contactEmail: string;
    rfpUrl: string;
  };
  VendorProposalNotSelected: {
    vendorCompanyName: string;
    projectName: string;
    buyerCompanyName: string;
    approverName: string;
    contactEmail: string;
    rfpUrl: string;
    feedbackMessage?: string;
  };
  AllVendorsCompleted: {
    companyName: string;
    projectName: string;
    buyerEmail: string;
    vendorCount: string;
    vendors: Array<{ companyName: string; email: string }>;
    url: string;
  };
  ApprovalProgress: {
    requesterName: string;
    approverName: string;
    rfpId: string;
    projectName: string;
    level: number;
    status: "approved" | "rejected" | "revision_requested";
    comments?: string;
    nextLevel?: number;
    rfpUrl: string;
  };
  RfpCCNotification: RfpCCNotificationData;
  VendorSubmissionCC: VendorSubmissionCCData;
}

export type EmailType = keyof EmailTemplateProps;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  companyName?: string;
  buyerEmail?: string;
  VendorCompanyName?: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  props: Record<string, unknown>;
  companyName?: string;
  VendorCompanyName?: string;
}

export interface ExtendedEmailTemplateProps extends EmailTemplateProps {
  RfpLimitRequest: {
    organizationName: string;
    requesterEmail: string;
    rfpLimit?: number | null;
    buyerLimit?: number | null;
    maxVendorsPerRfp?: number | null;
    creditExpiresAt?: string | null;
    notes?: string;
    requestId: string;
  };
}

export interface VendorRegistrationNotificationData {
  vendorName: string;
  vendorEmail: string;
  companyName: string;
  businessType: string;
  category?: string;
  serviceAreas: string[];
  adminDashboardUrl: string;
}

export interface VendorApprovedNotificationData {
  vendorName: string;
  companyName: string;
  approverName: string;
  dashboardUrl: string;
  contactEmail: string;
}

export interface VendorRejectedNotificationData {
  vendorName: string;
  companyName: string;
  rejectionReason: string;
  contactEmail: string;
  reapplyUrl?: string;
}

export interface OrganizationWelcomeData {
  organizationName: string;
  organizationType: string;
  contactEmail: string;
  dashboardUrl: string;
  supportEmail?: string;
}

export interface CCEmailSettings {
  useOrgDefaults: boolean;
  customEmails: string[];
  enabled: boolean;
}

export interface RfpCCNotificationData {
  ccEmails: string[];
  rfpName: string;
  companyName: string;
  contactName?: string;
  expiredata: string;
  rfpId: string;
  buyerEmail?: string;
  vendors: Array<{ email: string; companyName: string }>;
}

export interface VendorSubmissionCCData {
  ccEmails: string[];
  companyName: string;
  projectName: string;
  vendorEmail: string;
  vendorCompanyName: string;
  buyerEmail: string;
  url: string;
}
