/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

export interface PaymentMilestone {
  id: string;
  milestone: string;
  percentage: string;
  days: string; // Number of days
  date?: string;
  description?: string;
}

export interface FinancialsData {
  budgetType?: string;
  priceModel?: string;
  currency?: string;
  budget?: string;
  budgetMin?: string;
  budgetMax?: string;
  paymentTerm?: string;
  paymentMilestones?: PaymentMilestone[];
  pbgAmount?: string;
  pbgNotes?: string;
  financialNotes?: string;
}

export interface FinancialsHandle {
  validate: () => boolean;
}

interface FinancialsProps {
  data: FinancialsData;
  onChange: (data: FinancialsData) => void;
  errors: Record<string, string>;
  setErrors?: (errors: Record<string, string>) => void;
  disabled?: boolean;
}

export const Financials = forwardRef<FinancialsHandle, FinancialsProps>(
  ({ data, onChange, errors, setErrors, disabled }, ref) => {
    const safeData = data || ({} as FinancialsData);
    const [percentageError, setPercentageError] = useState<string>("");

    const budgetTypeOptions = [
      { id: "mrp", label: "Discount on MRP" },
      { id: "rateCard", label: "Discount on Rate card" },
      { id: "srp", label: "Discount on SRP" },
      { id: "fee", label: "T&M" },
      { id: "cost", label: "Cost plus fee" },
      { id: "unspecified", label: "Unspecified" },
    ];

    const currencyOptions = [
      { id: "INR", label: "INR (₹)" },
      { id: "USD", label: "USD ($)" },
      { id: "EUR", label: "EUR (€)" },
      { id: "GBP", label: "GBP (£)" },
      { id: "CAD", label: "CAD (C$)" },
      { id: "AUD", label: "AUD (A$)" },
      { id: "JPY", label: "JPY (¥)" },
      { id: "CNY", label: "CNY (¥)" },
    ];

    const milestoneOptions = [
      { id: "advance", label: "Advance" },
      { id: "before_dispatch", label: "Before Dispatch" },
      { id: "after_dispatch", label: "After Dispatch" },
      { id: "on_delivery", label: "On Delivery" },
      { id: "after_delivery", label: "After Delivery" },
      { id: "completion", label: "On Completion" },
      { id: "milestone", label: "Project Milestone" },
      { id: "retention", label: "Retention" },
      { id: "other", label: "Other" },
    ];

    const percentageOptions = [
      "5%",
      "10%",
      "15%",
      "20%",
      "25%",
      "30%",
      "35%",
      "40%",
      "45%",
      "50%",
      "55%",
      "60%",
      "65%",
      "70%",
      "75%",
      "80%",
      "85%",
      "90%",
      "95%",
      "100%",
    ];

    // Initialize milestones array if not exists
    useEffect(() => {
      if (!safeData.paymentMilestones) {
        onChange({ ...safeData, paymentMilestones: [] });
      }
    }, []);

    useEffect(() => {
      const paymentTermString = generatePaymentTermString();
      onChange({
        ...safeData,
        paymentTerm: paymentTermString,
      });
    }, [safeData.paymentMilestones]);

    useEffect(() => {
      const total = calculateTotalPercentage();
      if (total > 100) {
        setPercentageError(
          `Total percentage is ${total}% - cannot exceed 100%`,
        );
      } else {
        setPercentageError("");
      }
    }, [safeData.paymentMilestones]);

    useImperativeHandle(ref, () => ({
      validate: () => {
        const newErrors: Record<string, string> = {};
        if (!safeData.budgetType && !safeData.priceModel) {
          newErrors.budgetType = "Price Model is required";
        }
        if (!safeData.currency) {
          newErrors.currency = "Currency is required";
        }
        if (setErrors) {
          setErrors(newErrors);
        }
        return Object.keys(newErrors).length === 0 && !percentageError;
      },
    }));

    const generatePaymentTermString = (): string => {
      if (!data.paymentMilestones || data.paymentMilestones.length === 0)
        return "";

      return data.paymentMilestones
        .map((m) => {
          const desc = m.description ? ` - ${m.description}` : "";
          const date = m.date
            ? ` on ${format(new Date(m.date), "dd/MM/yyyy")}`
            : "";
          const days = m.days ? ` (${m.days} days)` : "";
          return `${m.milestone}: ${m.percentage}${days}${date}${desc}`;
        })
        .join("; ");
    };

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const { name, value } = e.target;
      handleFieldChange(name, value);
    };

    const handleSelectChange = (name: string, value: string) => {
      handleFieldChange(name, value);
    };

    const handleFieldChange = (name: string, value: string) => {
      if (
        setErrors &&
        (name === "budgetType" || name === "priceModel" || name === "currency")
      ) {
        const updatedErrors = { ...errors };
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }
      onChange({ ...data, [name]: value });
    };

    const addMilestone = () => {
      const newMilestone: PaymentMilestone = {
        id: Date.now().toString(),
        milestone: "advance",
        percentage: "50%",
        days: "",
        date: "",
        description: "",
      };
      const updatedMilestones = [
        ...(data.paymentMilestones || []),
        newMilestone,
      ];
      onChange({ ...data, paymentMilestones: updatedMilestones });
    };

    const updateMilestone = (
      id: string,
      field: keyof PaymentMilestone,
      value: string,
    ) => {
      if (!data.paymentMilestones) return;

      const updatedMilestones = data.paymentMilestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m,
      );
      onChange({ ...data, paymentMilestones: updatedMilestones });
    };

    const removeMilestone = (id: string) => {
      if (!data.paymentMilestones) return;

      const updatedMilestones = data.paymentMilestones.filter(
        (m) => m.id !== id,
      );
      onChange({ ...data, paymentMilestones: updatedMilestones });
    };

    const calculateTotalPercentage = () => {
      if (!data.paymentMilestones || data.paymentMilestones.length === 0)
        return 0;

      return data.paymentMilestones.reduce((total, m) => {
        const percentage = parseFloat(m.percentage) || 0;
        return total + percentage;
      }, 0);
    };

    return (
      <div className="bg-white rounded-lg">
        {/* <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          6. Financial Information
        </h2> */}

        {/* Top Row: Price Model & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label
              htmlFor="budgetType"
              className="text-sm font-semibold text-slate-900"
            >
              Price Model <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.budgetType || data.priceModel || ""}
              onValueChange={(value) => handleSelectChange("budgetType", value)}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B]",
                  errors.budgetType &&
                    "border-destructive focus:ring-destructive",
                )}
              >
                <SelectValue placeholder="Select a price model" />
              </SelectTrigger>
              <SelectContent>
                {budgetTypeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budgetType && (
              <div className="text-destructive text-sm font-medium">
                {errors.budgetType}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="currency"
              className="text-sm font-semibold text-slate-900"
            >
              Currency <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.currency || ""}
              onValueChange={(value) => handleSelectChange("currency", value)}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs text-slate-900 placeholder:text-[#64748B]",
                  errors.currency &&
                    "border-destructive focus:ring-destructive",
                )}
              >
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <div className="text-destructive text-sm font-medium">
                {errors.currency}
              </div>
            )}
          </div>
        </div>

        {/* Payment Terms Section */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Payment Terms</h3>
            <div className="flex items-center space-x-4">
              <span
                className={cn(
                  "font-mono text-sm font-medium",
                  calculateTotalPercentage() > 100
                    ? "text-destructive"
                    : "text-[#64748B]",
                )}
              >
                Total: {calculateTotalPercentage()}%
              </span>
              <Button
                type="button"
                onClick={addMilestone}
                disabled={disabled}
                className="bg-[#1E6BFF] hover:bg-[#1557d6] text-white font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                ADD MILESTONE
              </Button>
            </div>
          </div>

          {percentageError && (
            <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/20">
              {percentageError}
            </div>
          )}

          {!data.paymentMilestones || data.paymentMilestones.length === 0 ? (
            <div className="border border-[#E2E8F0] bg-[#F8FAFC]/50 rounded-2xl p-8 text-center shadow-2xs">
              <p className="font-mono text-[13px] text-[#64748B] max-w-lg mx-auto leading-relaxed">
                No payment milestones added. Click &quot;Add Milestone&quot; to
                create payment schedule.
              </p>
            </div>
          ) : (
            <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full">
                <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="text-left p-3.5 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Milestone
                    </th>
                    <th className="text-left p-3.5 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="text-left p-3.5 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="text-left p-3.5 font-semibold text-xs text-slate-700 uppercase tracking-wider w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.paymentMilestones.map((milestone) => (
                    <tr
                      key={milestone.id}
                      className="bg-white hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="p-3">
                        <Select
                          value={milestone.milestone}
                          onValueChange={(value) =>
                            updateMilestone(milestone.id, "milestone", value)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-10 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl font-mono text-[13px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {milestoneOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Select
                          value={milestone.percentage}
                          onValueChange={(value) =>
                            updateMilestone(milestone.id, "percentage", value)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-10 w-24 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl font-mono text-[13px]">
                            <SelectValue placeholder="%" />
                          </SelectTrigger>
                          <SelectContent>
                            {percentageOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={milestone.days}
                          onChange={(e) =>
                            updateMilestone(
                              milestone.id,
                              "days",
                              e.target.value,
                            )
                          }
                          placeholder="No. of days"
                          disabled={disabled}
                          className="h-10 w-28 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl font-mono text-[13px] placeholder:text-[#64748B] placeholder:font-mono"
                          min="0"
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeMilestone(milestone.id)}
                          disabled={disabled}
                          className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Bank Guarantee (PBG) Section */}
        <div className="mb-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            Performance Bank Guarantee (PBG)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="pbgAmount"
                className="text-sm font-medium text-slate-900"
              >
                PBG Amount
              </Label>
              <Input
                id="pbgAmount"
                name="pbgAmount"
                type="text"
                value={data.pbgAmount || ""}
                onChange={handleInputChange}
                placeholder="10% of the order value"
                disabled={disabled}
                className="h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs placeholder:text-[#64748B] placeholder:font-mono text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="pbgNotes"
                className="text-sm font-medium text-slate-900"
              >
                PBG Notes
              </Label>
              <Input
                id="pbgNotes"
                name="pbgNotes"
                value={data.pbgNotes || ""}
                onChange={handleInputChange}
                placeholder="e.g., 12 months from project completion"
                disabled={disabled}
                className="h-11 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-3.5 text-[13px] font-mono shadow-2xs placeholder:text-[#64748B] placeholder:font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Additional Financial Notes Section */}
        <div className="mb-6 space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Additional Financial Notes
          </h3>
          <Textarea
            id="financialNotes"
            name="financialNotes"
            value={data.financialNotes || ""}
            onChange={handleInputChange}
            placeholder="Any additional financial information, constraints, or requirements..."
            rows={3}
            disabled={disabled}
            className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl p-3.5 text-[13px] font-mono shadow-2xs placeholder:text-[#64748B] placeholder:font-mono text-slate-900 min-h-[90px]"
          />
        </div>

        {errors.financials && (
          <div className="text-destructive text-sm font-medium">
            {errors.financials}
          </div>
        )}
      </div>
    );
  },
);

Financials.displayName = "Financials";
