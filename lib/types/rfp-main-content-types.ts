/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SelectionData {
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

export interface FormDataStructure {
  company?: any;
  requirement?: any;
  scope?: any;
  boq?: any[];
  evaluation?: any;
  financials?: any;
  generalTerms?: any;
  specialTerms?: any;
  documentsToShare?: any;
  contact?: any;
  vendors?: any;
  vendorContacts?: any[];
  rfpDates?: any;
  organizationName?: string;
  logo?: any;
  [key: string]: any;
}

export interface MainCustomFormDataStructure {
  activeSection: string;
  selection: SelectionData | null;
  formData: FormDataStructure;
  handleInputChange: (section: string, data: any) => void;
  selectedSubCategory: number | null;
  rfpId: string;
}
