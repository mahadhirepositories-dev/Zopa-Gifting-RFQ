/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef } from "react";
import { CombinedCompanyContact } from "./combined-company";
import {
  AboutRequirements,
  type AboutRequirementsHandle,
} from "./about-requirements";
import { ScopeOfWork, type ScopeOfWorkHandle } from "./scope-of-work";
import { BOQ, type BOQHandle } from "./boq/index";
import {
  EvaluationCriteria,
  type EvaluationCriteriaHandle,
} from "./evaluation-criteria";
import { Financials, type FinancialsHandle } from "./financial";
import { GeneralTerms } from "./general-terms";
import { SpecialTerms } from "./special-terms";
import { DocumentsToShare } from "./document-share";
import { VendorSelection } from "./vendor-selection";
import { VendorContacts } from "./add-vendors";
import { RFPDates } from "./rfp-dates";
import { Preview } from "./rfp-preview";
import { Button } from "@/components/ui/button";
import { Category, type CategoryHandle } from "./category";
import { X, CloudUpload, CheckCircle2, AlertCircle } from "lucide-react";
import {
  FormDataStructure,
  MainCustomFormDataStructure,
} from "@/lib/types/rfp-main-content-types";
import { useNavigation } from "@/components/navigation-context";
import type { SaveStatus } from "./index";

interface MainFormContentProps extends MainCustomFormDataStructure {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleScopeChange: (data: any) => void;
  handleBOQChange: (boqItems: any[]) => void;
  handleDatesChange: (data: any) => void;
  handleUpdateSelection: (newSelection: any) => void;
  handleClick: (type: "previous" | "next") => void;
  isFormDisabled: boolean;
  isLoading: boolean;
  isAutoFilling: boolean;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFormData: React.Dispatch<React.SetStateAction<FormDataStructure>>;
  errors: Record<string, string>;
  isSubmitted: boolean;
  isLoggedIn?: boolean;
  showContactFlowNavigation: boolean;
  onCloseContactFlow: () => void;
  orgSlug?: string;
  role?: string;
  saveStatus?: SaveStatus;
}

export const MainFormContent: React.FC<MainFormContentProps> = ({
  activeSection,
  selection,
  formData,
  handleInputChange,
  selectedSubCategory,
  rfpId,
  errors,
  handleChange,
  handleScopeChange,
  handleBOQChange,
  handleDatesChange,
  handleUpdateSelection,
  handleClick,
  isFormDisabled,
  isLoading,
  isAutoFilling,
  setErrors,
  setFormData,
  isSubmitted,
  isLoggedIn,
  showContactFlowNavigation,
  onCloseContactFlow,
  orgSlug,
  saveStatus = "idle",
}) => {
  const { navigateToSection } = useNavigation();
  const categoryRef = useRef<CategoryHandle>(null);
  const requirementRef = useRef<AboutRequirementsHandle>(null);
  const scopeRef = useRef<ScopeOfWorkHandle>(null);
  const boqRef = useRef<BOQHandle>(null);
  const evaluationRef = useRef<EvaluationCriteriaHandle>(null);
  const financialsRef = useRef<FinancialsHandle>(null);
  const sectionTitles: Record<string, string> = {
    category: "1. Category",
    company: "Company Introduction",
    requirement: "2. About the Requirement",
    scope: "3. Scope of Work",
    boq: "4. BOQ/BOM",
    evaluation: "5. Evaluation Criteria",
    financials: "6. Financial Information",
    generalTerms: "7. General Terms & Conditions",
    specialTerms: "8. Special Terms & Conditions",
    documents: "9. Documents to Share",
    vendors: "10. Vendor Selection Process",
    vendorcontacts: "11. Add Vendor Contacts",
    dates: "12. RFQ Dates",
    preview: "13. Preview & Submit",
  };

  const shouldShowPrevious = () => {
    if (activeSection === "category") return false;
    if (activeSection === "preview") return false;
    return true;
  };

  const shouldShowNext = () => {
    if (showContactFlowNavigation && activeSection === "preview") return false;
    if (activeSection === "preview") return false;
    return true;
  };

  const handleNextClick = () => {
    if (activeSection === "category") {
      const isValid = categoryRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    if (activeSection === "requirement") {
      const isValid = requirementRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    if (activeSection === "scope") {
      const isValid = scopeRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    if (activeSection === "boq") {
      const isValid = boqRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    if (activeSection === "evaluation") {
      const isValid = evaluationRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    if (activeSection === "financials") {
      const isValid = financialsRef.current?.validate() ?? true;
      if (!isValid) return;
    }
    handleClick("next");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
      <div className="space-y-5">
        {showContactFlowNavigation && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onCloseContactFlow}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        )}

        {sectionTitles[activeSection] && (
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {sectionTitles[activeSection]}
            </h2>
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                Auto-saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 transition-all duration-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Save failed
              </span>
            )}
          </div>
        )}

        {isAutoFilling && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-xs text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Auto-filling form data...
            </div>
          </div>
        )}

        {activeSection === "category" && (
          <Category
            ref={categoryRef}
            selection={selection}
            handleUpdateSelection={handleUpdateSelection}
            navigateTo={navigateToSection}
          />
        )}
        {activeSection === "company" && (
          <CombinedCompanyContact
            data={{
              ...formData.company,
              ...formData.contact,
              companyName: formData.company?.name || "",
              companyAddressLine1: formData.company?.addressLine1 || "",
              companyAddressLine2: formData.company?.addressLine2 || "",
              companyCity: formData.company?.city || "",
              companyState: formData.company?.state || "",
              companyPostalCode: formData.company?.postalCode || "",
              companyCountry: formData.company?.country || "",
              businessType: formData.company?.businessType || "",
            }}
            onChange={handleChange}
            errors={errors}
            values={{
              ...formData.company,
              ...formData.contact,
              companyName: formData.company?.name || "",
              companyAddressLine1: formData.company?.addressLine1 || "",
              companyAddressLine2: formData.company?.addressLine2 || "",
              companyCity: formData.company?.city || "",
              companyState: formData.company?.state || "",
              companyPostalCode: formData.company?.postalCode || "",
              companyCountry: formData.company?.country || "",
              businessType: formData.company?.businessType || "",
            }}
            disabled={isFormDisabled}
            rfpId={rfpId}
          />
        )}

        {activeSection === "requirement" && (
          <AboutRequirements
            ref={requirementRef}
            data={formData.requirement || {}}
            onChange={handleChange}
            errors={errors}
            values={formData.requirement || {}}
            disabled={isFormDisabled}
            isLoggedIn={isLoggedIn}
            orgSlug={orgSlug}
          />
        )}

        {activeSection === "scope" && (
          <ScopeOfWork
            ref={scopeRef}
            data={formData?.scope}
            onChange={handleScopeChange}
            selectedSubCategory={selectedSubCategory ?? undefined}
            onNext={() => {}}
            onError={(message) => {
              if (message === "") {
                setErrors((prev: any) => {
                  const newErrors = { ...prev };
                  delete newErrors.scope;
                  return newErrors;
                });
              } else {
                setErrors((prev: any) => ({ ...prev, scope: message }));
              }
            }}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "boq" && (
          <BOQ
            ref={boqRef}
            data={formData.boq || []}
            onChange={handleBOQChange}
            errors={errors}
            disabled={isFormDisabled}
            secondaryQuestionId={0}
          />
        )}

        {activeSection === "evaluation" && (
          <EvaluationCriteria
            ref={evaluationRef}
            data={formData?.evaluation}
            onChange={(data) => handleInputChange("evaluation", data)}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "financials" && (
          <Financials
            ref={financialsRef}
            data={formData?.financials || {}}
            onChange={(data) => handleInputChange("financials", data)}
            errors={errors}
            setErrors={setErrors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "generalTerms" && (
          <GeneralTerms
            data={formData.generalTerms}
            onChange={(updatedData) => {
              handleInputChange("generalTerms", {
                ...formData.generalTerms,
                ...updatedData,
              });
            }}
            errors={errors}
            setErrors={() => {}}
            selectedSubCategory={selectedSubCategory ?? undefined}
            disabled={isFormDisabled}
            boqItems={formData.boq || []}
            projectName={formData.requirement?.projectName || ""}
          />
        )}

        {activeSection === "specialTerms" && (
          <SpecialTerms
            data={formData?.specialTerms}
            onChange={(data) => handleInputChange("specialTerms", data)}
            errors={errors}
            selectedSubCategory={selectedSubCategory ?? undefined}
            disabled={isFormDisabled}
            boqItems={formData.boq || []}
            projectName={formData.requirement?.projectName || ""}
          />
        )}

        {activeSection === "documents" && (
          <DocumentsToShare
            data={formData?.documentsToShare}
            onChange={(data) => handleInputChange("documentsToShare", data)}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "vendors" && (
          <VendorSelection
            data={formData?.vendors}
            onChange={(data) => handleInputChange("vendors", data)}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "vendorcontacts" && (
          <VendorContacts
            data={
              Array.isArray(formData.vendorContacts)
                ? formData.vendorContacts
                : []
            }
            onChange={(vendorContacts) => {
              setFormData((prev: any) => ({ ...prev, vendorContacts }));
            }}
            errors={errors}
            setErrors={() => {}}
            disabled={isLoading}
            rfpId={rfpId}
            orgSlug={orgSlug}
          />
        )}

        {activeSection === "dates" && (
          <RFPDates
            data={formData?.rfpDates}
            onChange={handleDatesChange}
            errors={errors}
            disabled={isLoading}
            rfpId={rfpId !== null ? String(rfpId) : undefined}
            isEditMode={!!rfpId}
          />
        )}

        {activeSection === "preview" && (
          <Preview
            formData={formData}
            categorySelections={selection}
            activeSection={activeSection}
            data={formData}
            isSubmitting={false}
            handleClick={() => handleClick("previous")}
            navigateTo={navigateToSection}
            rfpId={rfpId !== null ? String(rfpId) : undefined}
            disabled={isFormDisabled}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>

      {(shouldShowPrevious() || shouldShowNext()) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
          {shouldShowPrevious() ? (
            <button
              type="button"
              onClick={() => handleClick("previous")}
              disabled={isLoading || isAutoFilling}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase px-5 py-2.5 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {shouldShowNext() && (
            <button
              type="button"
              onClick={handleNextClick}
              disabled={isLoading || isAutoFilling}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-md shadow-sm transition-colors cursor-pointer ml-auto"
            >
              NEXT
            </button>
          )}
        </div>
      )}
    </div>
  );
};
