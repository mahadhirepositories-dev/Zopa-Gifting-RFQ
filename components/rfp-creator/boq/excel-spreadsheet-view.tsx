/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Filter,
  Maximize2,
  Minimize2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { BOQItem } from "./index";
import { v4 as uuidv4 } from "uuid";

interface ExcelSpreadsheetViewProps {
  data: BOQItem[];
  onChange: (items: BOQItem[]) => void;
  onClose?: () => void;
  isFullWindow?: boolean;
  onToggleFullWindow?: () => void;
}

// 30 items under "Gifting Items" Category
const GIFTING_DESCRIPTIONS = [
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
];

const INITIAL_TEMPLATE_ROWS = GIFTING_DESCRIPTIONS.map((desc) => ({
  category: "Gifting Items",
  description: desc,
  uom: "Nos",
  qty: "",
  targetPrice: "",
  specification: "",
  logoRequirement: "without_logo",
  remarks: "",
}));

const COL_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const ExcelSpreadsheetView: React.FC<ExcelSpreadsheetViewProps> = ({
  data = [],
  onChange,
  onClose,
  isFullWindow = true,
  onToggleFullWindow,
}) => {
  // Initialize spreadsheet rows: blend template with existing filled items
  const [gridRows, setGridRows] = useState<any[]>(() => {
    if (data && data.length > 0) {
      const templateCopy = INITIAL_TEMPLATE_ROWS.map((r) => ({ ...r }));
      data.forEach((item) => {
        const foundIdx = templateCopy.findIndex(
          (t) =>
            t.category.trim().toLowerCase() === (item.category || "Gifting Items").trim().toLowerCase() &&
            t.description.trim().toLowerCase() === item.description.trim().toLowerCase(),
        );
        if (foundIdx !== -1) {
          templateCopy[foundIdx] = {
            category: item.category || "Gifting Items",
            description: item.description,
            uom: item.uom || "Nos",
            qty: item.qty || "",
            targetPrice: item.targetPrice || "",
            specification: item.specification || "",
            logoRequirement: item.logoRequirement === "with_logo" ? "With Logo" : "Without Logo",
            remarks: item.remarks || "",
          };
        } else {
          templateCopy.push({
            category: item.category || "Gifting Items",
            description: item.description,
            uom: item.uom || "Nos",
            qty: item.qty || "",
            targetPrice: item.targetPrice || "",
            specification: item.specification || "",
            logoRequirement: item.logoRequirement === "with_logo" ? "With Logo" : "Without Logo",
            remarks: item.remarks || "",
          });
        }
      });
      return templateCopy;
    }
    return INITIAL_TEMPLATE_ROWS.map((r) => ({ ...r }));
  });

  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [showOnlyFilledRows, setShowOnlyFilledRows] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Home");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column definitions mapping Excel columns (A-H)
  const columns = useMemo(
    () => [
      { key: "category", name: "Category", letter: "A", width: "w-52" },
      { key: "description", name: "Description", letter: "B", width: "w-60" },
      { key: "uom", name: "UOM", letter: "C", width: "w-24" },
      { key: "qty", name: "Quantity", letter: "D", width: "w-28" },
      { key: "targetPrice", name: "Target Price (₹)", letter: "E", width: "w-36" },
      { key: "specification", name: "Specification", letter: "F", width: "w-64" },
      { key: "logoRequirement", name: "Logo Requirement", letter: "G", width: "w-44" },
      { key: "remarks", name: "Remarks", letter: "H", width: "w-44" },
    ],
    [],
  );

  // Filter rows if toggle is ON
  const visibleGridRows = useMemo(() => {
    if (!showOnlyFilledRows) {
      return gridRows.map((r, idx) => ({ ...r, originalIndex: idx }));
    }
    return gridRows
      .map((r, idx) => ({ ...r, originalIndex: idx }))
      .filter((r) => {
        const hasCat = Boolean(r.category && String(r.category).trim());
        const hasDesc = Boolean(r.description && String(r.description).trim());
        const hasQty = Boolean(r.qty && String(r.qty).trim() && !isNaN(Number(r.qty)) && Number(r.qty) > 0);
        const hasPrice = Boolean(r.targetPrice && String(r.targetPrice).trim());
        return hasCat && hasDesc && hasQty && hasPrice;
      });
  }, [gridRows, showOnlyFilledRows]);

  // Active cell coordinate string (e.g., A1, B4)
  const activeCellCoord = useMemo(() => {
    const colLetter = columns[activeCell.col]?.letter || "A";
    const rowNum = activeCell.row + 1;
    return `${colLetter}${rowNum}`;
  }, [activeCell, columns]);

  // Active cell value derived directly during render (no setState in effect needed)
  const formulaValue = String(
    visibleGridRows[activeCell.row]?.[columns[activeCell.col]?.key] ?? "",
  );

  // Handle cell value updates
  const updateCellValue = (rIdx: number, colKey: string, value: string) => {
    const targetOriginalIdx = visibleGridRows[rIdx]?.originalIndex ?? rIdx;
    setGridRows((prev) => {
      const copy = [...prev];
      if (copy[targetOriginalIdx]) {
        copy[targetOriginalIdx] = {
          ...copy[targetOriginalIdx],
          [colKey]: value,
        };
      }
      return copy;
    });
  };

  // Keyboard navigation & Enter commit
  const handleKeyDown = (e: React.KeyboardEvent, rIdx: number, cIdx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell(null);
      if (rIdx < visibleGridRows.length - 1) {
        setActiveCell({ row: rIdx + 1, col: cIdx });
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
      if (cIdx < columns.length - 1) {
        setActiveCell({ row: rIdx, col: cIdx + 1 });
      } else if (rIdx < visibleGridRows.length - 1) {
        setActiveCell({ row: rIdx + 1, col: 0 });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (rIdx < visibleGridRows.length - 1) setActiveCell({ row: rIdx + 1, col: cIdx });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (rIdx > 0) setActiveCell({ row: rIdx - 1, col: cIdx });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (cIdx < columns.length - 1) setActiveCell({ row: rIdx, col: cIdx + 1 });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (cIdx > 0) setActiveCell({ row: rIdx, col: cIdx - 1 });
    }
  };

  // Upload Excel file directly into Excel UI grid
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawRows || rawRows.length < 2) {
          toast.error("File is empty or has no data rows.");
          return;
        }

        const headerRow = rawRows[0].map((h) => String(h || "").trim().toLowerCase());
        let catIdx = headerRow.findIndex((h) => h.includes("category"));
        let descIdx = headerRow.findIndex((h) => h.includes("description") || h.includes("item"));
        let uomIdx = headerRow.findIndex((h) => h.includes("uom") || h.includes("unit"));
        let qtyIdx = headerRow.findIndex((h) => h.includes("qty") || h.includes("quantity"));
        let priceIdx = headerRow.findIndex((h) => h.includes("target") || h.includes("price"));
        let specIdx = headerRow.findIndex((h) => h.includes("spec") || h.includes("specification"));
        let logoIdx = headerRow.findIndex((h) => h.includes("logo"));
        let remarkIdx = headerRow.findIndex((h) => h.includes("remark") || h.includes("note"));

        if (catIdx === -1) catIdx = 0;
        if (descIdx === -1) descIdx = 1;
        if (uomIdx === -1) uomIdx = 2;
        if (qtyIdx === -1) qtyIdx = 3;
        if (priceIdx === -1) priceIdx = 4;
        if (specIdx === -1) specIdx = 5;
        if (logoIdx === -1) logoIdx = 6;
        if (remarkIdx === -1) remarkIdx = 7;

        const importedRows: any[] = [];
        rawRows.slice(1).forEach((row) => {
          if (!row || row.length === 0) return;
          importedRows.push({
            category: row[catIdx] != null ? String(row[catIdx]).trim() : "Gifting Items",
            description: row[descIdx] != null ? String(row[descIdx]).trim() : "",
            uom: row[uomIdx] != null ? String(row[uomIdx]).trim() : "Nos",
            qty: row[qtyIdx] != null ? String(row[qtyIdx]).trim() : "",
            targetPrice: row[priceIdx] != null ? String(row[priceIdx]).trim() : "",
            specification: row[specIdx] != null ? String(row[specIdx]).trim() : "",
            logoRequirement: row[logoIdx] != null && String(row[logoIdx]).toLowerCase().includes("with") ? "With Logo" : "Without Logo",
            remarks: row[remarkIdx] != null ? String(row[remarkIdx]).trim() : "",
          });
        });

        if (importedRows.length > 0) {
          setGridRows(importedRows);
          toast.success(`Loaded ${importedRows.length} rows directly into Excel UI!`);
        }
      } catch {
        toast.error("Error loading Excel file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // Save/apply filled items to parent RFQ
  const handleApplyToRFQ = () => {
    const validItems: BOQItem[] = [];
    gridRows.forEach((r) => {
      const hasCat = Boolean(r.category && String(r.category).trim());
      const hasDesc = Boolean(r.description && String(r.description).trim());
      const hasQty = Boolean(r.qty && String(r.qty).trim() && !isNaN(Number(r.qty)) && Number(r.qty) > 0);
      const hasPrice = Boolean(r.targetPrice && String(r.targetPrice).trim());

      if (hasCat && hasDesc && hasQty && hasPrice) {
        validItems.push({
          category: String(r.category).trim() || "Gifting Items",
          description: String(r.description).trim(),
          uom: String(r.uom || "Nos").trim(),
          qty: String(r.qty).trim(),
          targetPrice: String(r.targetPrice).trim(),
          specification: String(r.specification || "").trim(),
          logoRequirement: String(r.logoRequirement || "").toLowerCase().includes("with") ? "with_logo" : "without_logo",
          remarks: String(r.remarks || "").trim(),
          isVisible: true,
          itemRef: uuidv4(),
          attachments: [],
        });
      }
    });

    if (validItems.length === 0) {
      toast.warn("No filled items found. Please enter Quantity (>0) and Target Price for required descriptions.");
      return;
    }

    onChange(validItems);
    toast.success(`Applied ${validItems.length} items under "Gifting Items" to RFQ!`);
    if (onClose) onClose();
  };

  // Export complete grid as Excel file
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const headers = ["Category", "Description", "UOM", "Quantity", "Target Price (₹)", "Specification", "Logo Requirement", "Remarks"];
    const exportRows = gridRows.map((r) => [
      r.category || "Gifting Items",
      r.description,
      r.uom || "Nos",
      r.qty || "",
      r.targetPrice || "",
      r.specification || "",
      r.logoRequirement || "Without Logo",
      r.remarks || "",
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
    ws["!cols"] = [{ wch: 22 }, { wch: 32 }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 38 }, { wch: 20 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, "Gifting_Category_Sheet");
    XLSX.writeFile(wb, "Gifting_Category_Spreadsheet.xlsx");
    toast.success("Complete Excel sheet exported with filled details!");
  };

  const handleAddRow = () => {
    setGridRows((prev) => [
      ...prev,
      { category: "Gifting Items", description: "New Item Description", uom: "Nos", qty: "", targetPrice: "", specification: "", logoRequirement: "Without Logo", remarks: "" },
    ]);
    toast.info("New row added to Excel sheet.");
  };

  const filledRowsCount = useMemo(() => {
    return gridRows.filter((r) => r.qty && String(r.qty).trim() && Number(r.qty) > 0 && r.targetPrice && String(r.targetPrice).trim()).length;
  }, [gridRows]);

  return (
    <div
      className={cn(
        "bg-[#f3f4f6] flex flex-col font-sans select-none text-slate-900 border border-slate-300 shadow-2xl overflow-hidden",
        isFullWindow ? "fixed inset-0 z-50 rounded-none" : "w-full rounded-xl min-h-[700px]",
      )}
    >
      {/* ─── 1. EXCEL APPLICATION WINDOW TITLE BAR ─── */}
      <div className="bg-[#107c41] text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold select-none shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-bold">
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>ZOPA EXCEL ENGINE</span>
          </div>
          <span className="font-medium text-white/90 text-[11px] truncate max-w-xs">
            Gifting Category - Google Sheets / Excel UI Mode
          </span>
          <span className="bg-emerald-600/60 text-white text-[10px] px-2 py-0.2 rounded font-mono">
            Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullWindow && (
            <button
              type="button"
              onClick={onToggleFullWindow}
              className="p-1 hover:bg-emerald-700 rounded text-white transition-colors"
              title={isFullWindow ? "Restore Window View" : "Full Window View"}
            >
              {isFullWindow ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-rose-600 rounded text-white transition-colors"
              title="Close Excel UI"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. EXCEL RIBBON TABS & TOOLBAR ─── */}
      <div className="bg-[#f3f4f6] border-b border-slate-300">
        {/* Ribbon Tabs */}
        <div className="flex items-center gap-1 px-2 pt-1 bg-[#e6e8ec] text-xs border-b border-slate-300 text-slate-700">
          {["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "View"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-t border-t border-x border-transparent transition-colors",
                activeTab === tab
                  ? "bg-white text-[#107c41] font-bold border-slate-300 border-b-white -mb-px"
                  : "hover:bg-slate-200 text-slate-700",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="bg-white p-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs border-b border-slate-300">
          <div className="flex items-center gap-2">
            <Label htmlFor="excelUiUpload" className="cursor-pointer m-0">
              <Button
                type="button"
                size="sm"
                className="bg-[#107c41] hover:bg-[#0d6836] text-white font-bold text-xs h-8 flex items-center gap-1.5"
                asChild
              >
                <span>
                  <Upload className="w-3.5 h-3.5" /> Upload File (.xlsx)
                </span>
              </Button>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              id="excelUiUpload"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-8 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-8 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Row
            </Button>

            <div className="h-5 w-px bg-slate-300 mx-1" />

            {/* Filter Toggle */}
            <Button
              type="button"
              variant={showOnlyFilledRows ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyFilledRows(!showOnlyFilledRows)}
              className={cn(
                "font-bold text-xs h-8 flex items-center gap-1.5",
                showOnlyFilledRows
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {showOnlyFilledRows ? "Show All Rows (30)" : "Filter: Filled Rows Only"}
              <span className="bg-slate-800/10 px-1.5 py-0.2 rounded font-mono text-[10px]">
                {filledRowsCount}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Total Rows: <strong>{visibleGridRows.length}</strong> (Filled: <strong>{filledRowsCount}</strong>)
            </span>
            <Button
              type="button"
              onClick={handleApplyToRFQ}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-8 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" /> Apply & Save to RFQ
            </Button>
          </div>
        </div>
      </div>

      {/* ─── 3. EXCEL FORMULA BAR ─── */}
      <div className="bg-white border-b border-slate-300 px-3 py-1 flex items-center gap-2 text-xs font-mono">
        {/* Name Box (Cell Coordinate) */}
        <div className="w-16 h-7 border border-slate-300 bg-slate-50 rounded flex items-center justify-center font-bold text-slate-700 text-xs">
          {activeCellCoord}
        </div>

        {/* Cancel & Accept Formula Buttons */}
        <div className="flex items-center text-slate-400 gap-1 border-r border-slate-300 pr-2">
          <button type="button" className="hover:text-rose-600 font-bold px-1" title="Cancel">
            ✕
          </button>
          <button type="button" className="hover:text-emerald-600 font-bold px-1" title="Accept">
            ✓
          </button>
          <span className="italic font-serif font-bold text-slate-600 text-sm px-1">fx</span>
        </div>

        {/* Formula / Cell Value Editor Input */}
        <input
          type="text"
          value={formulaValue}
          onChange={(e) => {
            updateCellValue(activeCell.row, columns[activeCell.col].key, e.target.value);
          }}
          placeholder="Enter cell data or formula..."
          className="flex-1 h-7 px-2 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-[#107c41] bg-white"
        />
      </div>

      {/* ─── 4. FULL EXCEL GRID TABLE (A-H COLUMNS & 1-N ROWS) ─── */}
      <div className="flex-1 overflow-auto bg-white custom-slim-scrollbar">
        <table className="w-full border-collapse font-mono text-xs text-left min-w-[1000px]">
          {/* Column Header Row (A, B, C, D...) */}
          <thead className="sticky top-0 z-20 bg-[#f3f4f6] text-slate-700 border-b border-slate-300 text-[11px] font-extrabold select-none">
            {/* Top Column Letter Row */}
            <tr className="bg-[#e6e8ec] border-b border-slate-300 text-center">
              <th className="w-12 h-6 border-r border-slate-300 bg-[#d9dce1] text-slate-500 font-mono text-[10px]">
                ◢
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.letter}
                  className={cn(
                    "h-6 border-r border-slate-300 px-2 font-mono font-bold transition-colors",
                    activeCell.col === idx ? "bg-[#107c41] text-white" : "bg-[#e6e8ec] text-slate-600",
                    col.width,
                  )}
                >
                  {col.letter}
                </th>
              ))}
              <th className="w-12 h-6 bg-[#e6e8ec]" />
            </tr>

            {/* Field Label Header Row */}
            <tr className="bg-[#f3f4f6] border-b border-slate-300 text-slate-800">
              <th className="w-12 h-8 border-r border-slate-300 text-center bg-[#e6e8ec] text-slate-500 font-bold">
                1
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={cn(
                    "p-2 border-r border-slate-300 font-bold tracking-tight text-slate-900 bg-slate-100",
                    col.width,
                  )}
                >
                  {col.name}
                </th>
              ))}
              <th className="w-12 h-8" />
            </tr>
          </thead>

          {/* Grid Rows Data (2..N) */}
          <tbody className="divide-y divide-slate-200 bg-white">
            {visibleGridRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
                  No matching spreadsheet rows. Click &quot;Add Row&quot; or turn off filter.
                </td>
              </tr>
            ) : (
              visibleGridRows.map((row, rIdx) => {
                const excelRowNum = rIdx + 2; // Row 1 is header
                const isFilledRow = Boolean(
                  row.qty && String(row.qty).trim() && Number(row.qty) > 0 && row.targetPrice && String(row.targetPrice).trim(),
                );

                return (
                  <tr
                    key={rIdx}
                    className={cn(
                      "hover:bg-blue-50/40 transition-colors",
                      isFilledRow ? "bg-emerald-50/20" : "",
                    )}
                  >
                    {/* Left Row Number Column (1, 2, 3...) */}
                    <td
                      className={cn(
                        "w-12 p-1.5 border-r border-slate-300 text-center font-mono text-[11px] font-bold select-none transition-colors",
                        activeCell.row === rIdx
                          ? "bg-[#107c41] text-white"
                          : "bg-[#f3f4f6] text-slate-500",
                      )}
                    >
                      {excelRowNum}
                    </td>

                    {/* Category Cell (Col A) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 0 })}
                      className={cn(
                        "p-1 border-r border-slate-200 relative",
                        activeCell.row === rIdx && activeCell.col === 0
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="text"
                        value={row.category || "Gifting Items"}
                        onChange={(e) => updateCellValue(rIdx, "category", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 0)}
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </td>

                    {/* Description Cell (Col B) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 1 })}
                      className={cn(
                        "p-1 border-r border-slate-200 relative",
                        activeCell.row === rIdx && activeCell.col === 1
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="text"
                        value={row.description || ""}
                        onChange={(e) => updateCellValue(rIdx, "description", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 1)}
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </td>

                    {/* UOM Cell (Col C) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 2 })}
                      className={cn(
                        "p-1 border-r border-slate-200 text-center relative",
                        activeCell.row === rIdx && activeCell.col === 2
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="text"
                        value={row.uom || "Nos"}
                        onChange={(e) => updateCellValue(rIdx, "uom", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 2)}
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs text-center text-slate-700 focus:outline-none"
                      />
                    </td>

                    {/* Quantity Cell (Col D) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 3 })}
                      className={cn(
                        "p-1 border-r border-slate-200 text-center relative",
                        activeCell.row === rIdx && activeCell.col === 3
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="number"
                        value={row.qty || ""}
                        onChange={(e) => updateCellValue(rIdx, "qty", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 3)}
                        placeholder="Enter Qty"
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs font-bold text-blue-700 text-center focus:outline-none placeholder:text-slate-300"
                      />
                    </td>

                    {/* Target Price Cell (Col E) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 4 })}
                      className={cn(
                        "p-1 border-r border-slate-200 text-right relative",
                        activeCell.row === rIdx && activeCell.col === 4
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="number"
                        value={row.targetPrice || ""}
                        onChange={(e) => updateCellValue(rIdx, "targetPrice", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 4)}
                        placeholder="Enter Price"
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs font-bold text-slate-900 text-right focus:outline-none placeholder:text-slate-300"
                      />
                    </td>

                    {/* Specification Cell (Col F) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 5 })}
                      className={cn(
                        "p-1 border-r border-slate-200 relative",
                        activeCell.row === rIdx && activeCell.col === 5
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="text"
                        value={row.specification || ""}
                        onChange={(e) => updateCellValue(rIdx, "specification", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 5)}
                        placeholder="Specification details..."
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-300"
                      />
                    </td>

                    {/* Logo Requirement Cell (Col G) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 6 })}
                      className={cn(
                        "p-1 border-r border-slate-200 text-center relative",
                        activeCell.row === rIdx && activeCell.col === 6
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <select
                        value={row.logoRequirement || "Without Logo"}
                        onChange={(e) => updateCellValue(rIdx, "logoRequirement", e.target.value)}
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs text-center font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="Without Logo">Without Logo</option>
                        <option value="With Logo">With Logo</option>
                      </select>
                    </td>

                    {/* Remarks Cell (Col H) */}
                    <td
                      onClick={() => setActiveCell({ row: rIdx, col: 7 })}
                      className={cn(
                        "p-1 border-r border-slate-200 relative",
                        activeCell.row === rIdx && activeCell.col === 7
                          ? "outline-2 outline-[#107c41] -outline-offset-1 z-10 bg-white"
                          : "",
                      )}
                    >
                      <input
                        type="text"
                        value={row.remarks || ""}
                        onChange={(e) => updateCellValue(rIdx, "remarks", e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, 7)}
                        placeholder="Optional remarks..."
                        className="w-full h-7 px-1 border-0 bg-transparent text-xs text-slate-700 focus:outline-none placeholder:text-slate-300"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 5. BOTTOM SHEET TABS & STATUS BAR ─── */}
      <div className="bg-[#f3f4f6] border-t border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs text-slate-600 font-sans">
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-300 rounded px-3 py-1 font-bold text-[#107c41] shadow-2xs flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sheet1 (Gifting Category)</span>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700 font-bold px-1" title="Add Sheet">
            +
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <span>Cell: <strong>{activeCellCoord}</strong></span>
          <span>Zoom: 100%</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Ready
          </span>
        </div>
      </div>
    </div>
  );
};
