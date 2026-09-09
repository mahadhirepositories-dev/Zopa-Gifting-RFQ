/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { CombinedCompanyContact } from "./combined-company";
import {
  AboutRequirements,
  type AboutRequirementsHandle,
} from "./about-requirements";
import { ScopeOfWork } from "./scope-of-work";
import { BOQ } from "./boq";
import { EvaluationCriteria } from "./evaluation-criteria";
import { Financials } from "./financial";
import { GeneralTerms } from "./general-terms";
import { SpecialTerms } from "./special-terms";
import { DocumentsToShare } from "./document-share";
import { VendorSelection } from "./vendor-selection";
import { VendorContacts } from "./add-vendors";
import { RFPDates } from "./rfp-dates";
import { Preview } from "./rfp-preview";
import { Button } from "@/components/ui/button";
import { Category, type CategoryHandle } from "./category";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, X } from "lucide-react";
import {
  FormDataStructure,
  MainCustomFormDataStructure,
} from "@/lib/types/rfp-main-content-types";
import { useNavigation } from "@/components/navigation-context";

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
}) => {
  const { navigateToSection } = useNavigation();
  const categoryRef = useRef<CategoryHandle>(null);
  const requirementRef = useRef<AboutRequirementsHandle>(null);
  const submittedAllowedSections = ["vendorcontacts", "dates", "preview"];
  const isSectionAllowed =
    !isSubmitted || submittedAllowedSections.includes(activeSection);

  const sectionTitles: Record<string, string> = {
    category: "1. Category",
    company: "Company Introduction",
    requirement: "2. About the Requirement",
    scope: "3. Scope of Work",
    boq: "4. BOQ/BOM",
    evaluation: "5. Evaluation Criteria",
    financials: "6. Financials",
    generalTerms: "7. General Terms & Conditions",
    specialTerms: "8. Special Terms & Conditions",
    documents: "9. Documents to Share",
    vendors: "10. Vendor Selection",
    vendorcontacts: "11. Add Vendors",
    dates: "12. RFQ Start and End Date",
    preview: "13. Preview & Submit",
  };

  const shouldShowPrevious = () => {
    if (activeSection === "category") return false;
    if (isSubmitted) {
      const allowedIndex = submittedAllowedSections.indexOf(activeSection);
      return allowedIndex > 0;
    }
    return true;
  };

  const shouldShowNext = () => {
    if (showContactFlowNavigation && activeSection === "preview") return false;
    if (activeSection === "preview") return false;
    if (isSubmitted) {
      const allowedIndex = submittedAllowedSections.indexOf(activeSection);
      return (
        allowedIndex >= 0 && allowedIndex < submittedAllowedSections.length - 1
      );
    }
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
    handleClick("next");
  };

  if (!isSectionAllowed) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="font-medium mb-2">Section Locked</div>
            This section is no longer accessible because the RFP has been
            submitted. You can only manage vendor contacts, RFP dates, and
            preview the submitted RFP.
          </AlertDescription>
        </Alert>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => navigateToSection("vendorcontacts")}
            className="mr-3"
          >
            Go to Vendor Management
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateToSection("preview")}
          >
            View RFP Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
      <div className="space-y-5">
        {/* Close button for contact flow */}
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

        {/* Title Header */}
        {sectionTitles[activeSection] && (
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {sectionTitles[activeSection]}
          </h2>
        )}

        {isAutoFilling && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-xs text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Auto-filling form data...
            </div>
          </div>
        )}

        {/* Form Components */}
        {activeSection === "category" && !isSubmitted && (
          <Category
            ref={categoryRef}
            selection={selection}
            handleUpdateSelection={handleUpdateSelection}
            navigateTo={navigateToSection}
          />
        )}
        {activeSection === "company" && !isLoggedIn && !isSubmitted && (
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

        {activeSection === "requirement" && !isSubmitted && (
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

        {activeSection === "scope" && !isSubmitted && (
          <ScopeOfWork
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

        {activeSection === "boq" && !isSubmitted && (
          <BOQ
            data={formData.boq || []}
            onChange={handleBOQChange}
            errors={errors}
            disabled={isFormDisabled}
            secondaryQuestionId={0}
          />
        )}

        {activeSection === "evaluation" && !isSubmitted && (
          <EvaluationCriteria
            data={formData?.evaluation}
            onChange={(data) => handleInputChange("evaluation", data)}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "financials" && !isSubmitted && (
          <Financials
            data={formData?.financials || {}}
            onChange={(data) => handleInputChange("financials", data)}
            errors={errors}
            setErrors={() => {}}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "generalTerms" && !isSubmitted && (
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

        {activeSection === "specialTerms" && !isSubmitted && (
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

        {activeSection === "documents" && !isSubmitted && (
          <DocumentsToShare
            data={formData?.documentsToShare}
            onChange={(data) => handleInputChange("documentsToShare", data)}
            errors={errors}
            disabled={isFormDisabled}
          />
        )}

        {activeSection === "vendors" && !isSubmitted && (
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

      {/* Navigation Buttons (Previous / NEXT) */}
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
