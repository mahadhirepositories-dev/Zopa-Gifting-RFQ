/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Send, FileText, Building, Calendar, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PreviewProps {
  formData: any;
  categorySelections?: any;
  activeSection?: string;
  data?: any;
  isSubmitting?: boolean;
  handleClick?: () => void;
  navigateTo?: (section: string) => void;
  rfpId?: string;
  disabled?: boolean;
  isLoggedIn?: boolean;
}

export const Preview: React.FC<PreviewProps> = ({
  formData,
  rfpId,
  isLoggedIn,
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRFP = async () => {
    setSubmitting(true);
    try {
      if (rfpId) {
        await fetch(`/api/rfps/${rfpId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Submitted" }),
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">RFQ Successfully Submitted!</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Your Request for Quote has been published to the ZOPA vendor network. Approved vendors will submit their comparative bids shortly.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4 font-bold">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">RFP Summary & Final Review</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review all captured RFP details before dispatching to vendors.</p>
        </div>
        <Button onClick={handleSubmitRFP} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Publish RFQ to Vendors
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <Building className="w-4 h-4" /> Company Info
          </div>
          <p className="text-sm font-bold text-slate-900">{formData.company?.name || formData.contact?.name || "KG Corp"}</p>
          <p className="text-xs text-slate-500">{formData.contact?.contactEmail || "devipriyavenkatesan.v@gmail.com"}</p>
          <p className="text-xs text-slate-500">{formData.company?.addressLine1 || "Chennai, Tamil Nadu"}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <FileText className="w-4 h-4" /> Project Overview
          </div>
          <p className="text-sm font-bold text-slate-900">{formData.requirement?.projectName || "Corporate Festive Gifting 2026"}</p>
          <p className="text-xs text-slate-500 line-clamp-2">{formData.requirement?.purpose || "Annual employee & client hampers"}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <DollarSign className="w-4 h-4" /> Financials
          </div>
          <p className="text-xs text-slate-700">Budget Min: <span className="font-bold">{formData.financials?.budgetMin || "₹5,00,000"}</span></p>
          <p className="text-xs text-slate-700">Budget Max: <span className="font-bold">{formData.financials?.budgetMax || "₹10,00,000"}</span></p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <Calendar className="w-4 h-4" /> Key Dates
          </div>
          <p className="text-xs text-slate-700">Start Date: <span className="font-bold">{formData.rfpDates?.startDate || "Immediate"}</span></p>
          <p className="text-xs text-slate-700">Deadline: <span className="font-bold">{formData.rfpDates?.endDate || "15 Days"}</span></p>
        </div>
      </div>
    </div>
  );
};
