/* eslint-disable @typescript-eslint/no-explicit-any */
import { Icon } from "@/components/svg";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { AlertCircle, GripVertical, Edit, Trash2, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

interface SpecialTermsData {
  specialTerms: string;
  selectedTerms: string[];
  customTerms: string[];
  customTermIds: Record<string, number>;
  [key: string]: any;
}

interface SpecialTermsProps {
  data: SpecialTermsData;
  onChange: (data: SpecialTermsData) => void;
  errors: {
    specialTerms?: string;
    customTerms?: string;
    [key: string]: string | undefined;
  };
  selectedSubCategory?: number;
  disabled?: boolean;
  boqItems?: any[];
  projectName?: string;
}

export const SpecialTerms: React.FC<SpecialTermsProps> = ({
  data,
  selectedSubCategory,
  onChange,
  errors = {},
  disabled,
  boqItems = [],
  projectName = "",
}) => {
  const safeData = data || ({} as SpecialTermsData);
  const [predefinedTerms, setPredefinedTerms] = useState<any[]>([]);
  const [customTermInput, setCustomTermInput] = useState("");
  const [addingTerm, setAddingTerm] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState<string | null>(null);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editedTermContent, setEditedTermContent] = useState("");
  const editInputRef = useRef<HTMLTextAreaElement | null>(null);
  const prevSubCategoryRef = useRef<number | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Define isCustomTerm outside of other functions so it can be used in dependencies
  const isCustomTerm = useCallback(
    (term: string) => {
      if (!Array.isArray(safeData?.customTerms)) return false;
      return safeData.customTerms?.includes(term) || false;
    },
    [safeData.customTerms]
  );

  const fetchPredefinedTermsCallback = useCallback(async () => {
    if (disabled) return;

    if (!selectedSubCategory) return;
    if (prevSubCategoryRef.current === selectedSubCategory) return;
    prevSubCategoryRef.current = selectedSubCategory;
    try {
      const response = await fetch(`/api/special-terms-frontend`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const options = await response.json();
      const optionsArray = Array.isArray(options) ? options : [options];
      const dataArray = optionsArray?.[0]?.data || [];
      const filteredTerms = dataArray.filter(
        (term: any) => term.secondaryQuestionId === selectedSubCategory
      );
      setPredefinedTerms(filteredTerms);
      const predefinedTextTerms = filteredTerms.map((term: any) => term.text);
      const customTerms = safeData.customTerms || [];
      const newSelectedTerms = [...predefinedTextTerms, ...customTerms];
      const combinedTerms = newSelectedTerms.join("\n\n");

      onChange({
        ...safeData,
        selectedTerms: newSelectedTerms,
        customTerms: customTerms,
        customTermIds: safeData.customTermIds || {},
        specialTerms: combinedTerms,
      });
    } catch (error) {
      console.error("Failed to fetch predefined special terms:", error);
      setPredefinedTerms([]);
    }
  }, [safeData, onChange, selectedSubCategory, disabled]);

  useEffect(() => {
    if (
      selectedSubCategory &&
      selectedSubCategory !== prevSubCategoryRef.current
    ) {
      fetchPredefinedTermsCallback();
    }
  }, [selectedSubCategory, fetchPredefinedTermsCallback]);

  const handleAITermsGenerated = (terms: string[]) => {
    // Merge AI-generated terms with existing custom terms
    const existingCustomTerms = safeData.customTerms || [];
    const newCustomTerms = [...existingCustomTerms];
    
    terms.forEach(term => {
      if (!existingCustomTerms.includes(term)) {
        newCustomTerms.push(term);
      }
    });
    
    // Update selected terms
    const predefinedTextTerms = predefinedTerms.map((term: any) => term.text);
    const newSelectedTerms = [...predefinedTextTerms, ...newCustomTerms];
    const combinedTerms = newSelectedTerms.join("\n\n");
    
    onChange({
      ...safeData,
      customTerms: newCustomTerms,
      selectedTerms: newSelectedTerms,
      specialTerms: combinedTerms,
    });
    
    toast.success(`${terms.length} AI-generated special terms have been added!`);
  };

  useEffect(() => {
    const initialData = { ...safeData };
    if (!initialData.selectedTerms) initialData.selectedTerms = [];
    if (!Array.isArray(initialData.selectedTerms))
      initialData.selectedTerms = [];
    if (!initialData.customTerms) initialData.customTerms = [];
    if (!Array.isArray(initialData.customTerms)) initialData.customTerms = [];
    if (!initialData.customTermIds) initialData.customTermIds = {};

    if (JSON.stringify(initialData) !== JSON.stringify(safeData)) {
      onChange(initialData);
    }
  }, [safeData, onChange]);

  // Focus on edit input when editing starts
  useEffect(() => {
    if (editingTerm && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTerm]);

  const handleCustomTermChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCustomTermInput(e.target.value);
    if (errors.customTerms) {
      onChange({
        ...safeData,
        error: undefined,
      });
    }
  };

  const handleAddCustomTerm = () => {
    if (!customTermInput.trim()) return;

    setAddingTerm(true);

    try {
      const existingTerms = new Set([
        ...(predefinedTerms.map((term: any) => term.text) || []),
        ...(safeData.customTerms || []),
      ]);

      if (existingTerms.has(customTermInput.trim())) {
        setCustomTermInput("");
        return;
      }

      const newCustomTerms = [
        ...new Set([...(safeData.customTerms || []), customTermInput.trim()]),
      ];
      const predefinedTextTerms = predefinedTerms.map((term) => term.text);
      const newSelectedTerms = [
        ...new Set([...predefinedTextTerms, ...newCustomTerms]),
      ];
      const combinedTerms = newSelectedTerms.join("\n\n");

      onChange({
        ...safeData,
        selectedTerms: newSelectedTerms,
        customTerms: newCustomTerms,
        specialTerms: combinedTerms,
      });
      setCustomTermInput("");
    } finally {
      setAddingTerm(false);
    }
  };

  const handleRemoveTerm = (termToRemove: string) => {
    if (!isCustomTerm(termToRemove)) return;

    setDeletingTerm(termToRemove);

    try {
      const newCustomTerms = (safeData.customTerms || []).filter(
        (term) => term !== termToRemove
      );
      const predefinedTextTerms = predefinedTerms.map((term: any) => term.text);
      const newSelectedTerms = [...predefinedTextTerms, ...newCustomTerms];
      const combinedTerms = newSelectedTerms.join("\n\n");

      onChange({
        ...safeData,
        selectedTerms: newSelectedTerms,
        customTerms: newCustomTerms,
        specialTerms: combinedTerms,
      });
    } finally {
      setDeletingTerm(null);
    }
  };

  // Start editing a term
  const handleStartEditTerm = (term: string) => {
    setEditingTerm(term);
    setEditedTermContent(term);
  };

  // Save edited term
  const handleSaveEditTerm = () => {
    if (!editingTerm || !editedTermContent.trim()) return;

    try {
      const currentTerms = [...(safeData.selectedTerms || [])];
      const termIndex = currentTerms.findIndex((term) => term === editingTerm);

      if (termIndex === -1) return;

      currentTerms[termIndex] = editedTermContent.trim();

      const newCustomTerms = [...(safeData.customTerms || [])];
      if (isCustomTerm(editingTerm)) {
        const customTermIndex = newCustomTerms.findIndex(
          (term) => term === editingTerm
        );
        if (customTermIndex !== -1) {
          newCustomTerms[customTermIndex] = editedTermContent.trim();
        }
      }

      const combinedTerms = currentTerms.join("\n\n");

      onChange({
        ...safeData,
        selectedTerms: currentTerms,
        customTerms: newCustomTerms,
        specialTerms: combinedTerms,
      });
    } finally {
      setEditingTerm(null);
      setEditedTermContent("");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTerm(null);
    setEditedTermContent("");
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    if (!Array.isArray(safeData.selectedTerms)) return;

    const newSelectedTerms = Array.from(safeData.selectedTerms);
    const [reorderedItem] = newSelectedTerms.splice(result.source.index, 1);
    newSelectedTerms.splice(result.destination.index, 0, reorderedItem);

    const combinedTerms = newSelectedTerms.join("\n\n");

    onChange({
      ...safeData,
      selectedTerms: newSelectedTerms,
      specialTerms: combinedTerms,
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        {/* <h2 className="text-2xl font-bold text-gray-800">
          8. Special Terms & Conditions
        </h2> */}
        {/* {boqItems && boqItems.length > 0 && (
          <Button
            onClick={() => setShowAIModal(true)}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        )} */}
      </div>

      <div className="space-y-6">
        {/* Customize your own terms */}
        <div className="space-y-2">
          <Label htmlFor="custom-special-terms" className="text-sm font-semibold text-slate-900">
            Customize your own terms:
          </Label>
          <Textarea
            id="custom-special-terms"
            value={customTermInput}
            onChange={handleCustomTermChange}
            placeholder="Enter your custom special terms and conditions here..."
            className={cn(
              "border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B] placeholder:font-mono min-h-[110px]",
              (errors.specialTerms || errors.customTerms) && "border-destructive focus:ring-destructive"
            )}
            rows={4}
            disabled={disabled}
          />
          {(errors.specialTerms || errors.customTerms) && (
            <div className="text-destructive text-sm font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.specialTerms || errors.customTerms}
            </div>
          )}
          <div className="mt-3">
            <Button
              onClick={handleAddCustomTerm}
              disabled={disabled || addingTerm}
              className="bg-[#1E6BFF] hover:bg-[#1557d6] text-white font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl shadow-sm h-10"
            >
              {addingTerm ? "Adding..." : "ADD"}
            </Button>
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-5 mt-6 flex items-start gap-3">
          <div className="text-[#1E6BFF] mt-0.5 shrink-0">
            <Icon expandedCategory={false} categoryName="specialTerms" />
          </div>
          <div>
            <h5 className="font-semibold text-slate-900 text-sm">
              Examples of special terms to consider:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2">
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-mono text-[13px]">
                <li>Non-disclosure agreements</li>
                <li>Specific security requirements</li>
                <li>Performance guarantees</li>
                <li>Warranty terms</li>
              </ul>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 font-mono text-[13px]">
                <li>Licensing requirements</li>
                <li>Specific compliance requirements</li>
                <li>Geographic or location requirements</li>
              </ul>
            </div>
          </div>
        </div>

        {safeData.selectedTerms && safeData.selectedTerms.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
              Selected Terms:
            </h3>

            {safeData.selectedTerms && safeData.selectedTerms.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="special-terms-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {(typeof safeData.selectedTerms[0] === "string" &&
                      safeData.selectedTerms[0].includes("\n")
                        ? safeData.selectedTerms[0]
                            .split("\n")
                            .filter((term) => term.trim() !== "")
                        : safeData.selectedTerms
                      ).map((term: string, index: number) => (
                        <Draggable
                          key={`${term}-${index}`}
                          draggableId={`${term}-${index}`}
                          index={index}
                          isDragDisabled={disabled || editingTerm === term}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "border border-[#E2E8F0] bg-white rounded-2xl p-5 shadow-2xs transition-all",
                                snapshot.isDragging && "shadow-lg border-blue-400"
                              )}
                            >
                              {editingTerm === term ? (
                                // Term editing mode
                                <div className="space-y-3">
                                  <Textarea
                                    ref={editInputRef}
                                    value={editedTermContent}
                                    onChange={(e) =>
                                      setEditedTermContent(e.target.value)
                                    }
                                    className="min-h-[90px] border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-3.5 text-[13px] font-mono text-slate-900"
                                    disabled={disabled}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditTerm}
                                      disabled={disabled}
                                      className="bg-[#1E6BFF] hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-mono text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      disabled={disabled}
                                      className="rounded-xl px-4 py-2 font-mono text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Normal term display mode
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start flex-1 gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab text-slate-400 hover:text-slate-600 mt-0.5 shrink-0"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <span className="font-mono text-[13px] text-slate-900 leading-relaxed flex-1">
                                      {term.trim()}
                                    </span>
                                    {isCustomTerm(term) && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 shrink-0"
                                      >
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditTerm(term)}
                                      className="text-[#1E6BFF] hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                      disabled={disabled}
                                      title="Edit term"
                                    >
                                      <Edit className="h-4 w-4 text-[#1E6BFF]" />
                                    </button>

                                    {isCustomTerm(term) && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTerm(term)}
                                        className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                        disabled={disabled || deletingTerm === term}
                                        title="Delete term"
                                      >
                                        {deletingTerm === term ? (
                                          <span className="text-xs font-mono">...</span>
                                        ) : (
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
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
              <div className="border border-[#E2E8F0] bg-white rounded-2xl p-6 text-center shadow-2xs">
                <p className="font-mono text-[13px] text-[#64748B]">
                  No terms selected yet. Add custom terms or select from
                  predefined options.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
