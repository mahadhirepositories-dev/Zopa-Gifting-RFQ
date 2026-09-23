/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Tag, MapPin, Loader2, AlertCircle } from "lucide-react";
import { MultiSelectOptimized } from "@/components/multi-select/category-multiselect";
import {
  categorySelectionSchema,
  type CategoryFieldErrors,
} from "@/lib/validations/rfq-creator-schema";



interface CategoryProps {
  selection: any;
  handleUpdateSelection: (newSelection: any) => void;
  navigateTo: (section: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export interface CategoryHandle {
  validate: () => boolean;
}

interface CategoryItem {
  id: number;
  name: string;
}

interface SubCategoryItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
}

interface TagItem {
  id: number;
  subCategoryId: number;
  subCategoryName: string;
  name: string;
}

const CITY_OPTIONS = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Bengaluru", value: "Bengaluru" },
  { label: "Delhi NCR", value: "Delhi NCR" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Chennai", value: "Chennai" },
  { label: "Pune", value: "Pune" },
  { label: "Kolkata", value: "Kolkata" },
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Pan India", value: "Pan India" },
  { label: "International", value: "International" },
];

const PRIORITY_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Pan India",
];

function parseInitialList(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "string") return [val];
  return [];
}

function serializeSelectionFields(selection: any): string {
  if (!selection) return "";
  return JSON.stringify({
    category: selection.category,
    subCategory: selection.subCategory,
    tags: selection.tags,
    serviceAreas: selection.serviceAreas,
  });
}

export const Category = forwardRef<CategoryHandle, CategoryProps>(
  ({ selection, handleUpdateSelection, onValidationChange }, ref) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
      parseInitialList(selection?.category),
    );
    const [selectedSubCategories, setSelectedSubCategories] = useState<
      string[]
    >(() => parseInitialList(selection?.subCategory));
    const [selectedTags, setSelectedTags] = useState<string[]>(() =>
      parseInitialList(selection?.tags),
    );
    const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
      parseInitialList(selection?.serviceAreas),
    );
    const [prevSelectionKey, setPrevSelectionKey] = useState(() =>
      serializeSelectionFields(selection),
    );
    const selectionKey = serializeSelectionFields(selection);
    if (selection && selectionKey !== prevSelectionKey) {
      setPrevSelectionKey(selectionKey);
      if (selection.category)
        setSelectedCategories(parseInitialList(selection.category));
      if (selection.subCategory)
        setSelectedSubCategories(parseInitialList(selection.subCategory));
      if (selection.tags) setSelectedTags(parseInitialList(selection.tags));
      if (selection.serviceAreas)
        setSelectedAreas(parseInitialList(selection.serviceAreas));
    }

    const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
    const [dbSubCategories, setDbSubCategories] = useState<SubCategoryItem[]>(
      [],
    );
    const [dbTags, setDbTags] = useState<TagItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [customSubCategories, setCustomSubCategories] = useState<string[]>(
      [],
    );
    const [customTags, setCustomTags] = useState<string[]>([]);

    const validation = useMemo(() => {
      const result = categorySelectionSchema.safeParse({
        category: selectedCategories,
        subCategory: selectedSubCategories,
        tags: selectedTags,
        serviceAreas: selectedAreas,
      });

      if (result.success) {
        return { errors: {} as CategoryFieldErrors, isValid: true };
      }

      const fieldErrors: CategoryFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CategoryFieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return { errors: fieldErrors, isValid: false };
    }, [
      selectedCategories,
      selectedSubCategories,
      selectedTags,
      selectedAreas,
    ]);

    const { errors } = validation;
    const [touched, setTouched] = useState<{
      category: boolean;
      serviceAreas: boolean;
    }>({
      category: false,
      serviceAreas: false,
    });

    // Let the parent (Next button) force validation and read the result.
    useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          setTouched({ category: true, serviceAreas: true });
          return validation.isValid;
        },
      }),
      [validation.isValid],
    );

    useEffect(() => {
      async function loadCategoryHierarchy() {
        try {
          setIsLoading(true);
          const res = await fetch("/api/categories");
          if (res.ok) {
            const data = await res.json();
            setDbCategories(data.categories || []);
            setDbSubCategories(data.subCategories || []);
            setDbTags(data.tags || []);
          }
        } catch (err) {
          console.error("Error loading categories hierarchy:", err);
        } finally {
          setIsLoading(false);
        }
      }
      loadCategoryHierarchy();
    }, []);

    useEffect(() => {
      onValidationChange?.(validation.isValid);
    }, [validation.isValid, onValidationChange]);

    const updateParentSelection = (
      cats: string[],
      subCats: string[],
      tags: string[],
      areas: string[],
    ) => {
      handleUpdateSelection({
        ...(selection || {}),
        category: cats.length === 1 ? cats[0] : cats,
        subCategory: subCats.length === 1 ? subCats[0] : subCats,
        tags,
        serviceAreas: areas,
      });
    };

    const categoryOptions = useMemo(() => {
      const dbOptions = dbCategories.map((c) => ({
        label: c.name,
        value: c.name,
      }));
      const customOptions = customCategories.map((c) => ({
        label: c,
        value: c,
      }));
      return [...dbOptions, ...customOptions];
    }, [dbCategories, customCategories]);

    const availableSubCategories = useMemo(() => {
      if (selectedCategories.length === 0) return dbSubCategories;

      const selectedCatIds = dbCategories
        .filter((c) => selectedCategories.includes(c.name))
        .map((c) => c.id);

      return dbSubCategories.filter(
        (sub: { categoryId: number; categoryName: string }) =>
          selectedCatIds.includes(sub.categoryId) ||
          selectedCategories.includes(sub.categoryName),
      );
    }, [selectedCategories, dbCategories, dbSubCategories]);

    const subCategoryOptions = useMemo(() => {
      const dbOptions = availableSubCategories.map((s: { name: any }) => ({
        label: s.name,
        value: s.name,
      }));
      const customOptions = customSubCategories.map((s) => ({
        label: s,
        value: s,
      }));
      return [...dbOptions, ...customOptions];
    }, [availableSubCategories, customSubCategories]);

    const availableTags = useMemo(() => {
      if (selectedSubCategories.length === 0) {
        if (selectedCategories.length === 0) return dbTags;
        const allowedSubIds = availableSubCategories.map(
          (s: { id: any }) => s.id,
        );
        return dbTags.filter((t) => allowedSubIds.includes(t.subCategoryId));
      }

      const selectedSubIds = dbSubCategories
        .filter((s: { name: any }) => selectedSubCategories.includes(s.name))
        .map((s: { id: any }) => s.id);

      return dbTags.filter(
        (t) =>
          selectedSubIds.includes(t.subCategoryId) ||
          selectedSubCategories.includes(t.subCategoryName),
      );
    }, [
      selectedSubCategories,
      selectedCategories,
      availableSubCategories,
      dbSubCategories,
      dbTags,
    ]);

    const tagOptions = useMemo(() => {
      const dbOptions = availableTags.map((t) => ({
        label: t.name,
        value: t.name,
      }));
      const customOptions = customTags.map((t) => ({ label: t, value: t }));
      return [...dbOptions, ...customOptions];
    }, [availableTags, customTags]);

    const handleCategoryChange = (vals: string[]) => {
      setTouched((prev) => ({ ...prev, category: true }));
      setSelectedCategories(vals);
      const validSubCats = availableSubCategories.map(
        (s: { name: any }) => s.name,
      );
      const updatedSubCats = selectedSubCategories.filter(
        (sub: string) =>
          validSubCats.includes(sub) || customSubCategories.includes(sub),
      );

      setSelectedSubCategories(updatedSubCats);
      updateParentSelection(vals, updatedSubCats, selectedTags, selectedAreas);
    };

    const handleSubCategoryChange = (vals: string[]) => {
      setSelectedSubCategories(vals);
      const validTags = availableTags.map((t) => t.name);
      const updatedTags = selectedTags.filter(
        (t) => validTags.includes(t) || customTags.includes(t),
      );

      setSelectedTags(updatedTags);
      updateParentSelection(
        selectedCategories,
        vals,
        updatedTags,
        selectedAreas,
      );
    };

    const handleTagsChange = (vals: string[]) => {
      setSelectedTags(vals);
      updateParentSelection(
        selectedCategories,
        selectedSubCategories,
        vals,
        selectedAreas,
      );
    };

    const handleAreasChange = (vals: string[]) => {
      setTouched((prev) => ({ ...prev, serviceAreas: true }));
      setSelectedAreas(vals);
      updateParentSelection(
        selectedCategories,
        selectedSubCategories,
        selectedTags,
        vals,
      );
    };

    const handleAddNewCategory = (newCat: string) => {
      const trimmed = newCat.trim();
      if (trimmed && !customCategories.includes(trimmed)) {
        setCustomCategories((prev) => [...prev, trimmed]);
      }
    };

    const handleAddNewSubCategory = (newSub: string) => {
      const trimmed = newSub.trim();
      if (trimmed && !customSubCategories.includes(trimmed)) {
        setCustomSubCategories((prev) => [...prev, trimmed]);
      }
    };

    const handleAddNewTag = (newTag: string) => {
      const trimmed = newTag.trim();
      if (trimmed && !customTags.includes(trimmed)) {
        setCustomTags((prev) => [...prev, trimmed]);
      }
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2.5" />
          <span className="text-sm font-medium text-slate-600">
            Loading categories hierarchy...
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Select Gifting Category
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose the category, subcategories, and specialty tags of corporate
            gifts you are requesting quotes for.
          </p>
        </div>

        {/* Multi-Select Input Controls */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Gifting Categories</span>
                <span className="text-red-500">*</span>
              </label>
              <MultiSelectOptimized
                options={categoryOptions}
                onValueChange={handleCategoryChange}
                defaultValue={selectedCategories}
                placeholder="Select or add the category..."
                searchPlaceholder="Search or type custom category..."
                enableAddNew
                onAddNewOption={handleAddNewCategory}
                variant="default"
                maxCount={5}
              />
              {touched.category && errors.category && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Subcategories & Services</span>
              </label>
              <MultiSelectOptimized
                options={subCategoryOptions}
                onValueChange={handleSubCategoryChange}
                defaultValue={selectedSubCategories}
                placeholder="Select or add the subcategory..."
                searchPlaceholder="Search or type custom subcategory..."
                enableAddNew
                onAddNewOption={handleAddNewSubCategory}
                variant="default"
                maxCount={5}
                disabled={
                  selectedCategories.length === 0 &&
                  dbSubCategories.length === 0
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Specialty Tags</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Multiple tags allowed)
                </span>
              </label>
              <MultiSelectOptimized
                options={tagOptions}
                onValueChange={handleTagsChange}
                defaultValue={selectedTags}
                placeholder="Select or add specialty tags..."
                searchPlaceholder="Search or type custom tag..."
                enableAddNew
                onAddNewOption={handleAddNewTag}
                variant="default"
                maxCount={5}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Delivery & Coverage Areas</span>
                <span className="text-red-500">*</span>
              </label>
              <MultiSelectOptimized
                options={CITY_OPTIONS}
                onValueChange={handleAreasChange}
                defaultValue={selectedAreas}
                placeholder="Select coverage areas..."
                searchPlaceholder="Search cities..."
                priorityOptions={PRIORITY_CITIES}
                variant="default"
                maxCount={5}
                showSelectAll={false}
              />
              {touched.serviceAreas && errors.serviceAreas && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.serviceAreas}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Category.displayName = "Category";
