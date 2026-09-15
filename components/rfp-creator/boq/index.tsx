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
import {
  Sparkles,
  FileSpreadsheet,
  ListFilter,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { BOQAttachments, Attachment } from "./boq-attachments";
import { v4 as uuidv4 } from "uuid";

// ─── Default Category Master List (as specified by user) ─────────────────────

const DEFAULT_CATEGORY_LIST: string[] = ["Gifting Items"];

// Initial subcategory/description suggestions map
const INITIAL_CATEGORY_ITEMS: Record<string, string[]> = {
  "Gifting Items": [
    "Indoor Plants",
    "Ceramic plant pot",
    "Plastic Plant pot",
    "Coffee Mug",
    "Candle",
    "Mobile stand",
    "Water bottle",
    "Diya",
    "Smart Watches",
    "Audio Speakers",
    "Mini Projectors",
    "Power Banks",
    "Lunch Box",
    "Juicer",
    "Gym Bags",
    "Personalised Pen Stand",
    "Diary",
    "Plantable Pen",
    "Gourmet Snacks",
    "Coffee Kit",
    "Tea Kit",
    "Jackets",
    "Hoodies",
    "Caps",
    "Sling bags",
    "Backpacks",
    "Mobile accessory",
    "Desktop Accessory",
    "Healthy Snack",
    "Chocolate box",
    "Dry Fruits",
    "Sweets",
    "Honey",
    "Mini Game",
    "Magnetic Badges",
    "Coasters",
    "KeyChains",
    "Umbrella",
    "Earpods",
    "Headphones",
    "MultiPurpose Data cable kit",
    "Brass Coffee Filter",
    "Gift packaging - Jute Bag",
    "Gift packaging - Hamper Box",
    "Gift packaging - Cloath bag",
    "Gift packaging - Other bag",
    "Perfumes",
    "Shades - Spectacles",
    "Saree",
    "Imported Chocolates",
    "Water Bottle",
    "Books",
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BOQItem {
  id?: number;
  category: string;
  description: string;
  uom: string;
  qty: string;
  targetPrice: string;
  specification: string;
  logoRequirement?: string; // 'with_logo' | 'without_logo'
  remarks: string;
  isVisible?: boolean;
  itemRef?: string;
  attachments?: Attachment[];
}

export interface BOQHandle {
  validate: () => boolean;
}

const RowLogoUploader: React.FC<{
  row: BOQItem;
  rowIndex: number;
  onUpload: (rowIndex: number, file: File) => void;
  onRemove: (rowIndex: number, attIndex: number) => void;
  disabled?: boolean;
}> = ({ row, rowIndex, onUpload, onRemove, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const attachments = row.attachments || [];

  return (
    <div className="mt-1 flex flex-col items-center gap-1">
      {attachments.length > 0 ? (
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 max-w-[140px]">
          <a
            href={attachments[0].fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-emerald-800 font-extrabold truncate hover:underline"
            title={attachments[0].fileName}
          >
            📎 {attachments[0].fileName}
          </a>
          <button
            type="button"
            onClick={() => onRemove(rowIndex, 0)}
            disabled={disabled}
            className="text-rose-500 hover:text-rose-700 font-bold text-[11px] ml-0.5"
            title="Remove Logo Attachment"
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="text-[10px] font-extrabold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded px-2 py-0.5 flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Upload className="w-2.5 h-2.5" /> Upload Logo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(rowIndex, file);
              if (e.target) e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
};

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
  uom: "Nos",
  qty: "1",
  targetPrice: "",
  specification: "",
  logoRequirement: "without_logo",
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
  specification: z.string().optional(),
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

    // View modes: 'description' (grouped category view) | 'excel' (in-page interactive spreadsheet) | 'form' (single/new item form)
    const [viewMode, setViewMode] = useState<"description" | "excel" | "form">(
      "description",
    );

    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [rawCategoryItems, setRawCategoryItems] = useState<RawDBItem[]>([]);
    const [processedCategories, setProcessedCategories] = useState<
      ProcessedCategory[]
    >([]);

    // Category options list (Master list + custom additions)
    const [localCategories, setLocalCategories] = useState<string[]>(
      () => DEFAULT_CATEGORY_LIST,
    );

    // Description suggestions map per category
    const [localDescriptions, setLocalDescriptions] = useState<
      Record<string, string[]>
    >(() => ({ ...INITIAL_CATEGORY_ITEMS }));

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

    // ─── Group Data by Category ───
    const groupedBOQItems = useMemo(() => {
      const groups: Record<
        string,
        { items: BOQItem[]; originalIndices: number[] }
      > = {};
      data.forEach((item, index) => {
        const cat = item.category || "General";
        if (!groups[cat]) {
          groups[cat] = { items: [], originalIndices: [] };
        }
        groups[cat].items.push(item);
        groups[cat].originalIndices.push(index);
      });
      return groups;
    }, [data]);

    // Items belonging to currently selected form category
    const currentCategoryItems = useMemo(() => {
      if (!item.category) return [];
      const selectedCat = item.category.trim().toLowerCase();
      return data
        .map((d, index) => ({ ...d, originalIndex: index }))
        .filter((d) => (d.category || "").trim().toLowerCase() === selectedCat);
    }, [data, item.category]);

    // Stable ref for attachment loading
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const fetchedRefsRef = useRef<Set<string>>(new Set());

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
    }, [data.map((d) => d.itemRef).join(",")]);

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
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch("/api/boq-items");
          if (response.ok) {
            const result: RawDBItem[] = await response.json();
            setRawCategoryItems(result);
            const processed = processRawData(result);
            setProcessedCategories(processed);

            setLocalCategories((prev) => {
              const dbCats = processed.map((p) => p.category);
              return Array.from(new Set([...prev, ...dbCats]));
            });

            setLocalDescriptions((prev) => {
              const nextState = { ...prev };
              processed.forEach((p) => {
                const existing = nextState[p.category] || [];
                nextState[p.category] = Array.from(
                  new Set([...existing, ...p.descriptions]),
                );
              });
              return nextState;
            });
          }
        } catch (error) {
          console.error("Error fetching BOQ category data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [processRawData]);

    // Auto-add 1 default BOQ row if data is completely empty on initial load
    const initialDefaultAddedRef = useRef(false);
    useEffect(() => {
      if (
        !isLoading &&
        data &&
        data.length === 0 &&
        !initialDefaultAddedRef.current
      ) {
        initialDefaultAddedRef.current = true;
        const defaultRow: BOQItem = {
          category: localCategories[0] || "Indoor Plants",
          description: "Desk Plant",
          uom: "Nos",
          qty: "1",
          targetPrice: "200",
          logoRequirement: "without_logo",
          specification: "Standard specification",
          remarks: "",
          isVisible: true,
          itemRef: uuidv4(),
          attachments: [],
        };
        onChange([defaultRow]);
      }
    }, [data, isLoading, localCategories, onChange]);

    const availableCategories = useMemo(() => {
      return localCategories;
    }, [localCategories]);

    const availableDescriptions = useMemo(() => {
      if (!item.category) return [];
      return localDescriptions[item.category] || [];
    }, [item.category, localDescriptions]);

    // Search and Add Handlers
    const handleAddNewCategory = (newCat: string) => {
      const trimmed = newCat.trim();
      if (!trimmed) return;
      if (!localCategories.includes(trimmed)) {
        setLocalCategories((prev) => [...prev, trimmed]);
        setLocalDescriptions((prev) => ({
          ...prev,
          [trimmed]: prev[trimmed] || [],
        }));
        setItem((prev) => ({ ...prev, category: trimmed, description: "" }));
        toast.success(`Custom category "${trimmed}" added!`);
      }
    };

    const handleAddNewDescription = (newDesc: string) => {
      const trimmed = newDesc.trim();
      if (!trimmed || !item.category) return;
      setLocalDescriptions((prev) => {
        const currentList = prev[item.category] || [];
        if (!currentList.includes(trimmed)) {
          return {
            ...prev,
            [item.category]: [...currentList, trimmed],
          };
        }
        return prev;
      });
      setItem((prev) => ({ ...prev, description: trimmed }));
      toast.success(`Custom item "${trimmed}" added under "${item.category}"!`);
    };

    const uomOptions = useMemo(
      () => [
        { label: "Nos (Numbers)", value: "Nos" },
        { label: "Set", value: "Set" },
        { label: "Box", value: "Box" },
        { label: "Kg (Kilogram)", value: "Kg" },
        { label: "Meter", value: "Meter" },
        { label: "Pack", value: "Pack" },
        { label: "Pair", value: "Pair" },
        { label: "Kit", value: "Kit" },
      ],
      [],
    );

    const handleItemChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const val =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setItem((prev) => {
        const updated = { ...prev, [name]: val };
        if (name === "category") {
          updated.description = "";
        }
        return updated;
      });

      if (name in itemErrors) {
        setItemErrors((prev) => ({ ...prev, [name]: "" }));
      }
    };

    // Direct Cell Edit inside Category Table or In-Page Excel Spreadsheet
    const handleSpreadsheetCellChange = (
      index: number,
      field: keyof BOQItem,
      value: any,
    ) => {
      const updated = [...data];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      onChange(updated);
    };

    // Action: Add a new Description row directly under a specific Category
    const handleAddDescriptionUnderCategory = (categoryName: string) => {
      const newRow: BOQItem = {
        category: categoryName,
        description: "",
        uom: "Nos",
        qty: "10",
        targetPrice: "200",
        logoRequirement: "without_logo",
        specification: "",
        remarks: "",
        isVisible: true,
        itemRef: uuidv4(),
        attachments: [],
      };
      onChange([...data, newRow]);
      toast.success(`Added new description row under "${categoryName}"`);
    };

    const handleAddSpreadsheetRow = () => {
      const newRow: BOQItem = {
        category: availableCategories[0] || "General",
        description: "New Description Item",
        uom: "Nos",
        qty: "10",
        targetPrice: "200",
        logoRequirement: "without_logo",
        specification: "Standard specification",
        remarks: "",
        isVisible: true,
        itemRef: uuidv4(),
        attachments: [],
      };
      onChange([...data, newRow]);
      toast.success("New description row added.");
    };

    const handleAttachmentsChange = (attachments: Attachment[]) => {
      setItem((prev) => ({ ...prev, attachments }));
    };

    const handleRowLogoUpload = async (rowIndex: number, file: File) => {
      const targetRow = data[rowIndex];
      if (!targetRow) return;
      const itemRef = targetRow.itemRef || uuidv4();
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("boqItemRef", itemRef);

        const res = await fetch("/api/boq-attachments", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const saved = await res.json();
          const existingAtts = targetRow.attachments || [];
          const updatedAtts = [
            ...existingAtts,
            {
              id: saved.id,
              fileName: saved.fileName,
              fileType: saved.fileType,
              fileSize: saved.fileSize,
              fileUrl: saved.fileUrl,
            },
          ];
          handleSpreadsheetCellChange(rowIndex, "attachments", updatedAtts);
          toast.success(
            `Logo uploaded for "${targetRow.description || targetRow.category}": ${saved.fileName}`,
          );
        } else {
          toast.error("Failed to upload logo file.");
        }
      } catch {
        toast.error("Error uploading logo file.");
      }
    };

    const handleRowLogoRemove = (rowIndex: number, attIndex: number) => {
      const targetRow = data[rowIndex];
      if (!targetRow) return;
      const existingAtts = targetRow.attachments || [];
      const updatedAtts = existingAtts.filter((_, i) => i !== attIndex);
      handleSpreadsheetCellChange(rowIndex, "attachments", updatedAtts);
      toast.info("Logo attachment removed.");
    };

    const handleSpecificationGenerated = (spec: string) => {
      setItem((prev) => ({ ...prev, specification: spec }));
      setItemErrors((prev) => ({ ...prev, specification: "" }));
    };

    const validateItem = () => {
      try {
        boqSchema.parse(item);
        setItemErrors(defaultItemErrorsState);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = { ...defaultItemErrorsState };
          error.issues.forEach((err) => {
            const path = err.path[0] as keyof typeof defaultItemErrorsState;
            if (path && path in newErrors) newErrors[path] = err.message;
          });
          setItemErrors(newErrors);
        }
        return false;
      }
    };

    const resetForm = (keepCategory = false) => {
      const currentCategory = item.category;
      setItem({
        ...defaultItemState,
        category: keepCategory ? currentCategory : "",
        itemRef: uuidv4(),
      });
      setItemErrors(defaultItemErrorsState);
      setEditingIndex(null);
    };

    const addItem = () => {
      if (validateItem()) {
        const addedCategory = item.category.trim();
        const addedDesc = item.description.trim();
        const newItem: BOQItem = {
          ...item,
          category: addedCategory,
          description: addedDesc,
        };
        onChange([...data, newItem]);
        // Keep category selected so user can immediately add another description under the SAME category!
        resetForm(true);
        toast.success(
          `Added "${addedDesc}" under "${addedCategory}"! Ready for next description.`,
        );
      }
    };

    const updateItem = () => {
      if (editingIndex !== null && validateItem()) {
        const newData = [...data];
        newData[editingIndex] = { ...item };
        onChange(newData);
        resetForm();
        setViewMode("description");
        toast.success("Description updated!");
      }
    };

    const startEditing = (index: number) => {
      setEditingIndex(index);
      setItem({ ...data[index] });
      setItemErrors(defaultItemErrorsState);
      setViewMode("form");
    };

    const removeItem = (index: number) => {
      if (index === editingIndex) resetForm();
      const newData = data.filter((_, i) => i !== index);
      onChange(newData);
      if (editingIndex !== null && index < editingIndex)
        setEditingIndex(editingIndex - 1);
      toast.info("Description removed.");
    };

    // Excel File Upload Handler
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

            const validItems: BOQItem[] = [];

            jsonData.slice(1).forEach((row: any[]) => {
              if (
                row.every(
                  (cell) =>
                    cell === undefined ||
                    cell === null ||
                    String(cell).trim() === "",
                )
              )
                return;

              const category =
                row[0] != null ? String(row[0]).trim() : "General";
              const description =
                row[1] != null ? String(row[1]).trim() : "Item";
              const uom = row[2] != null ? String(row[2]).trim() : "Nos";
              const qty = row[3] != null ? String(row[3]).trim() : "1";
              let targetPrice = "0";
              if (row[4] != null)
                targetPrice =
                  typeof row[4] === "number"
                    ? row[4].toString()
                    : String(row[4]).trim();

              const specification = row[5] != null ? String(row[5]).trim() : "";
              const logoRequirementRaw =
                row[6] != null ? String(row[6]).trim().toLowerCase() : "";
              const logoRequirement = logoRequirementRaw.includes("with")
                ? "with_logo"
                : "without_logo";
              const remarks = row[7] != null ? String(row[7]).trim() : "";

              const rowItem: BOQItem = {
                category,
                description,
                uom,
                qty,
                targetPrice,
                specification,
                logoRequirement,
                remarks,
                isVisible: true,
                itemRef: uuidv4(),
                attachments: [],
              };

              validItems.push(rowItem);
            });

            if (validItems.length === 0) {
              alert("No valid items found in the uploaded file.");
            } else {
              onChange([...data, ...validItems]);
              setUploadedFile(file.name);
              setViewMode("excel");
              toast.success(
                `Successfully loaded ${validItems.length} items from ${file.name}!`,
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
        reader.readAsBinaryString(file);
      }
    };

    const downloadSampleExcel = () => {
      const wb = XLSX.utils.book_new();
      const headers = [
        "Category",
        "Description",
        "UOM",
        "Qty",
        "Target Price",
        "Specification",
        "Logo Requirement",
        "Remarks",
      ];
      const exportRows =
        data.length > 0
          ? data.map((d) => [
              d.category,
              d.description,
              d.uom,
              d.qty,
              d.targetPrice,
              d.specification,
              d.logoRequirement === "with_logo" ? "With Logo" : "Without Logo",
              d.remarks,
            ])
          : [
              [
                "Books",
                "Kids Books",
                "Nos",
                "10",
                "200",
                "Comics",
                "Without Logo",
                "",
              ],
              [
                "Books",
                "Fantasy Book",
                "Nos",
                "2",
                "250",
                "Kids Fantasy",
                "Without Logo",
                "",
              ],
              [
                "Books",
                "Story Book",
                "Nos",
                "5",
                "180",
                "Illustrated",
                "Without Logo",
                "",
              ],
            ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
      XLSX.utils.book_append_sheet(wb, ws, "RFQ_BOQ_Items");
      XLSX.writeFile(wb, "RFQ_BOQ_Items_Spreadsheet.xlsx");
    };

    if (isLoading) {
      return <BOQFormSkeleton />;
    }

    return (
      <div className="space-y-6">
        {/* ─── Top In-Page View Switcher Bar ─── */}
        <div className="bg-grey-200 text-white rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
              One Category → Multiple Descriptions
            </span>
            {uploadedFile && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {uploadedFile}
              </span>
            )}
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center  rounded-xl border border-grey-300 gap-1">
            <button
              type="button"
              onClick={() => setViewMode("description")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === "description"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white",
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Category & Descriptions View ({data.length})
            </button>

            <button
              type="button"
              onClick={() => setViewMode("excel")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === "excel"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white",
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              In-Page Excel View
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode("form");
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewMode === "form"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white",
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category / Description
            </button>
          </div>
        </div>

        {/* Error Alert Banner when no BOQ item is added */}
        {errors?.boq && (!data || data.length === 0) && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-extrabold shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errors.boq}</span>
            </div>
            <Button
              size="sm"
              onClick={() => setViewMode("form")}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3 py-1"
            >
              + Add BOQ Item Now
            </Button>
          </div>
        )}

        {/* ─── VIEW 1: Grouped Category & Multiple Descriptions View ─── */}
        {viewMode === "description" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Categories & Multiple Descriptions List
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each Category contains multiple Descriptions. Each Description
                  has its own Quantity, Target Price, Specification, and Logo
                  Requirement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setViewMode("form");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" /> Add Category / Description
                </Button>
              </div>
            </div>

            {Object.keys(groupedBOQItems).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">
                  No Category Descriptions Added Yet
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Select a category from the master list (e.g. Books, Indoor
                  Plants, Coffee Mug) and add multiple description rows.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => setViewMode("form")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Add Category / Description
                  </Button>
                  <Label
                    htmlFor="bulkUploadDescGroup"
                    className="cursor-pointer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5"
                      asChild
                    >
                      <span>
                        <Upload className="w-3.5 h-3.5" /> Upload Excel
                      </span>
                    </Button>
                  </Label>
                  <input
                    type="file"
                    id="bulkUploadDescGroup"
                    accept=".csv, .xlsx"
                    onChange={handleBulkUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedBOQItems).map(
                  ([categoryName, group]) => (
                    <div
                      key={categoryName}
                      className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden"
                    >
                      {/* Category Header Bar with "Add Description" Action */}
                      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-200 text-black gap-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-600 text-white text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                            Category
                          </span>
                          <h4 className="font-extrabold text-base tracking-tight text-black">
                            {categoryName}
                          </h4>
                          <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {group.items.length}{" "}
                            {group.items.length === 1
                              ? "description"
                              : "descriptions"}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() =>
                            handleAddDescriptionUnderCategory(categoryName)
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Add Description to &quot;
                          {categoryName}&quot;
                        </Button>
                      </div>

                      {/* Dynamic Table of Descriptions under this Category */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 uppercase font-bold">
                              <th className="p-3 border-r border-slate-200 w-10 text-center">
                                #
                              </th>
                              <th className="p-3 border-r border-slate-200 min-w-[200px]">
                                Description
                              </th>
                              <th className="p-3 border-r border-slate-200 text-center w-28">
                                Qty
                              </th>
                              <th className="p-3 border-r border-slate-200 text-right min-w-[160px] w-44">
                                Target Price (₹)
                              </th>
                              <th className="p-3 border-r border-slate-200 text-center w-36">
                                Logo Required
                              </th>
                              <th className="p-3 border-r border-slate-200 min-w-[220px]">
                                Specification
                              </th>
                              <th className="p-3 text-center w-24">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                            {group.items.map((row, idx) => {
                              const originalIndex = group.originalIndices[idx];

                              return (
                                <tr
                                  key={row.itemRef || idx}
                                  className="hover:bg-blue-50/40 transition-colors"
                                >
                                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500 bg-slate-50/50">
                                    {idx + 1}
                                  </td>

                                  {/* Description Field - Direct Inline Edit */}
                                  <td className="p-1.5 border-r border-slate-200">
                                    <input
                                      type="text"
                                      value={row.description}
                                      onChange={(e) =>
                                        handleSpreadsheetCellChange(
                                          originalIndex,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Kids Books, Fantasy Book..."
                                      className="w-full h-8 px-2 border border-slate-200 rounded font-extrabold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </td>

                                  {/* Quantity Field - Direct Inline Edit */}
                                  <td className="p-1.5 border-r border-slate-200 text-center">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={row.qty}
                                        onChange={(e) =>
                                          handleSpreadsheetCellChange(
                                            originalIndex,
                                            "qty",
                                            e.target.value,
                                          )
                                        }
                                        className="w-16 h-8 px-1 border border-slate-200 rounded font-black text-blue-700 text-center bg-white focus:ring-2 focus:ring-blue-500"
                                      />
                                      <select
                                        value={row.uom || "Nos"}
                                        onChange={(e) =>
                                          handleSpreadsheetCellChange(
                                            originalIndex,
                                            "uom",
                                            e.target.value,
                                          )
                                        }
                                        className="h-8 px-1 border border-slate-200 rounded text-[11px] font-bold bg-slate-50"
                                      >
                                        {uomOptions.map((u) => (
                                          <option key={u.value} value={u.value}>
                                            {u.value}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>

                                  {/* Target Price Field - Direct Inline Edit */}
                                  <td className="p-1.5 border-r border-slate-200 text-right min-w-[160px] w-44">
                                    <div className="relative">
                                      <span className="absolute left-2 top-2 text-slate-400 font-bold">
                                        ₹
                                      </span>
                                      <input
                                        type="number"
                                        value={row.targetPrice}
                                        onChange={(e) =>
                                          handleSpreadsheetCellChange(
                                            originalIndex,
                                            "targetPrice",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="0"
                                        className="w-full h-8 pl-5 pr-2 border border-slate-200 rounded font-black text-slate-900 text-right bg-white focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                  </td>

                                  {/* Logo Requirement Selector */}
                                  <td className="p-1.5 border-r border-slate-200 text-center">
                                    <select
                                      value={
                                        row.logoRequirement || "without_logo"
                                      }
                                      onChange={(e) =>
                                        handleSpreadsheetCellChange(
                                          originalIndex,
                                          "logoRequirement",
                                          e.target.value,
                                        )
                                      }
                                      className={cn(
                                        "w-full h-8 px-2 text-[10px] font-extrabold rounded cursor-pointer uppercase border",
                                        row.logoRequirement === "with_logo"
                                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                          : "bg-slate-100 text-slate-700 border-slate-300",
                                      )}
                                    >
                                      <option value="with_logo">
                                        With Logo
                                      </option>
                                      <option value="without_logo">
                                        Without Logo
                                      </option>
                                    </select>
                                    {row.logoRequirement === "with_logo" && (
                                      <RowLogoUploader
                                        row={row}
                                        rowIndex={originalIndex}
                                        onUpload={handleRowLogoUpload}
                                        onRemove={handleRowLogoRemove}
                                        disabled={disabled}
                                      />
                                    )}
                                  </td>

                                  {/* Specification Field - Direct Inline Edit */}
                                  <td className="p-1.5 border-r border-slate-200">
                                    <input
                                      type="text"
                                      value={row.specification}
                                      onChange={(e) =>
                                        handleSpreadsheetCellChange(
                                          originalIndex,
                                          "specification",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Comics, Illustrated, Hardcover..."
                                      className="w-full h-8 px-2 border border-slate-200 rounded text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>

                                  {/* Actions */}
                                  <td className="p-1.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        size="iconSmall"
                                        variant="ghost"
                                        onClick={() =>
                                          startEditing(originalIndex)
                                        }
                                        title="Edit Description"
                                      >
                                        <FaEdit className="text-blue-600 w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        size="iconSmall"
                                        variant="ghost"
                                        onClick={() =>
                                          removeItem(originalIndex)
                                        }
                                        title="Remove Description"
                                      >
                                        <FaTrash className="text-rose-600 w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Bottom Action inside Category Card */}
                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">
                          Total {group.items.length} descriptions under{" "}
                          {categoryName}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleAddDescriptionUnderCategory(categoryName)
                          }
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Another
                          Description to &quot;{categoryName}&quot;
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── VIEW 2: In-Page Interactive Excel Spreadsheet View ─── */}
        {viewMode === "excel" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  In-Page Interactive Excel Spreadsheet
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and update all item details directly within this in-page
                  grid. Changes auto-save to database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="excelGridUpload" className="cursor-pointer">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5"
                    asChild
                  >
                    <span>
                      <Upload className="w-3.5 h-3.5" /> Upload File (.xlsx)
                    </span>
                  </Button>
                </Label>
                <input
                  type="file"
                  id="excelGridUpload"
                  accept=".csv, .xlsx"
                  onChange={handleBulkUpload}
                  className="hidden"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSampleExcel}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </Button>

                <Button
                  size="sm"
                  onClick={handleAddSpreadsheetRow}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </Button>
              </div>
            </div>

            {/* In-Page Interactive Spreadsheet Grid Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-2xs max-h-[1000px] overflow-y-auto custom-slim-scrollbar">
              <table className="w-full border-collapse text-xs font-mono min-w-[900px]">
                <thead className="sticky top-0 bg-slate-200 text-slate-900 z-10 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-300">
                  <tr>
                    <th className="p-3 border border-slate-300 text-center w-12">
                      #
                    </th>
                    <th className="p-3 border border-slate-300 text-left min-w-[150px]">
                      Category
                    </th>
                    <th className="p-3 border border-slate-300 text-left min-w-[180px]">
                      Item / Description
                    </th>
                    <th className="p-3 border border-slate-300 text-center w-24">
                      Quantity
                    </th>
                    <th className="p-3 border border-slate-300 text-center w-24">
                      UOM
                    </th>
                    <th className="p-3 border border-slate-300 text-right min-w-[160px] w-44">
                      Target Price (₹)
                    </th>
                    <th className="p-3 border border-slate-300 text-center w-36">
                      Logo Requirement
                    </th>
                    <th className="p-3 border border-slate-300 text-left min-w-[200px]">
                      Specification
                    </th>
                    <th className="p-3 border border-slate-300 text-left min-w-[140px]">
                      Remarks
                    </th>
                    <th className="p-3 border border-slate-300 text-center w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-8 text-center text-slate-500"
                      >
                        No rows in spreadsheet. Click &quot;Add Row&quot; or
                        &quot;Upload File&quot; to insert items.
                      </td>
                    </tr>
                  ) : (
                    data.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="p-2 border border-slate-200 text-center font-bold text-slate-600 bg-slate-50">
                          {rIdx + 1}
                        </td>

                        {/* Category cell */}
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={row.category}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "category",
                                e.target.value,
                              )
                            }
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* Description cell */}
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* Quantity cell */}
                        <td className="p-1 border border-slate-200 text-center">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "qty",
                                e.target.value,
                              )
                            }
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs font-extrabold text-blue-700 text-center focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* UOM cell */}
                        <td className="p-1 border border-slate-200 text-center">
                          <select
                            value={row.uom}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "uom",
                                e.target.value,
                              )
                            }
                            className="w-full h-8 px-1 border-0 bg-transparent text-xs text-center focus:bg-white focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
                          >
                            {uomOptions.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.value}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Target Price cell */}
                        <td className="p-1 border border-slate-200 text-right">
                          <input
                            type="number"
                            value={row.targetPrice}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "targetPrice",
                                e.target.value,
                              )
                            }
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs font-bold text-right focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* Logo Requirement cell */}
                        <td className="p-1 border border-slate-200 text-center">
                          <select
                            value={row.logoRequirement || "without_logo"}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "logoRequirement",
                                e.target.value,
                              )
                            }
                            className={cn(
                              "w-full h-8 px-2 text-[11px] font-bold rounded cursor-pointer uppercase border-0 focus:ring-2 focus:ring-blue-500",
                              row.logoRequirement === "with_logo"
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-slate-100 text-slate-700",
                            )}
                          >
                            <option value="with_logo">With Logo</option>
                            <option value="without_logo">Without Logo</option>
                          </select>
                          {row.logoRequirement === "with_logo" && (
                            <RowLogoUploader
                              row={row}
                              rowIndex={rIdx}
                              onUpload={handleRowLogoUpload}
                              onRemove={handleRowLogoRemove}
                              disabled={disabled}
                            />
                          )}
                        </td>

                        {/* Specification cell */}
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={row.specification}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "specification",
                                e.target.value,
                              )
                            }
                            placeholder="Specification details..."
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* Remarks cell */}
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={row.remarks}
                            onChange={(e) =>
                              handleSpreadsheetCellChange(
                                rIdx,
                                "remarks",
                                e.target.value,
                              )
                            }
                            placeholder="Optional notes"
                            className="w-full h-8 px-2 border-0 bg-transparent text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                          />
                        </td>

                        {/* Action cell */}
                        <td className="p-1 border border-slate-200 text-center">
                          <Button
                            size="iconSmall"
                            variant="ghost"
                            onClick={() => removeItem(rIdx)}
                            className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                            title="Delete Row"
                          >
                            <FaTrash className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Note below spreadsheet table */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 gap-2">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                No rows in spreadsheet. Click &quot;Add Row&quot; or
                &quot;Upload File&quot; to insert items.
              </span>
              <span className="font-bold text-slate-800 bg-white border border-slate-300 px-2.5 py-0.5 rounded shadow-2xs">
                Total Rows: {data.length}
              </span>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: Add / Edit Description Row Form ─── */}
        {viewMode === "form" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                {editingIndex !== null
                  ? "Edit Description Row"
                  : "Add Description under Category"}
              </h3>

              {data.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("description")}
                  className="text-xs font-bold text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  View Added Category Items ({data.length})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Dropdown (Search & Add from Master List) */}
              <div className="space-y-2">
                <SearchableSelect
                  id="category"
                  name="category"
                  label="Category (Search default list or Add Custom)"
                  value={item.category}
                  options={availableCategories}
                  onChange={handleItemChange}
                  onAddNewOption={handleAddNewCategory}
                  hasError={!!itemErrors.category}
                  errorMessage={itemErrors.category}
                  placeholder="Select Category (e.g. Books, Indoor Plants, Coffee Mug)..."
                  disabled={disabled}
                />
              </div>

              {/* Description Field (Search & Add under Category) */}
              <div className="space-y-2" ref={descriptionRef}>
                <SearchableSelect
                  id="description"
                  name="description"
                  label="Description Item (Search or Add Custom)"
                  value={item.description}
                  options={availableDescriptions}
                  onChange={handleItemChange}
                  onAddNewOption={handleAddNewDescription}
                  hasError={!!itemErrors.description}
                  errorMessage={itemErrors.description}
                  placeholder={
                    item.category
                      ? `Search ${item.category} items or type custom description...`
                      : "Select Category first..."
                  }
                  disabled={!item.category || disabled}
                />
              </div>

              {/* Quantity */}
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
                  value={item.qty}
                  onChange={handleItemChange}
                  placeholder="e.g. 10"
                  disabled={disabled}
                  className="h-10 text-xs font-mono border-slate-300"
                />
                {itemErrors.qty && (
                  <p className="text-rose-600 text-xs">{itemErrors.qty}</p>
                )}
              </div>

              {/* Target Price */}
              <div className="space-y-2">
                <Label
                  htmlFor="targetPrice"
                  className="text-xs font-semibold text-gray-900"
                >
                  Target Price per unit (₹){" "}
                  <span className="text-rose-500 font-bold">*</span>
                </Label>
                <Input
                  type="text"
                  id="targetPrice"
                  name="targetPrice"
                  value={item.targetPrice}
                  onChange={handleItemChange}
                  placeholder="e.g. 200"
                  disabled={disabled}
                  className="h-10 text-xs font-mono border-slate-300"
                />
                {itemErrors.targetPrice && (
                  <p className="text-rose-600 text-xs">
                    {itemErrors.targetPrice}
                  </p>
                )}
              </div>

              {/* UOM */}
              <div className="space-y-2">
                <SearchableSelect
                  id="uom"
                  name="uom"
                  label="Unit of Measure (UOM)"
                  value={item.uom}
                  options={uomOptions.map((u) => u.value)}
                  onChange={handleItemChange}
                  hasError={!!itemErrors.uom}
                  errorMessage={itemErrors.uom}
                  placeholder="Select UOM..."
                  disabled={disabled}
                />
              </div>

              {/* Logo Requirement */}
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label className="text-xs font-semibold text-gray-900">
                  Logo Requirement
                </Label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="logoRequirement"
                      value="with_logo"
                      checked={item.logoRequirement === "with_logo"}
                      onChange={handleItemChange}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    With Logo
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="logoRequirement"
                      value="without_logo"
                      checked={
                        item.logoRequirement === "without_logo" ||
                        !item.logoRequirement
                      }
                      onChange={handleItemChange}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    Without Logo
                  </label>
                </div>

                {item.logoRequirement === "with_logo" && (
                  <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                    <BOQAttachments
                      boqItemRef={item.itemRef || uuidv4()}
                      attachments={item.attachments || []}
                      onChange={handleAttachmentsChange}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>

              {/* Specification */}
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="specification"
                    className="text-xs font-semibold text-gray-900"
                  >
                    Specification
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] font-extrabold uppercase text-blue-600 hover:text-blue-700 px-2 flex items-center gap-1"
                    onClick={() => setShowSpecModal(true)}
                    disabled={!item.category || !item.description || disabled}
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    GENERATE WITH AI
                  </Button>
                </div>
                <Textarea
                  id="specification"
                  name="specification"
                  value={item.specification}
                  onChange={handleItemChange}
                  placeholder="e.g. Comics, Illustrated, Hardcover, Custom Branding..."
                  rows={3}
                  disabled={disabled}
                  className="text-xs font-mono border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setViewMode("description");
                }}
                className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Button>
              {editingIndex !== null ? (
                <Button
                  onClick={updateItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 shadow-sm"
                >
                  Update Description
                </Button>
              ) : (
                <Button
                  onClick={addItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 shadow-sm"
                >
                  Add Description Row
                </Button>
              )}
            </div>

            {/* ─── Dynamic Live Table of ALL Added BOQ Descriptions ─── */}
            <div className="mt-6 pt-5 border-t-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {item.category ? (
                    <>
                      Added Descriptions under{" "}
                      <span className="text-blue-600 font-extrabold text-sm">
                        {item.category}
                      </span>{" "}
                      & All Categories
                    </>
                  ) : (
                    "All Added Category Descriptions"
                  )}
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    {data.length} {data.length === 1 ? "item" : "items"} total
                  </span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">
                  One Category → Multiple Descriptions
                </span>
              </div>

              {data.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No description rows added yet. Fill out the fields above and
                  click <strong>&quot;Add Description Row&quot;</strong>.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs custom-slim-scrollbar">
                  <table className="w-full text-left font-mono border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 text-[11px] uppercase font-extrabold border-b border-slate-300">
                        <th className="p-2.5 border-r border-slate-300 w-10 text-center">
                          #
                        </th>
                        <th className="p-2.5 border-r border-slate-300 min-w-[140px]">
                          Category
                        </th>
                        <th className="p-2.5 border-r border-slate-300 min-w-[180px]">
                          Description
                        </th>
                        <th className="p-2.5 border-r border-slate-300 text-center w-24">
                          Qty
                        </th>
                        <th className="p-2.5 border-r border-slate-300 text-right min-w-[160px] w-44">
                          Target Price
                        </th>
                        <th className="p-2.5 border-r border-slate-300 text-center w-28">
                          Logo Req.
                        </th>
                        <th className="p-2.5 border-r border-slate-300 min-w-[180px]">
                          Specification
                        </th>
                        <th className="p-2.5 text-center w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {data.map((row, idx) => {
                        const isCurrentCategory =
                          item.category &&
                          (row.category || "").trim().toLowerCase() ===
                            item.category.trim().toLowerCase();

                        return (
                          <tr
                            key={row.itemRef || idx}
                            className={cn(
                              "hover:bg-blue-50/60 transition-colors",
                              isCurrentCategory ? "bg-blue-50/30" : "",
                            )}
                          >
                            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-500 bg-slate-50">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 font-extrabold text-blue-900">
                              <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded font-bold">
                                {row.category}
                              </span>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 font-extrabold text-slate-900">
                              {row.description}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-700">
                              {row.qty} {row.uom}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-right font-black text-slate-900 min-w-[160px] w-44">
                              ₹{row.targetPrice}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border",
                                  row.logoRequirement === "with_logo"
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                    : "bg-slate-100 text-slate-700 border-slate-300",
                                )}
                              >
                                {row.logoRequirement === "with_logo"
                                  ? "With Logo"
                                  : "Without Logo"}
                              </span>
                            </td>
                            <td
                              className="p-2.5 border-r border-slate-200 text-slate-700 truncate max-w-[200px]"
                              title={row.specification}
                            >
                              {row.specification}
                            </td>
                            <td className="p-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="iconSmall"
                                  variant="ghost"
                                  onClick={() => startEditing(idx)}
                                  title="Edit Description"
                                >
                                  <FaEdit className="text-blue-600 w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="iconSmall"
                                  variant="ghost"
                                  onClick={() => removeItem(idx)}
                                  title="Remove Description"
                                >
                                  <FaTrash className="text-rose-600 w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
