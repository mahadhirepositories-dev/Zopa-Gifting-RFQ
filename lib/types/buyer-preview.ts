/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CompanyDetails {
  companyName: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone: string;
  email: string;
  businessType?: string;
}

export interface ScopeOfWork {
  agreement: any;
  remarks?: string;
}

export interface BOQDetail {
  id: any;
  quotePrice: string | number;
  compliance: string;
  remarks: string;
  gst?: string;
  make?: string;
  model?: string;
}

export interface FinancialTerms {
  budgetTypeAgreement: string;
  currencyAgreement: string;
  pbgAmountAgreement: string;
  pbgAmountRemarks?: string;
  paymentTermsAgreement: string;
  remarks?: string;
  paymentTermsRemarks?: string;
  pbgNotesRemarks?: string;
  financialNotesRemarks?: string;
}

export interface OtherInformation {
  warranty?: string;
  amc?: string;
}

export interface ServicesOffered {
  remarks?: string;
}

export interface BuyerNotes {
  remarks?: string;
}

export interface Attachment {
  documentName: string;
  name: string;
  url?: string;
  size?: number;
  type?: string;
}

export interface GeneralTerms {
  agreement: string | null;
  remarks?: string;
  deliveryTimeValue?: number | string;
  deliveryTimeUnit?: string;
  dispatchLocation?: string;
}

export interface SpecialTerms {
  agreement: string | null;
  remarks?: string;
}

export interface VendorResponse {
  revisions: boolean;
  status: string;
  isDraft: any;
  updatedAt: any;
  revisionNumber: any;
  vendorResponseId: string;
  id: string;
  companydetails: CompanyDetails;
  scopeOfWork?: ScopeOfWork;
  boqDetails?: BOQDetail[];
  financialTerms?: FinancialTerms;
  otherInformation?: OtherInformation;
  servicesOffered?: ServicesOffered;
  buyerNotes?: BuyerNotes;
  attachments?: Attachment[];
  logoUrl?: string;
  generalTerms?: GeneralTerms;
  specialTerms?: SpecialTerms;
  evaluationCriteria?: EvaluationCriteriaProps[];
  vendorId: string;
  qualificationStatus?: string;
}

export interface RFPData {
  projectName?: string;
  contactName?: string;
  companyName?: string;
  address?: string;
  status?: string;
  approvalComments?: string;
}

export interface BuyerPreviewProps {
  rfpData?: RFPData;
  vendorResponses?: any;
  buyerData?: any;
  rfpUniqueId?: string;
  rfpId?: string;
}

export interface EvaluationCriteriaProps {
  deliveryTimeValue: any;
  remarks?: string;
  value?: string;
}

export interface RawVendorResponse {
  revisions: any;
  status: string;
  updatedAt: string;
  revisionNumber: any;
  vendorId: string;
  id?: string;
  vendorResponseId?: string;
  companydetails?: Partial<CompanyDetails>;
  companyDetails?: Partial<CompanyDetails>;
  scopeOfWork?: ScopeOfWork;
  boqDetails?: any[];
  financialTerms?: FinancialTerms;
  otherInformation?: OtherInformation;
  servicesOffered?: ServicesOffered;
  buyerNotes?: BuyerNotes;
  attachments?: Attachment[];
  logoUrl?: string;
  evaluationCriteria?: EvaluationCriteriaProps[];
  generalTerms?: GeneralTerms;
  specialTerms?: SpecialTerms;
  qualificationStatus?: string;
}

export interface BuyerBOQItem {
  additionalSpecs: React.JSX.Element;
  qty: string;
  remarks: string;
  id?: string;
  category?: string;
  description?: string;
  uom?: string;
  quantity?: string | number;
  targetPrice?: string | number;
  specification?: string;
}

export interface VendorBOQDetail {
  id?: string;
  quotePrice?: string | number;
  compliance?: string;
  remarks?: string;
  gst?: string;
  make?: string;
  model?: string;
}

export interface VendorRevision extends VendorResponse {
  _originalVendorId: string;
  _revisionKey: string;
  _uniqueId: string;
  revisionData?: any;
}


