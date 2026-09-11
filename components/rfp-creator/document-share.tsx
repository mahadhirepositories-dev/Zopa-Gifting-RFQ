/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Remove } from "@/components/svg";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { z } from "zod";

// TypeScript interfaces
interface Document {
  id: string | number;
  name: string;
}

interface DocumentsData {
  documentsToShare?: Document[] | string;
  [key: string]: any;
}

interface DocumentsToShareProps {
  data: DocumentsData;
  onChange: (data: DocumentsData) => void;
  errors?: {
    documentsToShare?: string;
    [key: string]: string | undefined;
  };
  disabled?: boolean;
}

interface PredefinedDocument {
  id: string;
  label: string;
}

// Define Zod schema for validation
export const documentsToShareSchema = z.object({
  documents: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z
          .string()
          .min(1, "Document name cannot be empty")
          .max(100, "Document name cannot exceed 100 characters")
          .refine(
            (name) => !/[<>{}]/.test(name),
            "Document name contains invalid characters",
          ),
      }),
    )
    .min(1, "At least one document must be selected")
    .refine(
      (items) => {
        // Check for unique document names
        const uniqueItems = new Set(items.map((item) => item.name));
        return uniqueItems.size === items.length;
      },
      { message: "Document names must be unique" },
    ),
});

// Skeleton component for loading state hoisted outside render function
const PredefinedDocumentsSkeleton = () => (
  <div className="space-y-3">
    {[...Array(9)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    ))}
  </div>
);

const defaultPredefinedDocs: PredefinedDocument[] = [
  { id: "quote", label: "Quote" },
  { id: "gst", label: "GST certificate" },
  { id: "msme", label: "MSME declaration" },
  { id: "serviceable", label: "List of serviceable location" },
  { id: "installation", label: "Total installation base" },
  { id: "license", label: "License for supply/ performing the work" },
  { id: "vas", label: "VAS" },
  { id: "escalation", label: "Escalation matrix" },
  { id: "experience", label: "Experience document - Client details" },
];

export const DocumentsToShare: React.FC<DocumentsToShareProps> = ({
  data,
  onChange,
  errors = {},
  disabled,
}) => {
  const safeData = data || ({} as DocumentsData);
  const [newDocument, setNewDocument] = useState<string>("");
  const [predefinedDocuments, setPredefinedDocuments] = useState<
    PredefinedDocument[]
  >(defaultPredefinedDocs);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const documents = useMemo(() => {
    const parseDocuments = () => {
      let docInput = safeData.documentsToShare ?? safeData.documents;

      if (!docInput) {
        return [];
      }

      if (typeof docInput === "object" && !Array.isArray(docInput) && docInput !== null) {
        if (docInput.documentsToShare !== undefined) {
          docInput = docInput.documentsToShare;
        } else if (docInput.documents !== undefined) {
          docInput = docInput.documents;
        }
      }

      if (!docInput) return [];

      if (Array.isArray(docInput)) {
        return docInput.map((item, index) => {
          if (typeof item === "string") {
            return { id: `arr-${index}`, name: item };
          }
          return item;
        });
      }

      if (typeof docInput === "string") {
        let str = docInput.trim();
        if (!str || str === "[]" || str === "{}") return [];

        try {
          const parsed = JSON.parse(str);
          if (Array.isArray(parsed)) {
            return parsed.map((item, index) => ({
              id: typeof item === "object" && item?.id ? item.id : `json-${index}`,
              name: typeof item === "object" && item?.name ? item.name : String(item),
            }));
          }
          if (typeof parsed === "object" && parsed !== null && parsed.documentsToShare) {
            str = parsed.documentsToShare;
          }
        } catch {
          // Plain string
        }

        if (typeof str === "string" && str.trim()) {
          return str.split(",").map((name, index) => ({
            id: `str-${index}`,
            name: name.trim(),
          })).filter((doc) => doc.name.length > 0);
        }
      }

      return [];
    };

    return parseDocuments();
  }, [safeData.documentsToShare, safeData.documents]);

  useEffect(() => {
    setPredefinedDocuments(defaultPredefinedDocs);
    setIsLoading(false);
  }, []);

  // Helper function to convert documents array to comma-separated string
  const documentsToString = (docsList: Document[]): string => {
    return docsList.map((doc) => doc.name).join(", ");
  };

  // Validate documents with Zod
  const validateDocuments = (docsList: Document[]) => {
    try {
      documentsToShareSchema.parse({ documents: docsList });
      setErrorMessage(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMsg = error.issues[0]?.message || "Invalid documents";
        setErrorMessage(errorMsg);
        return false;
      }
      setErrorMessage("Validation error occurred");
      return false;
    }
  };

  const handlePredefinedChange = async (
    documentLabel: string,
    checked: boolean,
  ) => {
    let updatedDocuments = [...documents];

    try {
      if (checked) {
        const selectedPredefined = predefinedDocuments.find(
          (doc) => doc.label === documentLabel,
        );

        if (!updatedDocuments.some((doc) => doc.name === documentLabel)) {
          updatedDocuments.push({
            id: selectedPredefined
              ? selectedPredefined.id
              : `pre-${documentLabel}`,
            name: documentLabel,
          });
        }
      } else {
        const docToRemove = updatedDocuments.find(
          (doc) => doc.name === documentLabel,
        );

        if (docToRemove) {
          const isPredefined = predefinedDocuments.some(
            (doc) => doc.id === docToRemove.id,
          );

          if (!isPredefined && typeof docToRemove.id === "number") {
            try {
              await fetch(`/api/documents-share-frontend/${docToRemove.id}`, {
                method: "DELETE",
              });
            } catch (e) {
              console.error("Error deleting custom document", e);
            }
          }
          updatedDocuments = updatedDocuments.filter(
            (doc) => doc.name !== documentLabel,
          );
        }
      }

      if (validateDocuments(updatedDocuments)) {
        const documentsString = documentsToString(updatedDocuments);
        onChange({ ...safeData, documentsToShare: documentsString });
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      if (documents.some((doc) => doc.name === newDocument.trim())) {
        setErrorMessage("Document with this name already exists");
        return;
      }

      if (newDocument.length > 100) {
        setErrorMessage("Document name cannot exceed 100 characters");
        return;
      }

      const invalidCharsRegex = /[<>{}]/;
      if (invalidCharsRegex.test(newDocument)) {
        setErrorMessage("Document name contains invalid characters");
        return;
      }

      const tempId = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const updatedDocuments = [
        ...documents,
        { id: tempId, name: newDocument.trim() },
      ];

      if (validateDocuments(updatedDocuments)) {
        const documentsString = documentsToString(updatedDocuments);
        onChange({ ...safeData, documentsToShare: documentsString });
        setNewDocument("");
        setErrorMessage(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddDocument();
    }
  };

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);

    if (updatedDocuments.length === 0) {
      setErrorMessage("At least one document must be selected");
      onChange({ ...safeData, documentsToShare: "" });
    } else {
      if (validateDocuments(updatedDocuments)) {
        const documentsString = documentsToString(updatedDocuments);
        onChange({ ...safeData, documentsToShare: documentsString });
      }
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const currentDocuments = [...documents];
    const [reorderedItem] = currentDocuments.splice(result.source.index, 1);
    currentDocuments.splice(result.destination.index, 0, reorderedItem);

    const documentsString = documentsToString(currentDocuments);
    onChange({
      ...safeData,
      documentsToShare: documentsString,
    });
  };

  return (
    <div className="bg-white rounded-lg">
      <p className="text-[13px] font-mono text-[#64748B] mb-6">
        Add documents that will be shared with vendors as part of this RFQ.
      </p>

      <div className="space-y-6">
        {/* Predefined Document Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">
            Predefined Documents
          </Label>
          {isLoading ? (
            <PredefinedDocumentsSkeleton />
          ) : (
            <div className="space-y-2.5">
              {predefinedDocuments.length > 0 ? (
                predefinedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`predefined-${doc.id}`}
                      checked={documents.some((d) => d.name === doc.label)}
                      onCheckedChange={(checked) =>
                        handlePredefinedChange(doc.label, checked as boolean)
                      }
                      disabled={disabled}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-[#1E6BFF] focus:ring-[#1E6BFF]"
                    />
                    <Label
                      htmlFor={`predefined-${doc.id}`}
                      className="text-[13px] font-mono text-slate-800 cursor-pointer font-normal"
                    >
                      {doc.label}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-[13px] font-mono text-[#64748B]">
                  No predefined documents available.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Custom Document Addition */}
        <div className="space-y-2">
          <Label
            htmlFor="custom-document"
            className="text-sm font-semibold text-slate-900"
          >
            Custom Documents
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-document"
              type="text"
              value={newDocument}
              onChange={(e) => setNewDocument(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a custom document"
              className="h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B] placeholder:font-mono flex-1"
              disabled={disabled}
            />
            <Button
              onClick={handleAddDocument}
              disabled={!newDocument.trim() || disabled}
              className="bg-[#1E6BFF] hover:bg-[#1557d6] text-white font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl shadow-sm h-11 min-w-[80px]"
            >
              ADD
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <div className="text-destructive text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {errors.documentsToShare && (
          <div className="text-destructive text-sm font-medium">
            {errors.documentsToShare}
          </div>
        )}

        {/* Display Selected Documents */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">
            Selected Documents
          </Label>

          {documents.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="documents-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {documents.map((doc, index) => (
                      <Draggable
                        key={`${doc.id}-${index}`}
                        draggableId={`${doc.id}-${index}`}
                        index={index}
                        isDragDisabled={disabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "border border-[#E2E8F0] bg-white rounded-2xl p-4 shadow-2xs flex items-center justify-between transition-all",
                              snapshot.isDragging &&
                                "shadow-lg border-blue-400",
                            )}
                          >
                            <div className="flex items-center flex-1 space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-slate-400 hover:text-slate-600 shrink-0"
                              >
                                ⠿
                              </div>
                              <span className="font-mono text-[13px] text-slate-900">
                                {doc.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(index)}
                              className="text-red-500 hover:text-red-600 h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                              disabled={disabled}
                            >
                              <Remove expandedCategory={""} categoryName={""} />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="border border-[#E2E8F0] bg-[#F8FAFC]/50 rounded-2xl p-8 text-center shadow-2xs">
              <p className="font-mono text-[13px] text-[#64748B] max-w-lg mx-auto leading-relaxed">
                No documents added yet. Select predefined options or add custom
                documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
