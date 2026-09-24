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
import { FaTrash, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/search";
import { z } from "zod";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  X,
  Grid,
} from "lucide-react";
import { Attachment } from "./boq-attachments";
import { ExcelSpreadsheetView } from "./excel-spreadsheet-view";
import { v4 as uuidv4 } from "uuid";

// ─── Predefined Categories & Descriptions Master List ────────
const MASTER_20_CATEGORIES: string[] = ["Gifting Items"];

const INITIAL_CATEGORY_ITEMS: Record<string, string[]> = {
  "Gifting Items": [
    "Indoor Plants",
    "Ceramic Plant Pot",
    "Plastic Plant Pot",
    "Coffee Mug",
    "Candle",
    "Mobile Stand",
    "Water Bottle",
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
    "Sling Bags",
    "Backpacks",
    "Mobile Accessory",
    "Desktop Accessory",
    "Healthy Snack",
    "Chocolate Box",
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
    "MultiPurpose Data Cable Kit",
    "Brass Coffee Filter",
    "Gift Packaging - Jute Bag",
    "Gift Packaging - Hamper Box",
    "Gift Packaging - Cloth Bag",
    "Gift Packaging - Other Bag",
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
  logoRequirement?: string;
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
            className="text-[10px] text-emerald-800 font-bold truncate hover:underline"
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
            X{" "}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded px-2 py-0.5 flex items-center gap-1 transition-colors"
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

const defaultItemState: BOQItem = {
  category: "",
  description: "",
  uom: "Nos",
  qty: "1",
  targetPrice: "",
  specification: "",
  logoRequirement: "without_logo",
  remarks: "",
  isVisible: true,
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
      message: "Quantity must be a positive number",
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
        message: "Target price must be a valid non-negative number",
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

    const [uploadedFileName, setUploadedFileName] = useState<string | null>(
      null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showExcelView, setShowExcelView] = useState(false);
    const [isExcelFullWindow, setIsExcelFullWindow] = useState(true);

    // Categories list
    const [localCategories, setLocalCategories] = useState<string[]>(
      () => MASTER_20_CATEGORIES,
    );

    const [localDescriptions, setLocalDescriptions] = useState<
      Record<string, string[]>
    >(() => ({ ...INITIAL_CATEGORY_ITEMS }));

    const [item, setItem] = useState<BOQItem>({
      ...defaultItemState,
      itemRef: uuidv4(),
    });
    const [itemErrors, setItemErrors] = useState(defaultItemErrorsState);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Group items by category for clean presentation
    const groupedBOQItems = useMemo(() => {
      const groups: Record<
        string,
        { items: BOQItem[]; originalIndices: number[] }
      > = {};
      data.forEach((item, index) => {
        const cat = item.category?.trim() || "General";
        if (!groups[cat]) {
          groups[cat] = { items: [], originalIndices: [] };
        }
        groups[cat].items.push(item);
        groups[cat].originalIndices.push(index);
      });
      return groups;
    }, [data]);

    const availableCategories = useMemo(
      () => localCategories,
      [localCategories],
    );

    const availableDescriptions = useMemo(() => {
      if (!item.category) return [];
      return localDescriptions[item.category] || [];
    }, [item.category, localDescriptions]);

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

    // Cell change in table
    const handleCellChange = (
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
          handleCellChange(rowIndex, "attachments", updatedAtts);
          toast.success(`Logo uploaded: ${saved.fileName}`);
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
      handleCellChange(rowIndex, "attachments", updatedAtts);
      toast.info("Logo attachment removed.");
    };

    // Form logic
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

    const resetForm = () => {
      setItem({
        ...defaultItemState,
        itemRef: uuidv4(),
      });
      setItemErrors(defaultItemErrorsState);
      setEditingIndex(null);
    };

    const handleSaveItem = () => {
      if (validateItem()) {
        const newItem: BOQItem = {
          ...item,
          category: item.category.trim(),
          description: item.description.trim(),
        };

        if (editingIndex !== null) {
          const updated = [...data];
          updated[editingIndex] = newItem;
          onChange(updated);
          toast.success("Item updated successfully!");
        } else {
          onChange([...data, newItem]);
          toast.success(
            `Added "${newItem.description}" under "${newItem.category}"!`,
          );
        }

        resetForm();
        setShowFormModal(false);
      }
    };

    const startEditing = (index: number) => {
      setEditingIndex(index);
      setItem({ ...data[index] });
      setItemErrors(defaultItemErrorsState);
      setShowFormModal(true);
    };

    const removeItem = (index: number) => {
      if (index === editingIndex) resetForm();
      const newData = data.filter((_, i) => i !== index);
      onChange(newData);
      toast.info("Item removed.");
    };

    const handleAddRowDirectly = (categoryName?: string) => {
      const newRow: BOQItem = {
        category: categoryName || availableCategories[0] || "General",
        description: "",
        uom: "Nos",
        qty: "1",
        targetPrice: "0",
        logoRequirement: "without_logo",
        specification: "",
        remarks: "",
        isVisible: true,
        itemRef: uuidv4(),
        attachments: [],
      };
      onChange([...data, newRow]);
      toast.success("New row added to table.");
    };

    // ─── SMART EXCEL BULK UPLOAD WITH FILTERING ──────────────────────────────
    const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });

          if (!rawRows || rawRows.length < 2) {
            toast.error("File is empty or missing data rows.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

          const headerRow = rawRows[0].map((h) =>
            String(h || "")
              .trim()
              .toLowerCase(),
          );
          let catIdx = headerRow.findIndex((h) => h.includes("category"));
          let descIdx = headerRow.findIndex(
            (h) => h.includes("description") || h.includes("item"),
          );
          let uomIdx = headerRow.findIndex(
            (h) => h.includes("uom") || h.includes("unit"),
          );
          let qtyIdx = headerRow.findIndex(
            (h) => h.includes("qty") || h.includes("quantity"),
          );
          let priceIdx = headerRow.findIndex(
            (h) => h.includes("target") || h.includes("price"),
          );
          let specIdx = headerRow.findIndex(
            (h) => h.includes("spec") || h.includes("specification"),
          );
          let logoIdx = headerRow.findIndex((h) => h.includes("logo"));
          let remarkIdx = headerRow.findIndex(
            (h) => h.includes("remark") || h.includes("note"),
          );

          if (catIdx === -1) catIdx = 0;
          if (descIdx === -1) descIdx = 1;
          if (uomIdx === -1) uomIdx = 2;
          if (qtyIdx === -1) qtyIdx = 3;
          if (priceIdx === -1) priceIdx = 4;
          if (specIdx === -1) specIdx = 5;
          if (logoIdx === -1) logoIdx = 6;
          if (remarkIdx === -1) remarkIdx = 7;

          const validItems: BOQItem[] = [];
          const skippedCount = { empty: 0 };

          rawRows.slice(1).forEach((row) => {
            if (!row || row.length === 0) return;

            const categoryVal =
              row[catIdx] != null ? String(row[catIdx]).trim() : "";
            const descVal =
              row[descIdx] != null ? String(row[descIdx]).trim() : "";
            const uomVal =
              row[uomIdx] != null ? String(row[uomIdx]).trim() : "Nos";
            const qtyVal =
              row[qtyIdx] != null ? String(row[qtyIdx]).trim() : "";
            const priceVal =
              row[priceIdx] != null ? String(row[priceIdx]).trim() : "";
            const specVal =
              row[specIdx] != null ? String(row[specIdx]).trim() : "";
            const logoRaw =
              row[logoIdx] != null
                ? String(row[logoIdx]).trim().toLowerCase()
                : "";
            const logoRequirement = logoRaw.includes("with")
              ? "with_logo"
              : "without_logo";
            const remarksVal =
              row[remarkIdx] != null ? String(row[remarkIdx]).trim() : "";

            const hasCategory = categoryVal.length > 0;
            const hasDescription = descVal.length > 0;
            const hasQty =
              qtyVal.length > 0 && !isNaN(Number(qtyVal)) && Number(qtyVal) > 0;
            const hasPrice = priceVal.length > 0;

            if (hasCategory && hasDescription && hasQty && hasPrice) {
              validItems.push({
                category: categoryVal,
                description: descVal,
                uom: uomVal || "Nos",
                qty: qtyVal,
                targetPrice: priceVal,
                specification: specVal,
                logoRequirement,
                remarks: remarksVal,
                isVisible: true,
                itemRef: uuidv4(),
                attachments: [],
              });
            } else {
              skippedCount.empty++;
            }
          });

          if (validItems.length === 0) {
            toast.warn(
              "No valid filled rows found. Please ensure Category, Description, Qty (>0), and Target Price are filled.",
            );
          } else {
            onChange(validItems);
            setUploadedFileName(file.name);
            const uniqueCats = new Set(validItems.map((i) => i.category));
            toast.success(
              `Imported ${validItems.length} items across ${uniqueCats.size} filled categories from ${file.name}!`,
            );
          }
        } catch (err) {
          console.error("Error reading Excel:", err);
          toast.error("Failed to parse Excel file.");
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.readAsBinaryString(file);
    };

    // ─── DOWNLOAD COMPLETE EXCEL SPREADSHEET WITH ENTERED DATA ────────────────
    const downloadFilteredExcel = async () => {
      const ExcelJS = (await import("exceljs")).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Gifting_Category_Sheet");

      const headers = [
        "Category",
        "Description",
        "UOM",
        "Quantity",
        "Target Price (₹)",
        "Specification",
        "Logo Requirement",
        "Remarks",
      ];

      // Add header row with styling
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      // Set column widths
      ws.columns = [
        { width: 22 },
        { width: 32 },
        { width: 10 },
        { width: 14 },
        { width: 18 },
        { width: 38 },
        { width: 20 },
        { width: 22 },
      ];

      const giftingItems = INITIAL_CATEGORY_ITEMS["Gifting Items"] || [];

      // Map each of the 30 default template items under "Gifting Items"
      giftingItems.forEach((desc) => {
        const filled = data.find(
          (d) => (d.description || "").trim().toLowerCase() === desc.toLowerCase(),
        );
        if (filled) {
          ws.addRow([
            filled.category || "Gifting Items",
            filled.description,
            filled.uom || "Nos",
            filled.qty || "",
            filled.targetPrice || "",
            filled.specification || "",
            filled.logoRequirement === "with_logo" ? "With Logo" : "Without Logo",
            filled.remarks || "",
          ]);
        } else {
          ws.addRow([
            "Gifting Items",
            desc,
            "Nos",
            "",
            "",
            "",
            "Without Logo",
            "",
          ]);
        }
      });

      // Append any custom items entered that are not in the standard 30 list
      data.forEach((d) => {
        const isStandard = giftingItems.some(
          (desc) => desc.toLowerCase() === (d.description || "").trim().toLowerCase(),
        );
        if (!isStandard) {
          ws.addRow([
            d.category || "Gifting Items",
            d.description,
            d.uom || "Nos",
            d.qty || "",
            d.targetPrice || "",
            d.specification || "",
            d.logoRequirement === "with_logo" ? "With Logo" : "Without Logo",
            d.remarks || "",
          ]);
        }
      });

      // Add dropdown data validation for "Logo Requirement" column (column G = 7)
      // Apply to all data rows (row 2 onwards, up to a generous limit)
      const lastDataRow = Math.max(ws.rowCount, 200);
      for (let row = 2; row <= lastDataRow; row++) {
        ws.getCell(`G${row}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: ['"With Logo,Without Logo"'],
        };
      }

      // Write and download
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Gifting_Category_Spreadsheet.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Excel sheet downloaded with full template and entered details!");
    };

    // ─── DOWNLOAD BLANK TEMPLATE ───────────────────────────────────────────────
    const download20CategoryTemplate = async () => {
      await downloadFilteredExcel();
    };

    const categoryCount = Object.keys(groupedBOQItems).length;

    // IF FULL-WINDOW EXCEL UI VIEW IS OPEN
    if (showExcelView) {
      return (
        <ExcelSpreadsheetView
          data={data}
          onChange={(newItems) => {
            onChange(newItems);
          }}
          onClose={() => setShowExcelView(false)}
          isFullWindow={isExcelFullWindow}
          onToggleFullWindow={() => setIsExcelFullWindow(!isExcelFullWindow)}
        />
      );
    }

    return (
      <div className="space-y-5">
        {/* ─── Top Toolbar & Header Controls ─── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  setIsExcelFullWindow(true);
                  setShowExcelView(true);
                }}
                className="bg-[#107c41] hover:bg-[#0d6836] text-white font-bold text-xs flex items-center gap-1.5 h-9 shadow-sm"
              >
                <Grid className="w-4 h-4" />
                Open Full Excel View
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadFilteredExcel}
                className="bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 h-9"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Download Excel
              </Button>

              <Label htmlFor="boqExcelUpload" className="cursor-pointer m-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 h-9"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 text-blue-600" />
                    Upload Excel
                  </span>
                </Button>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                id="boqExcelUpload"
                accept=".csv, .xlsx, .xls"
                onChange={handleBulkUpload}
                className="hidden"
              />

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  resetForm();
                  setShowFormModal(true);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 h-9 border border-slate-200"
              >
                <Plus className="w-4 h-4 text-slate-700" />
                Add Item
              </Button>
            </div>
          </div>

          {uploadedFileName && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Active Source File:{" "}
                <strong className="font-semibold text-slate-800">
                  {uploadedFileName}
                </strong>{" "}
                (Filtered automatically)
              </span>
              <button
                type="button"
                onClick={() => setUploadedFileName(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Error Alert Banner */}
        {errors?.boq && (!data || data.length === 0) && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.boq}</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setShowFormModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-8 px-3"
            >
              + Add BOQ Item
            </Button>
          </div>
        )}

        {/* ─── MAIN SIMPLE & NEAT TABLE DISPLAY ─── */}
        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-[#107c41] rounded-full flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                No BOQ Items Added Yet
              </h3>
              <p className="text-xs text-slate-500">
                Open full-window Excel UI to view and edit all 20 categories,
                upload your Excel sheet, or add items manually.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header Summary */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsExcelFullWindow(true);
                    setShowExcelView(true);
                  }}
                  className="h-7 text-xs font-bold text-[#107c41] border-[#107c41] hover:bg-emerald-50 px-2.5 flex items-center gap-1"
                >
                  <Grid className="w-3.5 h-3.5" /> Full Excel View
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddRowDirectly()}
                  className="h-7 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Add Row
                </Button>
              </div>
            </div>

            {/* Clean, Neat Grouped Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-600 uppercase font-bold tracking-wider">
                    <th className="p-3 w-10 text-center border-r border-slate-200">
                      #
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[160px]">
                      Category
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[200px]">
                      Description
                    </th>
                    <th className="p-3 border-r border-slate-200 text-center w-28">
                      Qty & Unit
                    </th>
                    <th className="p-3 border-r border-slate-200 text-right min-w-[140px]">
                      Target Price (₹)
                    </th>
                    <th className="p-3 border-r border-slate-200 text-center w-32">
                      Logo Required
                    </th>
                    <th className="p-3 border-r border-slate-200 min-w-[220px]">
                      Specification
                    </th>
                    <th className="p-3 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                  {Object.entries(groupedBOQItems).map(
                    ([catName, group], catIdx) => (
                      <React.Fragment key={catName}>
                        {/* Category Header Row */}
                        <tr className="bg-slate-50/80 border-y border-slate-200/80">
                          <td colSpan={8} className="px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                                  Category
                                </span>
                                <span className="font-bold text-slate-900 text-xs">
                                  {catName}
                                </span>
                                <span className="text-slate-500 text-[11px] font-medium">
                                  ({group.items.length}{" "}
                                  {group.items.length === 1 ? "item" : "items"})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddRowDirectly(catName)}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                + Add to {catName}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Items under Category */}
                        {group.items.map((row, itemIdx) => {
                          const originalIndex = group.originalIndices[itemIdx];

                          return (
                            <tr
                              key={row.itemRef || originalIndex}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="p-2.5 border-r border-slate-200 text-center font-medium text-slate-500 bg-slate-50/30">
                                {originalIndex + 1}
                              </td>

                              {/* Category Field */}
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  value={row.category}
                                  onChange={(e) =>
                                    handleCellChange(
                                      originalIndex,
                                      "category",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full h-8 px-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs font-semibold text-slate-900 bg-transparent focus:bg-white transition-colors"
                                />
                              </td>

                              {/* Description Field */}
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  value={row.description}
                                  onChange={(e) =>
                                    handleCellChange(
                                      originalIndex,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Description item name..."
                                  className="w-full h-8 px-2 border border-slate-200 rounded text-xs font-semibold text-slate-900 bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              {/* Qty & UOM */}
                              <td className="p-2 border-r border-slate-200 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={row.qty}
                                    onChange={(e) =>
                                      handleCellChange(
                                        originalIndex,
                                        "qty",
                                        e.target.value,
                                      )
                                    }
                                    className="w-14 h-8 px-1 border border-slate-200 rounded text-xs font-bold text-blue-700 text-center bg-white focus:ring-1 focus:ring-blue-500"
                                  />
                                  <select
                                    value={row.uom || "Nos"}
                                    onChange={(e) =>
                                      handleCellChange(
                                        originalIndex,
                                        "uom",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 px-1 border border-slate-200 rounded text-[11px] font-medium bg-slate-50"
                                  >
                                    {uomOptions.map((u) => (
                                      <option key={u.value} value={u.value}>
                                        {u.value}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>

                              {/* Target Price */}
                              <td className="p-2 border-r border-slate-200 text-right">
                                <div className="relative">
                                  <span className="absolute left-2 top-2 text-slate-400 font-medium">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    value={row.targetPrice}
                                    onChange={(e) =>
                                      handleCellChange(
                                        originalIndex,
                                        "targetPrice",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="0"
                                    className="w-full h-8 pl-5 pr-2 border border-slate-200 rounded text-xs font-semibold text-slate-900 text-right bg-white focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </td>

                              {/* Logo Requirement */}
                              <td className="p-2 border-r border-slate-200 text-center">
                                <select
                                  value={row.logoRequirement || "without_logo"}
                                  onChange={(e) =>
                                    handleCellChange(
                                      originalIndex,
                                      "logoRequirement",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "w-full h-8 px-1 text-[10px] font-bold rounded uppercase cursor-pointer border",
                                    row.logoRequirement === "with_logo"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : "bg-slate-50 text-slate-700 border-slate-200",
                                  )}
                                >
                                  <option value="with_logo">With Logo</option>
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

                              {/* Specification */}
                              <td className="p-2 border-r border-slate-200">
                                <input
                                  type="text"
                                  value={row.specification}
                                  onChange={(e) =>
                                    handleCellChange(
                                      originalIndex,
                                      "specification",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Specification details..."
                                  className="w-full h-8 px-2 border border-slate-200 rounded text-xs text-slate-800 bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>

                              {/* Actions */}
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => startEditing(originalIndex)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                    title="Edit Item Details"
                                  >
                                    <FaEdit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(originalIndex)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                    title="Remove Item"
                                  >
                                    <FaTrash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Total <strong>{data.length}</strong> items listed across{" "}
                <strong>{categoryCount}</strong> categories.
              </span>
            </div>
          </div>
        )}

        {/* ─── ADD / EDIT ITEM MODAL ─── */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden space-y-0">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  {editingIndex !== null ? "Edit BOQ Item" : "Add New BOQ Item"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <SearchableSelect
                      id="category"
                      name="category"
                      label="Category"
                      value={item.category}
                      options={availableCategories}
                      onChange={handleItemChange}
                      onAddNewOption={(newCat) => {
                        if (newCat && !localCategories.includes(newCat)) {
                          setLocalCategories((prev) => [...prev, newCat]);
                          setItem((prev) => ({ ...prev, category: newCat }));
                        }
                      }}
                      hasError={!!itemErrors.category}
                      errorMessage={itemErrors.category}
                      placeholder="Select Category..."
                      disabled={disabled}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <SearchableSelect
                      id="description"
                      name="description"
                      label="Description / Item Name"
                      value={item.description}
                      options={availableDescriptions}
                      onChange={handleItemChange}
                      onAddNewOption={(newDesc) => {
                        if (newDesc && item.category) {
                          setLocalDescriptions((prev) => ({
                            ...prev,
                            [item.category]: [
                              ...(prev[item.category] || []),
                              newDesc,
                            ],
                          }));
                          setItem((prev) => ({
                            ...prev,
                            description: newDesc,
                          }));
                        }
                      }}
                      hasError={!!itemErrors.description}
                      errorMessage={itemErrors.description}
                      placeholder={
                        item.category
                          ? `Search ${item.category}...`
                          : "Select category first..."
                      }
                      disabled={!item.category || disabled}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="qty"
                      className="text-xs font-semibold text-slate-800"
                    >
                      Quantity <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="qty"
                      name="qty"
                      value={item.qty}
                      onChange={handleItemChange}
                      placeholder="e.g. 10"
                      className="h-9 text-xs"
                    />
                    {itemErrors.qty && (
                      <p className="text-rose-600 text-[11px]">
                        {itemErrors.qty}
                      </p>
                    )}
                  </div>

                  {/* Target Price */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="targetPrice"
                      className="text-xs font-semibold text-slate-800"
                    >
                      Target Price per Unit (₹){" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="targetPrice"
                      name="targetPrice"
                      value={item.targetPrice}
                      onChange={handleItemChange}
                      placeholder="e.g. 250"
                      className="h-9 text-xs"
                    />
                    {itemErrors.targetPrice && (
                      <p className="text-rose-600 text-[11px]">
                        {itemErrors.targetPrice}
                      </p>
                    )}
                  </div>

                  {/* UOM */}
                  <div className="space-y-1.5">
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-800">
                      Logo Requirement
                    </Label>
                    <div className="flex items-center gap-4 pt-1 text-xs">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="logoRequirement"
                          value="with_logo"
                          checked={item.logoRequirement === "with_logo"}
                          onChange={handleItemChange}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        With Logo
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="logoRequirement"
                          value="without_logo"
                          checked={
                            item.logoRequirement === "without_logo" ||
                            !item.logoRequirement
                          }
                          onChange={handleItemChange}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        Without Logo
                      </label>
                    </div>
                  </div>

                  {/* Specification */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="specification"
                      className="text-xs font-semibold text-slate-800"
                    >
                      Specification
                    </Label>
                    <Textarea
                      id="specification"
                      name="specification"
                      value={item.specification}
                      onChange={handleItemChange}
                      placeholder="Specification details (materials, colors, sizes, packaging...)"
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFormModal(false)}
                  className="text-xs font-semibold text-slate-700 h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-5"
                >
                  {editingIndex !== null ? "Update Item" : "Save Item"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

BOQ.displayName = "BOQ";
