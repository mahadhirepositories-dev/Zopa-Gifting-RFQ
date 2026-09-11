/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as XLSX from "xlsx";
import { FaTrash, FaUpload, FaFileDownload, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/search";
import { BOQFormSkeleton } from "./boq-form-skeleton";
import { z } from "zod";
import { ValidationErrorModal } from "./errorvalidate";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpecificationModal } from "./specification-modal";
import { Sparkles } from "lucide-react";
import { BOQAttachments, Attachment } from "./boq-attachments";
import { v4 as uuidv4 } from "uuid";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BOQItem {
  id?: number;
  category: string;
  description: string;
  uom: string;
  qty: string;
  targetPrice: string;
  specification: string;
  remarks: string;
  isVisible?: boolean;
  itemRef?: string;
  attachments?: Attachment[];
}

export interface BOQHandle {
  validate: () => boolean;
}

interface BOQProps {
  data: BOQItem[];
  onChange: (data: BOQItem[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  secondaryQuestionId?: number;
}

interface RawDBItem {
  id: number;
  categoryId: number;
  categoryName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ProcessedCategory {
  category: string;
  descriptions: string[];
}

const defaultItemState: BOQItem = {
  category: "",
  description: "",
  uom: "",
  qty: "",
  targetPrice: "",
  specification: "",
  remarks: "",
  isVisible: false,
  itemRef: uuidv4(),
  attachments: [],
};

const defaultItemErrorsState = {
  category: "",
  description: "",
  uom: "",
  qty: "",
  targetPrice: "",
  specification: "",
};

const decimalRegex = /^\d+(\.\d+)?$/;

export const boqSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  uom: z.string().min(1, "Unit of Measure is required"),
  qty: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => decimalRegex.test(val), {
      message: "Quantity must be a positive number (e.g., 5 or 5.25)",
    }),
  targetPrice: z
    .string()
    .min(1, "Target price is required")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message:
          "Target price must be a valid number (0 or positive, e.g., 0, 10.99)",
      },
    ),
  specification: z.string().min(1, "Specification is required"),
  remarks: z.string().optional(),
  isVisible: z.boolean().optional(),
  itemRef: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

// ─── Component ────────────────────────────────────────────────────────────────

export const BOQ = forwardRef<BOQHandle, BOQProps>(
  ({ data = [], onChange, errors, disabled }, ref) => {
    const validate = useCallback(() => {
      if (!data || data.length === 0) {
        toast.error("Please add at least one BOQ item before proceeding.");
        return false;
      }
      return true;
    }, [data]);

    useImperativeHandle(ref, () => ({ validate }), [validate]);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [rawCategoryItems, setRawCategoryItems] = useState<RawDBItem[]>([]);
    const [processedCategories, setProcessedCategories] = useState<
      ProcessedCategory[]
    >([]);
    const [localCategories, setLocalCategories] = useState<string[]>([]);
    const [localDescriptions, setLocalDescriptions] = useState<
      Record<string, string[]>
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [item, setItem] = useState<BOQItem>({
      ...defaultItemState,
      itemRef: uuidv4(),
    });
    const [itemErrors, setItemErrors] = useState(defaultItemErrorsState);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [validationErrors, setValidationErrors] = useState<
      Array<{ row: number; errors: string[] }>
    >([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showSpecModal, setShowSpecModal] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    // ─── Stable ref so the attachment effect never has onChange in its deps ──
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Track which itemRefs we've already loaded attachments for
    const fetchedRefsRef = useRef<Set<string>>(new Set());

    // Fetch attachments for existing items when data loads / itemRefs change
    useEffect(() => {
      const fetchAttachmentsForItems = async () => {
        if (!data || data.length === 0) return;

        const itemsNeedingFetch = data.filter(
          (item) =>
            item.itemRef &&
            !fetchedRefsRef.current.has(item.itemRef) &&
            (!item.attachments || item.attachments.length === 0),
        );

        if (itemsNeedingFetch.length === 0) return;

        // Mark as "being fetched" immediately to prevent double-fetch
        itemsNeedingFetch.forEach((item) => {
          if (item.itemRef) fetchedRefsRef.current.add(item.itemRef);
        });

        const updatedData = [...data];
        let hasChanges = false;

        for (const item of itemsNeedingFetch) {
          const index = updatedData.findIndex(
            (d) => d.itemRef === item.itemRef,
          );
          if (index === -1) continue;

          try {
            const response = await fetch(
              `/api/boq-attachments?boqItemRef=${item.itemRef}`,
            );
            if (response.ok) {
              const attachments = await response.json();
              if (attachments && attachments.length > 0) {
                updatedData[index] = { ...updatedData[index], attachments };
                hasChanges = true;
              }
            }
          } catch (error) {
            console.error(
              `Failed to fetch attachments for ${item.itemRef}:`,
              error,
            );
          }
        }

        if (hasChanges) {
          onChangeRef.current(updatedData);
        }
      };

      fetchAttachmentsForItems();
      // Only re-run when the set of itemRefs changes (items added/removed)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.map((d) => d.itemRef).join(",")]);

    const handleCategoryTabOut = () => descriptionRef.current?.focus();

    const processRawData = useCallback(
      (rawData: RawDBItem[]): ProcessedCategory[] => {
        const categoryMap = new Map<string, Set<string>>();
        rawData.forEach((dbItem) => {
          const categoryName = dbItem.categoryName;
          if (!categoryMap.has(categoryName))
            categoryMap.set(categoryName, new Set());
          categoryMap.get(categoryName)?.add(dbItem.description);
        });
        const result: ProcessedCategory[] = [];
        categoryMap.forEach((descriptionsSet, categoryName) => {
          result.push({
            category: categoryName,
            descriptions: Array.from(descriptionsSet),
          });
        });
        result.sort((a, b) => a.category.localeCompare(b.category));
        return result;
      },
      [],
    );

    useEffect(() => {
      const fetchCategoryItems = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/boq-items-frontend");
          if (!response.ok)
            throw new Error(
              `Failed to fetch BOQ items: ${response.statusText}`,
            );
          const fetchedData: RawDBItem[] = await response.json();
          setRawCategoryItems(fetchedData);
          setProcessedCategories(processRawData(fetchedData));
        } catch (error) {
          console.error("Error fetching BOQ items:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategoryItems();
    }, [processRawData]);

    const uniqueCategories = useMemo(
      () => processedCategories.map((i) => i.category),
      [processedCategories],
    );

    const allCategories = useMemo(() => {
      const combined = Array.from(
        new Set([...uniqueCategories, ...localCategories]),
      );
      combined.sort((a, b) => a.localeCompare(b));
      return combined;
    }, [uniqueCategories, localCategories]);

    const availableDescriptions = useMemo(() => {
      if (!item.category) return [];
      const selectedCategoryData = processedCategories.find(
        (cat) => cat.category === item.category,
      );
      const dbDescriptions = selectedCategoryData?.descriptions || [];
      const userAddedDescriptions = localDescriptions[item.category] || [];
      const combined = Array.from(
        new Set([...dbDescriptions, ...userAddedDescriptions]),
      );
      combined.sort((a, b) => a.localeCompare(b));
      return combined;
    }, [item.category, processedCategories, localDescriptions]);

    const uomOptions = useMemo(
      () => [
        "Nos",
        "Each",
        "Pair",
        "Dozen",
        "Box",
        "Pack",
        "Set",
        "Kit",
        "Unit",
        "Meter",
        "Foot",
        "Inch",
        "Kilogram",
        "Gram",
        "Liter",
        "Gallon",
        "Hour",
        "Day",
        "Week",
        "Month",
        "Year",
      ],
      [],
    );

    const handleAddNewCategory = (newCategory: string) => {
      if (newCategory && !allCategories.includes(newCategory)) {
        setLocalCategories((prev) =>
          [...prev, newCategory].sort((a, b) => a.localeCompare(b)),
        );
      }
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
      setLocalCategories((prev) => prev.filter((c) => c !== categoryToRemove));
      setLocalDescriptions((prev) => {
        const updated = { ...prev };
        delete updated[categoryToRemove];
        return updated;
      });
      if (item.category === categoryToRemove)
        setItem((prev) => ({ ...prev, category: "", description: "" }));
    };

    const handleAddNewDescription = (newDescription: string) => {
      if (
        item.category &&
        newDescription &&
        !availableDescriptions.includes(newDescription)
      ) {
        setLocalDescriptions((prev) => {
          const currentDescs = prev[item.category] || [];
          return {
            ...prev,
            [item.category]: [...currentDescs, newDescription].sort((a, b) =>
              a.localeCompare(b),
            ),
          };
        });
      }
    };

    const handleRemoveDescription = (descriptionToRemove: string) => {
      if (item.category) {
        setLocalDescriptions((prev) => {
          const updated = { ...prev };
          if (updated[item.category]) {
            updated[item.category] = updated[item.category].filter(
              (d) => d !== descriptionToRemove,
            );
            if (updated[item.category].length === 0)
              delete updated[item.category];
          }
          return updated;
        });
        if (item.description === descriptionToRemove)
          setItem((prev) => ({ ...prev, description: "" }));
      }
    };

    const isCustomCategory = (category: string) =>
      localCategories.includes(category);
    const isCustomDescription = (description: string) => {
      if (!item.category) return false;
      return (localDescriptions[item.category] || []).includes(description);
    };

    const handleItemChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const checked =
        "checked" in e.target ? (e.target as HTMLInputElement).checked : false;
      setItem((prev) => {
        const newItem = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
        if (name === "category" && value !== prev.category)
          newItem.description = "";
        return newItem;
      });
      if (itemErrors[name as keyof typeof itemErrors]) {
        setItemErrors((prev) => ({ ...prev, [name]: "" }));
      }
    };

    const handleAttachmentsChange = (attachments: Attachment[]) => {
      setItem((prev) => ({ ...prev, attachments }));
    };

    const validateItem = (): boolean => {
      try {
        boqSchema.parse(item);
        const errors = { ...defaultItemErrorsState };
        let hasErrors = false;
        if (!allCategories.includes(item.category.trim())) {
          errors.category = "Please select a valid category or add a new one";
          hasErrors = true;
        }
        if (
          item.category &&
          availableDescriptions.length > 0 &&
          !availableDescriptions.includes(item.description.trim())
        ) {
          errors.description =
            "Please select a valid description or add a new one";
          hasErrors = true;
        }
        if (!uomOptions.includes(item.uom.trim())) {
          errors.uom = "Please select a valid Unit of Measure";
          hasErrors = true;
        }
        if (hasErrors) {
          setItemErrors(errors);
          return false;
        }
        setItemErrors(defaultItemErrorsState);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = { ...defaultItemErrorsState };
          (error.issues || (error as any).errors || []).forEach((err: any) => {
            const path = err.path?.[0] as keyof typeof defaultItemErrorsState;
            if (path && path in newErrors) newErrors[path] = err.message;
          });
          setItemErrors(newErrors);
        }
        return false;
      }
    };

    const resetForm = () => {
      setItem({ ...defaultItemState, itemRef: uuidv4() });
      setItemErrors(defaultItemErrorsState);
      setEditingIndex(null);
    };

    const addItem = () => {
      if (validateItem()) {
        onChange([...data, { ...item }]);
        resetForm();
      }
    };

    const updateItem = () => {
      if (editingIndex !== null && validateItem()) {
        const newData = [...data];
        newData[editingIndex] = { ...item };
        onChange(newData);
        resetForm();
      }
    };

    const startEditing = (index: number) => {
      setEditingIndex(index);
      setItem({ ...data[index] });
      setItemErrors(defaultItemErrorsState);
    };

    const cancelEditing = () => resetForm();

    const removeItem = (index: number) => {
      if (index === editingIndex) resetForm();
      const newData = data.filter((_, i) => i !== index);
      onChange(newData);
      if (editingIndex !== null && index < editingIndex)
        setEditingIndex(editingIndex - 1);
    };

    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const workbook = XLSX.read(event.target?.result, {
              type: "binary",
            });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            });

            if (jsonData.length < 2) {
              alert("File is empty or has no data rows.");
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }
            const headers = (jsonData[0] || []).map((h) =>
              String(h).trim().toLowerCase(),
            );
            const expectedHeaders = [
              "category",
              "description",
              "uom",
              "qty",
              "target price",
              "visible target price",
              "specification",
              "remarks",
            ];
            const missingHeaders = expectedHeaders.filter(
              (h) => !headers.includes(h),
            );
            if (missingHeaders.length > 0) {
              alert(
                `Missing required columns: ${missingHeaders.join(", ")}. Please check your template.`,
              );
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }

            const rowValidationErrors: Array<{
              row: number;
              errors: string[];
            }> = [];
            const validItems: BOQItem[] = [];

            jsonData.slice(1).forEach((row: any[], rowIndex) => {
              if (
                row.every(
                  (cell) =>
                    cell === undefined ||
                    cell === null ||
                    String(cell).trim() === "",
                )
              )
                return;

              const category = row[0] != null ? String(row[0]).trim() : "";
              const description = row[1] != null ? String(row[1]).trim() : "";
              const uom = row[2] != null ? String(row[2]).trim() : "";
              const qty = row[3] != null ? String(row[3]).trim() : "";
              let targetPrice = "";
              if (row[4] != null)
                targetPrice =
                  typeof row[4] === "number"
                    ? row[4].toString()
                    : String(row[4]).trim();
              const isVisible =
                row[5] != null
                  ? String(row[5]).trim().toLowerCase() === "yes"
                  : false;
              const specification = row[6] != null ? String(row[6]).trim() : "";
              const remarks = row[7] != null ? String(row[7]).trim() : "";

              const rowItem: BOQItem = {
                category,
                description,
                uom,
                qty,
                targetPrice,
                isVisible,
                specification,
                remarks,
                itemRef: uuidv4(),
                attachments: [],
              };

              try {
                boqSchema.parse(rowItem);
                validItems.push(rowItem);
              } catch (error) {
                if (error instanceof z.ZodError) {
                  rowValidationErrors.push({
                    row: rowIndex + 2,
                    errors: (error.issues || (error as any).errors || []).map(
                      (e: { message: any }) => e.message,
                    ),
                  });
                }
              }
            });

            if (rowValidationErrors.length > 0) {
              setValidationErrors(rowValidationErrors);
              setShowValidationModal(true);
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }

            if (validItems.length === 0) {
              alert(
                "No valid items found in the uploaded file after validation.",
              );
            } else {
              onChange([...data, ...validItems]);
              setUploadedFile(file.name);
              toast.success(
                `Successfully added ${validItems.length} items from ${file.name}.`,
              );
            }
          } catch (error) {
            console.error("Error parsing file:", error);
            alert(
              "Error parsing file. Please ensure it's a valid CSV or Excel file.",
            );
          } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        };
        reader.onerror = () => {
          alert("Error reading the selected file.");
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
      }
    };

    const removeUploadedFile = () => {
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadSampleExcel = () => {
      const wb = XLSX.utils.book_new();
      const headers = [
        "category",
        "description",
        "uom",
        "qty",
        "target price",
        "visible target price",
        "specification",
        "remarks",
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      ws["!cols"] = [15, 25, 10, 10, 12, 25, 20].map((width) => ({ width }));
      XLSX.utils.book_append_sheet(wb, ws, "BOQ Items");
      XLSX.writeFile(wb, "boq-template.xlsx", {
        bookType: "xlsx",
        type: "binary",
      });
    };

    const handleSpecificationGenerated = (spec: string) => {
      setItem((prev) => ({ ...prev, specification: spec }));
      if (itemErrors.specification)
        setItemErrors((prev) => ({ ...prev, specification: "" }));
    };

    if (isLoading) return <BOQFormSkeleton />;

    return (
      <div>
        {/* <h2 className="text-2xl font-bold mb-2">4. BOQ/BOM</h2> */}
        <p className="text-gray-600 mb-4">
          Add items or services required for this RFQ. You can add items
          individually or upload a bulk list using the template provided.
        </p>

        <div
          id="boq-form"
          className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200/90"
        >
          <h3 className="text-lg font-extrabold mb-5 text-gray-900">
            {editingIndex !== null ? "Edit Item" : "Add New Item"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Row 1: Category & Description */}
            <SearchableSelect
              id="category"
              name="category"
              label="Category"
              value={item.category}
              options={allCategories}
              onChange={handleItemChange}
              hasError={!!itemErrors.category}
              errorMessage={itemErrors.category}
              placeholder="Select or add category..."
              onAddNewOption={handleAddNewCategory}
              onRemoveOption={handleRemoveCategory}
              isOptionRemovable={isCustomCategory}
              onTabOut={handleCategoryTabOut}
              disabled={disabled}
            />

            <SearchableSelect
              ref={descriptionRef}
              id="description"
              name="description"
              label="Description"
              value={item.description}
              options={availableDescriptions}
              onChange={handleItemChange}
              hasError={!!itemErrors.description}
              errorMessage={itemErrors.description}
              disabled={!item.category || isLoading || disabled}
              placeholder={
                !item.category
                  ? "Select category first"
                  : "Select or add description..."
              }
              onAddNewOption={handleAddNewDescription}
              onRemoveOption={handleRemoveDescription}
              isOptionRemovable={isCustomDescription}
            />

            {/* Row 2: UOM & Target Price */}
            <SearchableSelect
              id="uom"
              name="uom"
              label="Unit of Measure (UOM)"
              value={item.uom}
              options={uomOptions}
              onChange={handleItemChange}
              hasError={!!itemErrors.uom}
              errorMessage={itemErrors.uom}
              placeholder="Select UOM..."
              disabled={disabled}
            />

            <div className="space-y-2">
              <Label
                htmlFor="targetPrice"
                className="text-xs font-semibold text-gray-900"
              >
                Target Price per unit excl. of taxes{" "}
                <span className="text-rose-500 font-bold">*</span>
              </Label>
              <Input
                type="text"
                id="targetPrice"
                name="targetPrice"
                className={cn(
                  "h-11 text-[13px] font-mono border border-[#E2E8F0] bg-[#F8FAFC] placeholder:font-mono placeholder:text-[#64748B] rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600",
                  itemErrors.targetPrice &&
                    "border-rose-500 focus-visible:ring-rose-500",
                  !item.isVisible &&
                    "bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed",
                )}
                value={item.targetPrice}
                onChange={handleItemChange}
                placeholder="Target price"
                inputMode="decimal"
                disabled={!item.isVisible || disabled}
              />
              {itemErrors.targetPrice && (
                <p className="text-rose-600 text-xs">
                  {itemErrors.targetPrice}
                </p>
              )}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="enableTargetPrice"
                  name="isVisible"
                  checked={item.isVisible}
                  onChange={handleItemChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <Label
                  htmlFor="enableTargetPrice"
                  className="text-xs text-gray-900 font-semibold cursor-pointer"
                >
                  Enable Target Price
                </Label>
              </div>
            </div>

            {/* Row 3: Quantity & Specification */}
            <div className="space-y-2">
              <Label
                htmlFor="qty"
                className="text-xs font-semibold text-gray-900"
              >
                Quantity <span className="text-rose-500 font-bold">*</span>
              </Label>
              <Input
                type="text"
                id="qty"
                name="qty"
                className={cn(
                  "h-11 text-[13px] font-mono border border-[#E2E8F0] bg-[#F8FAFC] placeholder:font-mono placeholder:text-[#64748B] rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600",
                  itemErrors.qty &&
                    "border-rose-500 focus-visible:ring-rose-500",
                )}
                value={item.qty}
                onChange={handleItemChange}
                placeholder="e.g., 10 or 12.5"
                inputMode="decimal"
                required
                disabled={disabled}
              />
              {itemErrors.qty && (
                <p className="text-rose-600 text-xs">{itemErrors.qty}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="specification"
                  className="text-xs font-semibold text-gray-900"
                >
                  Specification{" "}
                  <span className="text-rose-500 font-bold">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] font-extrabold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 tracking-wider flex items-center gap-1"
                  onClick={() => setShowSpecModal(true)}
                  disabled={!item.category || !item.description || disabled}
                >
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  GENERATE WITH AI
                </Button>
              </div>
              <Input
                type="text"
                id="specification"
                name="specification"
                className={cn(
                  "h-11 text-[13px] font-mono border border-[#E2E8F0] bg-[#F8FAFC] placeholder:font-mono placeholder:text-[#64748B] rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600",
                  itemErrors.specification &&
                    "border-rose-500 focus-visible:ring-rose-500",
                )}
                value={item.specification}
                onChange={handleItemChange}
                placeholder="e.g., Color: Blue, Size: Large"
                disabled={disabled}
              />
              {itemErrors.specification && (
                <p className="text-rose-600 text-xs">
                  {itemErrors.specification}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Remarks */}
          <div className="space-y-2 mt-5">
            <Label
              htmlFor="remarks"
              className="text-xs font-semibold text-gray-900"
            >
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              name="remarks"
              value={item.remarks}
              onChange={handleItemChange}
              placeholder="Any additional notes about this item"
              rows={3}
              className="text-[13px] font-mono border border-[#E2E8F0] bg-[#F8FAFC] placeholder:font-mono placeholder:text-[#64748B] rounded-xl shadow-2xs focus-visible:ring-1 focus-visible:ring-blue-600"
              disabled={disabled}
            />
          </div>

          {/* Attachments Section */}
          <div className="mt-5 border-t border-gray-100 pt-5">
            <BOQAttachments
              boqItemRef={item.itemRef!}
              attachments={item.attachments || []}
              onChange={handleAttachmentsChange}
              disabled={disabled}
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={editingIndex !== null ? updateItem : addItem}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase px-6 py-2.5 rounded-lg shadow-sm"
            >
              {editingIndex !== null ? "UPDATE ITEM" : "ADD ITEM"}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={cancelEditing}
                className="font-bold text-xs uppercase px-4 py-2.5 rounded-lg"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {errors?.items && (
          <p className="text-rose-600 my-3 text-xs">{errors.items}</p>
        )}

        {/* Bulk Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200/90">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-extrabold text-gray-900">
              Bulk Upload
            </h3>
            <Button
              onClick={downloadSampleExcel}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 font-extrabold uppercase text-xs tracking-wider px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs"
            >
              <FaFileDownload className="w-3.5 h-3.5" /> DOWNLOAD TEMPLATE
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">
            Upload a{" "}
            <strong className="font-semibold text-gray-700">CSV</strong> or{" "}
            <strong className="font-semibold text-gray-700">
              Excel (.xlsx)
            </strong>{" "}
            file using the template format.
          </p>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40 hover:border-blue-300 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Label
                htmlFor="bulkUpload"
                className={cn(
                  "cursor-pointer flex items-center gap-2",
                  uploadedFile ? "text-green-600" : "text-blue-600",
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "text-blue-600 border-blue-600 hover:bg-blue-50 font-extrabold uppercase text-xs tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 bg-white shadow-xs",
                    uploadedFile &&
                      "bg-green-600 border-green-600 hover:bg-green-700 text-white",
                  )}
                  asChild
                >
                  <span>
                    <FaUpload className="w-3.5 h-3.5" />
                    {uploadedFile ? "FILE SELECTED" : "CHOOSE FILE"}
                  </span>
                </Button>
              </Label>
              {uploadedFile && (
                <Button
                  variant="destructive"
                  onClick={removeUploadedFile}
                  title={`Remove ${uploadedFile}`}
                  className="font-bold text-xs uppercase px-4 py-2.5 rounded-lg"
                >
                  <FaTrash className="w-3.5 h-3.5 mr-1.5" /> Remove File
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Accepted formats: .csv, .xlsx
            </p>
            {uploadedFile && (
              <p
                className="text-sm text-gray-700 mb-2 font-medium truncate max-w-xs"
                title={uploadedFile}
              >
                {uploadedFile}
              </p>
            )}
            <input
              type="file"
              id="bulkUpload"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleBulkUpload}
              className="hidden"
              ref={fileInputRef}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              Accepted formats: <strong>.csv, .xlsx</strong>
            </p>
          </div>
        </div>

        {data?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Added Items ({data.length})
            </h3>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-2 border border-gray-300 text-center">
                      S.No.
                    </th>
                    <th className="p-2 border border-gray-300">Category</th>
                    <th className="p-2 border border-gray-300">Description</th>
                    <th className="p-2 border border-gray-300">UOM</th>
                    <th className="p-2 border border-gray-300 text-right">
                      Qty
                    </th>
                    <th className="p-2 border border-gray-300 text-right">
                      Target Price
                    </th>
                    <th className="p-2 border border-gray-300 text-center">
                      Visible Target Price
                    </th>
                    <th className="p-2 border border-gray-300">
                      Specification
                    </th>
                    <th className="p-2 border border-gray-300">Remarks</th>
                    <th className="p-2 border border-gray-300 text-center">
                      Attachments
                    </th>
                    <th className="p-2 border border-gray-300 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((addedItem, index) => (
                    <tr
                      key={addedItem.itemRef || index}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        editingIndex === index && "bg-blue-50",
                      )}
                    >
                      <td className="p-2 border border-gray-300 text-center">
                        {index + 1}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {addedItem.category}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {addedItem.description}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {addedItem.uom}
                      </td>
                      <td className="p-2 border border-gray-300 text-right">
                        {addedItem.qty}
                      </td>
                      <td className="p-2 border border-gray-300 text-right">
                        {addedItem.targetPrice || "-"}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {addedItem.isVisible === true
                          ? "Yes"
                          : addedItem.isVisible === false
                            ? "No"
                            : "-"}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {addedItem.specification || "-"}
                      </td>
                      <td className="p-2 border border-gray-300">
                        {addedItem.remarks || "-"}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        {addedItem.attachments &&
                        addedItem.attachments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {addedItem.attachments.map((att, ai) => (
                              <a
                                key={att.id || ai}
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline truncate max-w-[120px] block"
                                title={att.fileName}
                              >
                                {att.fileName}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-300 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            size="iconSmall"
                            onClick={() => startEditing(index)}
                            title="Edit Item"
                            disabled={editingIndex === index || disabled}
                            aria-label="Edit item"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="iconSmall"
                            variant="destructive"
                            onClick={() => removeItem(index)}
                            title="Remove Item"
                            aria-label="Remove item"
                            disabled={disabled}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ValidationErrorModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          errors={validationErrors}
        />
        <SpecificationModal
          isOpen={showSpecModal}
          onClose={() => setShowSpecModal(false)}
          category={item.category}
          description={item.description}
          onSpecificationGenerated={handleSpecificationGenerated}
        />
      </div>
    );
  },
);

BOQ.displayName = "BOQ";
