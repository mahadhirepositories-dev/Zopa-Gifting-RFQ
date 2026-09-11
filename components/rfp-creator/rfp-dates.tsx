/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { Calendar, ChevronDown, AlertCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";

const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

const formatDateDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface RFPDatesProps {
  data: {
    startDate?: string;
    endDate?: string;
    evaluationEnabled?: boolean;
    evaluationStartDate?: string;
    evaluationEndDate?: string;
    originalEndDate?: string;
    extensionCount?: number;
    lastExtendedAt?: string;
  };
  onChange: (newData: any) => void;
  errors: {
    startDate?: string;
    endDate?: string;
    _general?: string;
  };
  disabled?: boolean;
  rfpId?: string; // RFP ID for extension API calls
  isEditMode?: boolean; // Whether we're editing an existing RFP
}

// Simple Calendar Component
const SimpleCalendar = ({
  selected,
  onSelect,
  disabled,
}: {
  selected?: Date;
  onSelect: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selected || new Date();
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const navigateMonth = (direction: "prev" | "next", e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(
      currentMonth.getMonth() + (direction === "next" ? 1 : -1),
    );
    setCurrentMonth(newMonth);
  };

  const isDateDisabled = (date: Date) => {
    if (disabled && disabled(date)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    return date.getTime() === selected.getTime();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg w-80 z-50">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={(e) => navigateMonth("prev", e)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </button>
        <h3 className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={(e) => navigateMonth("next", e)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="p-1">
            {date && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDateDisabled(date)) {
                    onSelect(date);
                  }
                }}
                disabled={isDateDisabled(date)}
                className={cn(
                  "w-8 h-8 text-sm rounded-md flex items-center justify-center transition-colors",
                  isDateSelected(date)
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100",
                  isDateDisabled(date) &&
                    "text-gray-300 cursor-not-allowed hover:bg-transparent",
                  date.getTime() === today.getTime() &&
                    !isDateSelected(date) &&
                    "bg-blue-50 text-blue-600",
                )}
              >
                {date.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Popover = ({
  children,
  content,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const top = triggerRect.bottom + window.scrollY;
    const left = triggerRect.left + window.scrollX;

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  const [position, setPosition] = useState<{ top?: string; left?: string }>({});

  useEffect(() => {
    if (open) {
      const frame = window.requestAnimationFrame(() => {
        setPosition(calculatePosition());
      });
      const handleResize = () => setPosition(calculatePosition());
      window.addEventListener("resize", handleResize);

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [open]);

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={() => onOpenChange(!open)}>
        {children}
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div ref={popoverRef} className="fixed z-50" style={position}>
            {content}
          </div>
        </>
      )}
    </div>
  );
};

export const RFPDates: React.FC<RFPDatesProps> = ({
  data,
  onChange,
  errors,
  disabled,
  rfpId,
  isEditMode = false,
}) => {
  const safeData = data || {};

  const today = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const dateToString = (date: Date | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const stringToDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
  };

  const [localStartDate, setLocalStartDate] = useState(
    safeData.startDate || today,
  );
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [extensionDate, setExtensionDate] = useState<string>("");
  const [extensionCalendarOpen, setExtensionCalendarOpen] = useState(false);

  const extensionCount = safeData.extensionCount || 0;
  const maxExtensions = 3;
  const canExtend = extensionCount < maxExtensions && isEditMode && !!rfpId;

  useEffect(() => {
    if (!safeData.startDate) {
      const newData = {
        ...safeData,
        startDate: today,
      };
      onChange(newData);
      setLocalStartDate(today);
    } else {
      setLocalStartDate(safeData.startDate);
    }
  }, [safeData.startDate, onChange, today]);

  const handleStartDateChange = (date: Date | undefined) => {
    const dateString = dateToString(date);
    const newData = {
      ...safeData,
      startDate: dateString,
    };
    onChange(newData);
    setLocalStartDate(dateString);
    setStartCalendarOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    const dateString = dateToString(date);
    const newData = {
      ...safeData,
      endDate: dateString,
    };
    onChange(newData);
    setEndCalendarOpen(false);
  };

  const handleExtendDate = async () => {
    if (!rfpId || !safeData.endDate) {
      toast.error("Cannot extend: RFP ID or end date missing");
      return;
    }

    if (!extensionDate) {
      toast.error("Please select a new end date");
      return;
    }

    const currentEndDate = new Date(safeData.endDate);
    const newEndDate = new Date(extensionDate);

    if (newEndDate <= currentEndDate) {
      toast.error("New end date must be after current end date");
      return;
    }

    setIsExtending(true);
    try {
      const response = await fetch(`/api/rfps/${rfpId}/extend-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEndDate: extensionDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extend RFP date");
      }

      const emailStatus =
        result.data.emailsSent === result.data.vendorsNotified
          ? "All vendors notified successfully!"
          : `${result.data.emailsSent}/${result.data.vendorsNotified} vendors notified`;

      toast.success(`RFQ extended successfully! ${emailStatus}`);

      const rfpResponse = await fetch(`/api/rfps/${rfpId}`, {
        cache: "no-store",
      });

      if (rfpResponse.ok) {
        const rfpData = await rfpResponse.json();
        if (rfpData.rfpDates) {
          onChange(rfpData.rfpDates);
        }
      } else {
        const newData = {
          ...safeData,
          endDate: result.data.newEndDate,
          originalEndDate: result.data.originalEndDate,
          extensionCount: result.data.extensionCount,
          lastExtendedAt:
            result.data.updatedDates.lastExtendedAt || new Date().toISOString(),
        };

        onChange(newData);
      }

      setShowExtensionDialog(false);
      setExtensionDate("");
    } catch (error) {
      console.error("Error extending RFP date:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to extend RFP date",
      );
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-xs font-mono text-gray-500 mb-6">
        Set the start and end dates for your RFQ. The quote link will be valid
        for vendors only until the end date.
      </p>

      {/* RFP Dates Form Section */}
      <div className="bg-white rounded-xl shadow-2xs p-5 border border-gray-200">
        {errors._general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errors._general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black flex items-center gap-1">
              RFQ Start Date <span className="text-red-500">*</span>
            </label>
            <Popover
              open={startCalendarOpen}
              onOpenChange={setStartCalendarOpen}
              content={
                <SimpleCalendar
                  selected={stringToDate(localStartDate)}
                  onSelect={handleStartDateChange}
                  disabled={(date) => date < new Date(today)}
                />
              }
            >
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-start px-3.5 h-11 text-xs font-mono border rounded-xl bg-white hover:bg-gray-50 transition-all text-slate-800 shadow-2xs",
                  startCalendarOpen
                    ? "border-2 border-blue-500 outline-none"
                    : "border-gray-200",
                  !localStartDate && "text-gray-400",
                  errors.startDate && "border-red-500",
                  disabled && "bg-gray-100 cursor-not-allowed",
                )}
                disabled={disabled}
              >
                <Calendar className="mr-2.5 h-4 w-4 text-gray-500" />
                {localStartDate && stringToDate(localStartDate) ? (
                  formatDateDisplay(stringToDate(localStartDate)!)
                ) : (
                  <span className="text-gray-400 font-mono">Pick a date</span>
                )}
              </button>
            </Popover>
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black flex items-center gap-1">
              RFQ End Date <span className="text-red-500">*</span>
            </label>

            <Popover
              open={endCalendarOpen}
              onOpenChange={setEndCalendarOpen}
              content={
                <SimpleCalendar
                  selected={stringToDate(safeData.endDate || "")}
                  onSelect={handleEndDateChange}
                  disabled={(date) => {
                    const minDate = stringToDate(localStartDate || today);
                    return minDate ? date < minDate : false;
                  }}
                />
              }
            >
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-start px-3.5 h-11 text-xs font-mono border rounded-xl bg-white hover:bg-gray-50 transition-all text-slate-800 shadow-2xs",
                  endCalendarOpen
                    ? "border-2 border-blue-500 outline-none"
                    : "border-gray-200",
                  !safeData.endDate && "text-gray-400",
                  errors.endDate && "border-red-500",
                  disabled && "bg-gray-100 cursor-not-allowed",
                )}
                disabled={disabled}
              >
                <Calendar className="mr-2.5 h-4 w-4 text-gray-400" />
                {safeData.endDate && stringToDate(safeData.endDate) ? (
                  formatDateDisplay(stringToDate(safeData.endDate)!)
                ) : (
                  <span className="text-gray-400 font-mono">Pick a date</span>
                )}
              </button>
            </Popover>

            {/* Extend button below the date picker */}
            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  if (canExtend) setShowExtensionDialog(true);
                }}
                className={cn(
                  "w-full h-9 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors",
                  canExtend
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                    : "bg-slate-200/80 text-slate-400 cursor-not-allowed opacity-75",
                )}
                disabled={!canExtend || disabled}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Extend</span>
              </button>

              {/* Extension count badge */}
              <div className="pt-0.5">
                <span className="inline-block bg-[#E0EAFF] text-[#1E6BFF] font-mono text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                  Extensions: {extensionCount}/{maxExtensions}
                </span>
                {safeData.originalEndDate &&
                  safeData.originalEndDate !== safeData.endDate && (
                    <span className="text-gray-400 text-xs ml-2 font-mono">
                      (Original:{" "}
                      {stringToDate(safeData.originalEndDate)
                        ? formatDateDisplay(stringToDate(safeData.originalEndDate)!)
                        : safeData.originalEndDate}
                      )
                    </span>
                  )}
              </div>
            </div>

            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Extension Dialog */}
      {showExtensionDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Extend RFQ Deadline
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                  This will extend the deadline for ALL vendors and send them
                  email notifications.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Current End Date
                </label>
                <p className="text-xs font-mono text-slate-600">
                  {safeData.endDate && stringToDate(safeData.endDate)
                    ? formatDateDisplay(stringToDate(safeData.endDate)!)
                    : "Not set"}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  New End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Popover
                    open={extensionCalendarOpen}
                    onOpenChange={setExtensionCalendarOpen}
                    content={
                      <SimpleCalendar
                        selected={
                          extensionDate
                            ? stringToDate(extensionDate)
                            : safeData.endDate
                              ? stringToDate(safeData.endDate)
                              : undefined
                        }
                        onSelect={(date) => {
                          setExtensionDate(dateToString(date));
                          setExtensionCalendarOpen(false);
                        }}
                        disabled={(date) => {
                          const currentEnd = safeData.endDate
                            ? stringToDate(safeData.endDate)
                            : new Date();
                          return currentEnd ? date <= currentEnd : false;
                        }}
                      />
                    }
                  >
                    <button
                      type="button"
                      className="w-full h-10 flex items-center justify-start px-3.5 text-xs font-mono border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {extensionDate && stringToDate(extensionDate) ? (
                        formatDateDisplay(stringToDate(extensionDate)!)
                      ) : (
                        <span className="text-gray-400">
                          Select new end date
                        </span>
                      )}
                    </button>
                  </Popover>
                </div>
              </div>

              {extensionDate && safeData.endDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-mono">
                    Extension:{" "}
                    {Math.ceil(
                      (new Date(extensionDate).getTime() -
                        new Date(safeData.endDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg font-mono">
                Extensions remaining: {maxExtensions - extensionCount}/
                {maxExtensions}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleExtendDate}
                disabled={isExtending || !extensionDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isExtending ? "Extending..." : "Extend Deadline"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExtensionDialog(false);
                  setExtensionDate("");
                  setExtensionCalendarOpen(false);
                }}
                disabled={isExtending}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Preview Section */}
      <div className="bg-white rounded-xl shadow-2xs p-5 border border-gray-200">
        <h3 className="text-sm font-bold mb-4 text-slate-900 tracking-tight">
          Timeline Preview
        </h3>

        <div className="relative space-y-4">
          {/* RFP Start */}
          <div className="flex items-center space-x-3">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0"></div>
            <div>
              <h5 className="text-xs font-semibold text-slate-900">RFQ Start</h5>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {localStartDate && stringToDate(localStartDate)
                  ? `${stringToDate(localStartDate)!.getMonth() + 1}/${stringToDate(localStartDate)!.getDate()}/${stringToDate(localStartDate)!.getFullYear()}`
                  : new Date(today).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* RFP End */}
          {safeData.endDate && (
            <div className="flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full bg-green-600 shrink-0"></div>
              <div>
                <h5 className="text-xs font-semibold text-slate-900">RFQ End</h5>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {stringToDate(safeData.endDate)
                    ? `${stringToDate(safeData.endDate)!.getMonth() + 1}/${stringToDate(safeData.endDate)!.getDate()}/${stringToDate(safeData.endDate)!.getFullYear()}`
                    : safeData.endDate}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 p-3.5 bg-[#F0F6FF] border border-blue-200/80 rounded-xl">
          <p className="text-xs text-blue-700 font-mono italic flex items-center gap-1.5">
            <span>💡</span> Quote link will be valid for vendors only until the end date
          </p>
        </div>
      </div>
    </div>
  );
};

export default function RFPDatesDemo() {
  const [rfpData, setRfpData] = useState({
    startDate: "",
    endDate: "",
    evaluationEnabled: false,
    evaluationStartDate: "",
    evaluationEndDate: "",
  });

  const [errors, setErrors] = useState({});

  const handleDataChange = (newData: any) => {
    setRfpData(newData);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RFPDates
        data={rfpData}
        onChange={handleDataChange}
        errors={errors}
        disabled={false}
      />
    </div>
  );
}
