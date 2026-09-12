/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";
import { CompanyIntroduction } from "../section/company-introduction";
import { ScopeOfWork } from "../section/scope-of-work";
import { BOQSection } from "../section/boq-section";
import { EvaluationCriteria } from "../section/evalution-criteria";
import { PaymentTerms } from "../section/payment-terms";
import { GeneralTerms } from "../section/general-terms";
import { SpecialTerms } from "../section/special-terms";
import { SpecialNoteToBuyer } from "../section/exclusions";
import { DocumentAttachments } from "../section/attached-documents";
import { Button } from "@/components/ui/button";
import { SendLogo } from "@/components/svg";

interface VendorReplyFormProps {
  register: ReturnType<typeof useForm<VendorReplyFormData>>["register"];
  watch: ReturnType<typeof useForm<VendorReplyFormData>>["watch"];
  setValue: ReturnType<typeof useForm<VendorReplyFormData>>["setValue"];
  trigger: ReturnType<typeof useForm<VendorReplyFormData>>["trigger"];
  clearErrors: ReturnType<typeof useForm<VendorReplyFormData>>["clearErrors"];
  errors: ReturnType<typeof useForm<VendorReplyFormData>>["formState"]["errors"];
  handleSubmit: ReturnType<typeof useForm<VendorReplyFormData>>["handleSubmit"];
  prepareSubmit: (data: VendorReplyFormData) => void;
  contact: { countryCode: string; mobileNo: string };
  setContact: React.Dispatch<
    React.SetStateAction<{ countryCode: string; mobileNo: string }>
  >;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  logoPreview: string | null;
  logoFileName: string | null;
  buyerData: any;
  itemTotals: {
    itemTotal: number;
    itemGST: number;
    grandTotal: number;
    gstPercentage: number;
  }[];
  expandedSpecs: Record<number, boolean>;
  toggleSpecification: (index: number) => void;
  calculateItemTotal: (index: number) => {
    itemTotal: number;
    itemGST: number;
    grandTotal: number;
    gstPercentage: number;
  };
  overallTotals: { subTotal: number; totalGST: number; grandTotal: number };
  getCurrencySymbol: (currencyCode: any) => string;
  safeParseFloat: (value: any) => number;
  calculationTrigger: number;
  setCalculationTrigger: React.Dispatch<React.SetStateAction<number>>;
  getGSTMessage: () => string | null;
  citiesOptions: { value: string; label: string }[];
  priorityCities: string[];
  loadingCities: boolean;
  requiredDocuments: string[];
  documentValidation: Record<
    number,
    { message: React.ReactNode; valid?: boolean; selected?: boolean }
  >;
  submissionAttempted: boolean;
  documentAttachments: {
    [key: number]: { hasDocument: boolean; documentName: string; files: File[] };
  };
  handleDocumentSelection: (index: number, hasDocument: boolean) => void;
  handleDocumentFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    documentIndex: number,
    documentName: string
  ) => void;
  validateDocuments: () => boolean;
  removeDocumentAttachment: (documentIndex: number, fileIndex: number) => void;
  attachments: File[];
  removeAttachment: (index: number) => void;
  isSubmitted: boolean;
  isloading: boolean | undefined;
  fieldsDisabled: boolean;
  vendorBoqAttachments: Record<number, { url: string; name: string } | null>;
  onBoqAttachmentUpload: (index: number, file: File) => Promise<void>;
  onBoqAttachmentRemove: (index: number) => void;
}

export const VendorReplyForm: React.FC<VendorReplyFormProps> = ({
  register,
  watch,
  setValue,
  trigger,
  clearErrors,
  errors,
  handleSubmit,
  prepareSubmit,
  contact,
  setContact,
  handleFileChange,
  logoPreview,
  logoFileName,
  buyerData,
  itemTotals,
  expandedSpecs,
  toggleSpecification,
  calculateItemTotal,
  overallTotals,
  getCurrencySymbol,
  safeParseFloat,
  calculationTrigger,
  setCalculationTrigger,
  getGSTMessage,
  citiesOptions,
  priorityCities,
  loadingCities,
  requiredDocuments,
  documentValidation,
  submissionAttempted,
  documentAttachments,
  handleDocumentSelection,
  handleDocumentFileChange,
  validateDocuments,
  removeDocumentAttachment,
  attachments,
  removeAttachment,
  isSubmitted,
  isloading,
  fieldsDisabled,
  vendorBoqAttachments,
  onBoqAttachmentUpload,
  onBoqAttachmentRemove,
}) => {
  return (
    <form onSubmit={handleSubmit(prepareSubmit)} className="space-y-8">
      <CompanyIntroduction
        register={register}
        watch={watch}
        setValue={setValue}
        trigger={trigger}
        errors={errors}
        contact={contact}
        setContact={setContact}
        handleFileChange={handleFileChange}
        logoPreview={logoPreview}
        logoFileName={logoFileName}
        fieldsDisabled={fieldsDisabled}
      />

      <ScopeOfWork
        register={register}
        watch={watch}
        setValue={setValue}
        trigger={trigger}
        errors={errors}
        buyerData={buyerData}
      />

      <BOQSection
        register={register}
        watch={watch}
        setValue={setValue}
        trigger={trigger}
        clearErrors={clearErrors}
        errors={errors}
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
        vendorBoqAttachments={vendorBoqAttachments}
        onBoqAttachmentUpload={onBoqAttachmentUpload}
        onBoqAttachmentRemove={onBoqAttachmentRemove}
      />

      <EvaluationCriteria
        register={register}
        watch={watch}
        setValue={setValue}
        trigger={trigger}
        clearErrors={clearErrors}
        errors={errors}
        buyerData={buyerData}
      />

      <PaymentTerms
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        buyerData={buyerData}
      />

      <GeneralTerms
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        buyerData={buyerData}
        citiesOptions={citiesOptions}
        priorityCities={priorityCities}
        loadingCities={loadingCities}
      />

      <SpecialTerms
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
        buyerData={buyerData}
      />

      <SpecialNoteToBuyer
        register={register}
        errors={errors}
        title="8. Special Note to Buyer"
        description="Please provide any additional information or special notes you'd like to share with the buyer."
        placeholder="Enter any special notes or additional information for the buyer..."
      />

      <DocumentAttachments
        requiredDocuments={requiredDocuments}
        documentValidation={documentValidation}
        submissionAttempted={submissionAttempted}
        register={register}
        watch={watch}
        setValue={setValue}
        documentAttachments={documentAttachments}
        handleDocumentSelection={handleDocumentSelection}
        handleDocumentFileChange={handleDocumentFileChange}
        validateDocuments={validateDocuments}
        removeDocumentAttachment={removeDocumentAttachment}
        attachments={attachments}
        handleFileChange={handleFileChange}
        removeAttachment={removeAttachment}
      />

      <div className="flex justify-end space-x-4 me-3">
        <Button
          type="submit"
          onClick={handleSubmit(prepareSubmit)}
          disabled={isSubmitted || isloading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow cursor-pointer"
        >
          {isloading ? (
            <>
              <SendLogo />
              Sending...
            </>
          ) : isSubmitted ? (
            "Submitted ✓"
          ) : (
            "Submit Response"
          )}
        </Button>
      </div>
    </form>
  );
};
