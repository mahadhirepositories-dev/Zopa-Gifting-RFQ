/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { VendorReplyFormData } from "@/lib/types/vendor-reply";

interface Financials {
  budgetType?: string;
  currency?: string;
  pbgAmount?: string;
  paymentTerm?: string;
  paymentMilestones?: Array<{
    id: string;
    milestone: string;
    percentage: string;
    days: string;
    date: string;
    description: string;
  }>;
  pbgNotes?: string;
  financialNotes?: string;
}

interface PaymentTermsProps {
  register: UseFormRegister<VendorReplyFormData>;
  watch: UseFormWatch<VendorReplyFormData>;
  setValue: UseFormSetValue<VendorReplyFormData>;
  errors: FieldErrors<VendorReplyFormData>;
  buyerData: {
    financials?: Financials;
  };
}

export const PaymentTerms: React.FC<PaymentTermsProps> = ({
  register,
  watch,
  setValue,
  buyerData,
}) => {
  const getBudgetTypeDisplay = (type?: string) => {
    switch (type) {
      case "mrp":
        return "Discount on MRP";
      case "rateCard":
        return "Discount on Rate Card";
      case "srp":
        return "Discount on SRP";
      case "fee":
        return "T&M";
      case "cost":
        return "Cost Plus Fee";
      case "unspecified":
        return "Unspecified";
      default:
        return type || "Not specified";
    }
  };

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        5. Confirm on Payment Terms
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Type */}
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <Label className="text-sm font-medium text-gray-700">
            Cost Model:
          </Label>
          <span className="text-sm text-gray-900 font-medium">
            {getBudgetTypeDisplay(buyerData?.financials?.budgetType)}
          </span>
        </div>

        {/* Currency */}
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <Label className="text-sm font-medium text-gray-700">Currency:</Label>
          <span className="text-sm text-gray-900 font-medium">
            {buyerData?.financials?.currency || "INR"}
          </span>
        </div>
      </div>

      {/* PBG Amount */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <Label className="text-sm font-medium text-gray-700">PBG Amount:</Label>
        <p className="text-sm text-gray-900 font-medium">
          {buyerData?.financials?.pbgAmount || "Not specified"}
        </p>
      </div>

      {/* Payment Terms */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <Label className="text-sm font-medium text-gray-700">Payment Terms:</Label>
        <p className="text-sm text-gray-900 font-medium">
          {buyerData?.financials?.paymentTerm || "100% Upon Delivery"}
        </p>
      </div>

      {/* PBG Notes */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <Label className="text-sm font-medium text-gray-700">PBG Notes:</Label>
        <p className="text-sm text-gray-900 font-medium">
          {buyerData?.financials?.pbgNotes || "No notes provided"}
        </p>
      </div>

      {/* Financial Notes */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-2">
        <Label className="text-sm font-medium text-gray-700">Financial Notes:</Label>
        <p className="text-sm text-gray-900 font-medium">
          {buyerData?.financials?.financialNotes || "No notes provided"}
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="paymentTermsRemarks" className="text-sm font-medium text-gray-700">
          Alternate Payment Terms / Remarks
        </Label>
        <Textarea
          id="paymentTermsRemarks"
          rows={3}
          placeholder="Please enter your alternate payment terms or financial remarks..."
          className="w-full bg-white border-gray-300"
          {...register("financialTerms.remarks")}
        />
      </div>
    </section>
  );
};
