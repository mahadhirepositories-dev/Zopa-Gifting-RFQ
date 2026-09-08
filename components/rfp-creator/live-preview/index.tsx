/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Helper function to format delivery locations
const formatDeliveryLocation = (location: any): string => {
  if (typeof location === "string") {
    return location;
  }
  if (typeof location === "object" && location.name && location.state) {
    return `${location.name}, ${location.state}`;
  }
  return String(location);
};

export const PreviewDocument: React.FC<any> = ({ data = {} }) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const company = data.company || {};
  const requirement = data.requirement || {};
  const contact = data.contact || {};
  const scope = data.scope || {};
  const boq = data.boq || [];
  const evaluation = data.evaluation || [];
  const financials = data.financials || {};
  const generalTerms = data.generalTerms || {};
  const specialTerms = data.specialTerms || {};
  const documentsToShare = data.documentsToShare || {};
  const vendors = data.vendors || {};
  const rfpDates = data.rfpDates || {};

  useEffect(() => {
    if (contact?.logoPreview) {
      setLogoSrc(contact.logoPreview);
      return;
    }

    if (contact?.logoPath) {
      if (contact.logoPath.startsWith("data:")) {
        setLogoSrc(contact.logoPath);
      } else {
        try {
          const url = new URL(contact.logoPath);
          setLogoSrc(url.toString());
        } catch {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
          const effectiveBaseUrl =
            baseUrl ||
            (typeof window !== "undefined" ? window.location.origin : "");

          const cleanBaseUrl = effectiveBaseUrl.replace(/\/$/, "");
          const cleanPath = contact.logoPath.startsWith("/")
            ? contact.logoPath
            : `/${contact.logoPath}`;
          setLogoSrc(`${cleanBaseUrl}${cleanPath}`);
        }
      }
    }
  }, [contact?.logoPath, contact?.logoPreview]);

  const handleImageError = () => {
    setLogoSrc(null);
  };

  const getIncorporationText = (country: string) => {
    if (!country) return "incorporated under Indian Companies Act";

    const countryLower = country.toLowerCase();

    switch (countryLower) {
      case "india":
        return "incorporated under Indian Companies Act";
      case "united states":
      case "usa":
      case "us":
        return "incorporated under the laws of the United States";
      case "united kingdom":
      case "uk":
        return "incorporated under the Companies Act of the United Kingdom";
      case "canada":
        return "incorporated under the Canada Business Corporations Act";
      case "australia":
        return "incorporated under the Corporations Act of Australia";
      case "singapore":
        return "incorporated under the Companies Act of Singapore";
      case "united arab emirates":
      case "uae":
        return "incorporated under the laws of the United Arab Emirates";
      default:
        return `incorporated under the laws of ${country}`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6 text-sm text-slate-800">
      {/* Header with Logo */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        {logoSrc ? (
          <div className="relative h-12 w-12 flex items-center justify-center overflow-hidden shrink-0">
            <Image
              src={logoSrc}
              alt="Company Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              unoptimized={true}
              onError={handleImageError}
              key={logoSrc}
            />
          </div>
        ) : (
          <div className="h-10 w-12 flex items-center justify-center bg-red-600 rounded shrink-0 shadow-sm relative overflow-hidden">
            <svg
              viewBox="0 0 100 80"
              className="w-full h-full p-1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 5 L95 25 L50 75 L5 25 Z"
                fill="#DC2626"
                stroke="#F59E0B"
                strokeWidth="4"
              />
              <path
                d="M30 30 C35 25 65 25 70 32 C75 40 40 45 40 50 C40 58 70 55 65 65"
                stroke="#F59E0B"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        <h2 className="text-xl font-bold text-slate-900 truncate tracking-tight">
          {requirement.projectName || "RFQ Document"}
        </h2>
      </div>

      {/* 1. Company Introduction */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-slate-900">
          1. Company Introduction
        </h3>
        <p className="text-slate-700 leading-relaxed font-mono text-xs sm:text-sm">
          <span className="font-bold text-slate-900">
            {company.name || "KG Corp"}
          </span>{" "}
          {getIncorporationText(company.country)}, having its office at{" "}
          <span className="font-bold text-slate-900">
            {company.addressLine1 || "894, Sri Ram Colony"}
            {(company.addressLine1 || "894, Sri Ram Colony") && ","}{" "}
            {company.addressLine2 || "Jai Ram Puram"}
            {(company.addressLine2 || "Jai Ram Puram") && ","}{" "}
            {company.city || "Chennai"}
            {(company.city || "Chennai") && ","}{" "}
            {company.state || "Tamil Nadu"}
            {(company.state || "Tamil Nadu") && ","}{" "}
            {company.postalCode || "600014"}
            {(company.postalCode || "600014") && ","}{" "}
            {company.country || "India"}
          </span>
          , hereinafter referred to as &quot;Company&quot; which expression
          shall unless repugnant to the context or meaning thereof and include
          its administrators and successors in interest of the First Part.
          {company.businessType
            ? ` Company is in the business of ${company.businessType}`
            : " Company is in the business of Retail"}
        </p>
      </div>

      {/* 2. About the Requirement */}
      {requirement.projectName && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            2. About the Requirement
          </h3>
          <p className="text-slate-700 leading-relaxed font-mono text-xs sm:text-sm">
            <span className="font-bold text-slate-900">
              {company.name || "The Company"}
            </span>{" "}
            has invited you to participate in the RFQ process for{" "}
            <span className="font-bold text-slate-900">
              {requirement.projectName}
            </span>
            {requirement.purpose && (
              <>
                {" "}
                for the purpose of{" "}
                <span className="font-bold text-slate-900">
                  {requirement.purpose}.
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* 3. Scope of Work */}
      {scope.deliverables?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            3. Scope of Work
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {scope.deliverables.map((deliverable: any, index: number) => (
              <li key={index}>{deliverable.text || deliverable}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. BOQ/BOM */}
      {boq?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">4. BOQ/BOM</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">UOM</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Target Price</th>
                  <th className="p-2 text-left">Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {boq.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">{item.uom}</td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">{item.targetPrice}</td>
                    <td className="p-2">{item.specification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Evaluation Criteria */}
      {evaluation?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            5. Evaluation Criteria
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {evaluation.map((criteria: string, index: number) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Financials */}
      {(financials?.budgetType ||
        financials?.currency ||
        financials?.paymentTerm ||
        financials?.pbgAmount ||
        financials?.financialNotes) && (
        <div className="space-y-1 font-mono text-xs sm:text-sm text-slate-700">
          <h3 className="text-base font-bold text-slate-900 font-sans mb-2">
            6. Financials
          </h3>
          {financials.budgetType && (
            <p>
              <strong className="font-sans text-slate-900">Price model: </strong>
              {financials.budgetType}
            </p>
          )}
          {financials.currency && (
            <p>
              <strong className="font-sans text-slate-900">Currency:</strong>{" "}
              {financials.currency}
            </p>
          )}
          {financials.paymentTerm && (
            <p>
              <strong className="font-sans text-slate-900">Payment Terms:</strong>{" "}
              {financials.paymentTerm}
            </p>
          )}
        </div>
      )}

      {/* 7. General Terms */}
      {generalTerms?.deliveryTimeValue && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            7. General Terms & Conditions
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            <li>
              Delivery Lead Time: {generalTerms.deliveryTimeValue}{" "}
              {generalTerms.deliveryTimeUnit || "days"}
            </li>
          </ul>
        </div>
      )}

      {/* 10. Buyer Contacts */}
      <div className="space-y-2 pt-2">
        <h3 className="text-base font-bold text-slate-900">
          10. Buyer Contacts
        </h3>
        <div className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-700">
          <p>
            <strong className="font-sans text-slate-900">Contact Name:</strong>{" "}
            {contact.contactName || "Devipriya Venkatesan"}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Email:</strong>{" "}
            {contact.contactEmail || "devipriyavenkatesan.v@gmail.com"}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Phone:</strong>{" "}
            {contact.contactPhone || "+91 8521479630"}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Address:</strong>{" "}
            {contact.contactAddressLine1 || "894, Sri Ram Colony"}
            {contact.contactAddressLine2 ? `, ${contact.contactAddressLine2}` : " , Jai Ram Puram"}
            , {contact.contactCity || "Chennai"}, {contact.contactState || "Tamil Nadu"}
            , {contact.contactPostalCode || "600014"}, {contact.contactCountry || "India"}
          </p>
        </div>
      </div>
    </div>
  );
};
