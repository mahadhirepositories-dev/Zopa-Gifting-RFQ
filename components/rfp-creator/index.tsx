/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { MainFormContent } from "./main-form-content";
import { PreviewDocument } from "./live-preview";
import Footer from "@/components/Footer";
import { useNavigation } from "@/components/navigation-context";
import {
  SelectionData,
  FormDataStructure,
} from "@/lib/types/rfp-main-content-types";

interface MainContentProps {
  selection: SelectionData | null;
  setSelection: React.Dispatch<React.SetStateAction<SelectionData | null>>;
  formData: FormDataStructure;
  handleInputChange: (section: string, data: any) => void;
  selectedSubCategory: number | null;
  setSelectedSubCategory: React.Dispatch<React.SetStateAction<number | null>>;
  rfpId: string;
  setFormData: React.Dispatch<React.SetStateAction<FormDataStructure>>;
  isSubmitted: boolean;
  isLoggedIn?: boolean;
  orgSlug?: string;
  role?: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({
  selection,
  setSelection,
  formData,
  handleInputChange,
  selectedSubCategory,
  rfpId,
  setFormData,
  isSubmitted,
  isLoggedIn,
  orgSlug,
  role,
}) => {
  const { currentSection, navigateToSection } = useNavigation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading] = useState(false);
  const [isAutoFilling] = useState(false);

  const sectionsOrder = [
    "category",
    "company",
    "requirement",
    "scope",
    "boq",
    "evaluation",
    "financials",
    "generalTerms",
    "specialTerms",
    "documents",
    "vendors",
    "vendorcontacts",
    "dates",
    "preview",
  ];

  const submittedAllowedSections = ["vendorcontacts", "dates", "preview"];

  const handleClick = async (type: "previous" | "next") => {
    if (type === "next" && rfpId) {
      const payload: Record<string, any> = {};

      if (currentSection === "category" && selection) {
        payload.categorySelection = selection;
      } else if (currentSection === "company" && formData.company) {
        payload.company = formData.company;
      } else if (currentSection === "requirement" && formData.requirement) {
        payload.requirement = formData.requirement;
      } else if (currentSection === "scope" && formData.scope) {
        payload.scope = formData.scope;
      } else if (currentSection === "boq" && formData.boq) {
        payload.boq = formData.boq;
      } else if (
        currentSection === "evaluation" &&
        (formData.evaluation || (formData as any).evaluationCriteria)
      ) {
        payload.evaluationCriteria =
          (Array.isArray(formData.evaluation) && formData.evaluation.length > 0)
            ? formData.evaluation
            : (Array.isArray((formData as any).evaluationCriteria) && (formData as any).evaluationCriteria.length > 0)
              ? (formData as any).evaluationCriteria
              : formData.evaluation || (formData as any).evaluationCriteria;
      } else if (currentSection === "financials" && formData.financials) {
        payload.financials = formData.financials;
      } else if (currentSection === "generalTerms" && formData.generalTerms) {
        payload.generalTerms = formData.generalTerms;
      } else if (currentSection === "specialTerms" && formData.specialTerms) {
        payload.specialTerms = formData.specialTerms;
      } else if (
        currentSection === "documents" &&
        (formData.documentsToShare || formData.documents)
      ) {
        payload.documents = formData.documentsToShare || formData.documents;
      } else if (
        currentSection === "vendors" &&
        (formData.vendors || (formData as any).vendorSelection)
      ) {
        payload.vendors = formData.vendors || (formData as any).vendorSelection;
      } else if (
        currentSection === "vendorcontacts" &&
        formData.vendorcontacts
      ) {
        payload.vendorcontacts = formData.vendorcontacts;
      } else if (currentSection === "dates" && (formData as any).rfpDates) {
        payload.dates = (formData as any).rfpDates;
      }

      if (Object.keys(payload).length > 0) {
        try {
          await fetch(`/api/rfps/${rfpId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.warn(`Failed to save ${currentSection} data:`, err);
        }
      }
    }

    const currentIndex = sectionsOrder.indexOf(currentSection);
    if (type === "next") {
      let nextIndex = currentIndex + 1;
      if (sectionsOrder[nextIndex] === "company" && isLoggedIn) {
        nextIndex++;
      }
      if (isSubmitted) {
        while (
          nextIndex < sectionsOrder.length &&
          !submittedAllowedSections.includes(sectionsOrder[nextIndex])
        ) {
          nextIndex++;
        }
      }
      if (nextIndex < sectionsOrder.length) {
        navigateToSection(sectionsOrder[nextIndex]);
      }
    } else if (type === "previous") {
      let prevIndex = currentIndex - 1;
      if (sectionsOrder[prevIndex] === "company" && isLoggedIn) {
        prevIndex--;
      }
      if (isSubmitted) {
        while (
          prevIndex >= 0 &&
          !submittedAllowedSections.includes(sectionsOrder[prevIndex])
        ) {
          prevIndex--;
        }
      }
      if (prevIndex >= 0) {
        navigateToSection(sectionsOrder[prevIndex]);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const section = currentSection;
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [name]: value,
      },
    }));
  };

  const handleScopeChange = (data: any) => {
    handleInputChange("scope", data);
  };

  const handleBOQChange = (boqItems: any[]) => {
    handleInputChange("boq", boqItems);
  };

  const handleDatesChange = (data: any) => {
    handleInputChange("rfpDates", data);
  };

  const handleUpdateSelection = (newSelection: any) => {
    setSelection(newSelection);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex overflow-hidden bg-background h-full">
        <div className="w-1/2 p-6 overflow-y-auto h-full relative bg-white">
          <MainFormContent
            activeSection={currentSection}
            selection={selection}
            formData={formData}
            handleInputChange={handleInputChange}
            selectedSubCategory={selectedSubCategory}
            rfpId={rfpId}
            errors={errors}
            handleChange={handleChange}
            handleScopeChange={handleScopeChange}
            handleBOQChange={handleBOQChange}
            handleDatesChange={handleDatesChange}
            handleUpdateSelection={handleUpdateSelection}
            handleClick={handleClick}
            isFormDisabled={isSubmitted}
            isLoading={isLoading}
            isAutoFilling={isAutoFilling}
            setErrors={setErrors}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
            isLoggedIn={isLoggedIn}
            showContactFlowNavigation={false}
            onCloseContactFlow={() => {}}
            orgSlug={orgSlug}
            role={role || undefined}
          />
        </div>

        {/* Right Column (Live RFQ Document Preview) */}
        <div className="w-1/2 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
          <PreviewDocument data={formData} />
        </div>
      </div>

      {/* Assistance Footer Bar across bottom */}
      <Footer />
    </div>
  );
};
