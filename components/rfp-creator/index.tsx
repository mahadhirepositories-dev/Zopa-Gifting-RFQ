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

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const getSectionPayload = (
  section: string,
  formData: FormDataStructure,
  selection: SelectionData | null,
) => {
  const payload: Record<string, any> = {};

  if (section === "category" && selection) {
    payload.categorySelection = selection;
  } else if (section === "company" && formData.company) {
    payload.company = formData.company;
  } else if (section === "requirement" && formData.requirement) {
    payload.requirement = formData.requirement;
  } else if (section === "scope" && formData.scope) {
    payload.scope = formData.scope;
  } else if (section === "boq" && formData.boq) {
    payload.boq = formData.boq;
  } else if (
    section === "evaluation" &&
    (formData.evaluation || (formData as any).evaluationCriteria)
  ) {
    payload.evaluationCriteria =
      Array.isArray(formData.evaluation) && formData.evaluation.length > 0
        ? formData.evaluation
        : Array.isArray((formData as any).evaluationCriteria) &&
            (formData as any).evaluationCriteria.length > 0
          ? (formData as any).evaluationCriteria
          : formData.evaluation || (formData as any).evaluationCriteria;
  } else if (section === "financials" && formData.financials) {
    payload.financials = formData.financials;
  } else if (section === "generalTerms" && formData.generalTerms) {
    payload.generalTerms = formData.generalTerms;
  } else if (section === "specialTerms" && formData.specialTerms) {
    payload.specialTerms = formData.specialTerms;
  } else if (
    section === "documents" &&
    (formData.documentsToShare || formData.documents)
  ) {
    payload.documents = formData.documentsToShare || formData.documents;
  } else if (
    section === "vendors" &&
    (formData.vendors || (formData as any).vendorSelection)
  ) {
    payload.vendors = formData.vendors || (formData as any).vendorSelection;
  } else if (
    section === "vendorcontacts" &&
    (formData.vendorcontacts || (formData as any).vendorContacts)
  ) {
    payload.vendorcontacts =
      formData.vendorcontacts || (formData as any).vendorContacts;
  } else if (
    section === "dates" &&
    ((formData as any).rfpDates || (formData as any).dates)
  ) {
    payload.dates = (formData as any).rfpDates || (formData as any).dates;
  }

  return payload;
};

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSavedPayloadMapRef = React.useRef<Record<string, string>>({});
  const isInitialRenderRef = React.useRef<Record<string, boolean>>({});

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

  const saveSectionData = React.useCallback(
    async (section: string, payload: Record<string, any>) => {
      if (!rfpId || Object.keys(payload).length === 0) return;
      const payloadStr = JSON.stringify(payload);
      if (lastSavedPayloadMapRef.current[section] === payloadStr) return;

      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/rfps/${rfpId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payloadStr,
        });
        if (response.ok) {
          lastSavedPayloadMapRef.current[section] = payloadStr;
          setSaveStatus("saved");
          setTimeout(() => {
            setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
          }, 2500);
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.warn(`Failed to auto-save ${section} data:`, err);
        setSaveStatus("error");
      }
    },
    [rfpId],
  );

  const flushPendingSave = React.useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const payload = getSectionPayload(currentSection, formData, selection);
    if (Object.keys(payload).length > 0) {
      const payloadStr = JSON.stringify(payload);
      if (lastSavedPayloadMapRef.current[currentSection] !== payloadStr) {
        saveSectionData(currentSection, payload);
      }
    }
  }, [currentSection, formData, selection, saveSectionData]);

  React.useEffect(() => {
    if (!rfpId) return;

    const currentPayload = getSectionPayload(
      currentSection,
      formData,
      selection,
    );
    if (Object.keys(currentPayload).length === 0) return;

    const currentPayloadStr = JSON.stringify(currentPayload);

    if (!isInitialRenderRef.current[currentSection]) {
      isInitialRenderRef.current[currentSection] = true;
      lastSavedPayloadMapRef.current[currentSection] = currentPayloadStr;
      return;
    }

    if (lastSavedPayloadMapRef.current[currentSection] === currentPayloadStr) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveSectionData(currentSection, currentPayload);
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentSection, formData, selection, rfpId, saveSectionData]);

  const handleClick = async (type: "previous" | "next") => {
    if (rfpId) {
      flushPendingSave();
    }

    const currentIndex = sectionsOrder.indexOf(currentSection);
    if (type === "next") {
      let nextIndex = currentIndex + 1;
      if (sectionsOrder[nextIndex] === "company" && isLoggedIn) {
        nextIndex++;
      }
      if (nextIndex < sectionsOrder.length) {
        navigateToSection(sectionsOrder[nextIndex]);
      }
    } else if (type === "previous") {
      let prevIndex = currentIndex - 1;
      if (sectionsOrder[prevIndex] === "company" && isLoggedIn) {
        prevIndex--;
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
            isFormDisabled={false}
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
            saveStatus={saveStatus}
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
