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
  const vendors = data.vendors || {};
  const vendorContacts =
    Array.isArray(data.vendorContacts) && data.vendorContacts.length > 0
      ? data.vendorContacts
      : Array.isArray(data.vendorcontacts) && data.vendorcontacts.length > 0
        ? data.vendorcontacts
        : Array.isArray(data.vendorContacts)
          ? data.vendorContacts
          : Array.isArray(data.vendorcontacts)
            ? data.vendorcontacts
            : [];
  const rfpDates = data.rfpDates || data.dates || {};
  const rawDocuments = data.documentsToShare || data.documents;

  const documentsList = React.useMemo(() => {
    if (!rawDocuments) return [];
    let raw = rawDocuments;
    if (typeof raw === "object" && !Array.isArray(raw) && raw !== null) {
      if (raw.documentsToShare !== undefined) raw = raw.documentsToShare;
      else if (raw.documents !== undefined) raw = raw.documents;
    }
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed || trimmed === "[]" || trimmed === "{}") return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => (typeof item === "string" ? item : item?.name || item?.label || "")).filter(Boolean);
        }
      } catch {
        return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(raw)) {
      return raw.map((item) => (typeof item === "string" ? item : item?.name || item?.label || "")).filter(Boolean);
    }
    return [];
  }, [rawDocuments]);

  useEffect(() => {
    // 1. Direct logo candidate properties
    const directLogo =
      contact?.logoUrl ||
      contact?.logoPreview ||
      contact?.logoPath ||
      data?.logoUrl ||
      data?.logoPreview ||
      data?.logoPath ||
      (typeof data?.logo === "string" ? data.logo : null);

    // 2. Check BOQ item attachments for image upload
    let boqImageLogo: string | null = null;
    if (Array.isArray(boq)) {
      for (const item of boq) {
        if (Array.isArray(item.attachments)) {
          const img = item.attachments.find(
            (a: any) =>
              a.fileUrl &&
              (a.fileType?.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(a.fileName || a.fileUrl))
          );
          if (img) {
            boqImageLogo = img.fileUrl;
            break;
          }
        }
      }
    }

    const candidate = directLogo || boqImageLogo;

    if (!candidate) {
      setLogoSrc(null);
      return;
    }

    if (candidate.startsWith("data:") || candidate.startsWith("http://") || candidate.startsWith("https://")) {
      setLogoSrc(candidate);
    } else {
      const cleanPath = candidate.startsWith("/") ? candidate : `/${candidate}`;
      setLogoSrc(cleanPath);
    }
  }, [
    contact?.logoUrl,
    contact?.logoPreview,
    contact?.logoPath,
    data?.logoUrl,
    data?.logoPreview,
    data?.logoPath,
    data?.logo,
    boq,
  ]);

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
         ""
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
            {company.name || "[Company Name]"}
          </span>{" "}
          {getIncorporationText(company.country)}, having its office at{" "}
          <span className="font-bold text-slate-900">
            {company.city || "[City]"}
            {(company.city || "[City]") && ","}{" "}
            {company.state || "[State]"}
            {(company.state || "[State]") && ","}{" "}
            {company.postalCode || "[Postal Code]"}
            {(company.postalCode || "[Postal Code]") && ","}{" "}
            {company.country || "[Country]"}
          </span>
          , hereinafter referred to as &quot;Company&quot;.
          {company.businessType
            ? ` Company is in the business of ${company.businessType}`
            : " "}
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
                  <th className="p-2 text-left">Logo Req.</th>
                  <th className="p-2 text-left">Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {boq.map((item: any, index: number) => {
                  const hasLogo = item.logoRequirement === "with_logo";
                  const attachment =
                    Array.isArray(item.attachments) && item.attachments.length > 0
                      ? item.attachments[0]
                      : null;

                  return (
                    <tr key={index}>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.uom}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">₹{item.targetPrice}</td>
                      <td className="p-2">
                        <span
                          className={
                            hasLogo
                              ? "text-emerald-700 font-bold"
                              : "text-slate-500"
                          }
                        >
                          {hasLogo ? "With Logo" : "Without Logo"}
                        </span>
                        {hasLogo && attachment?.fileUrl && (
                          <div className="text-[10px] mt-0.5">
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline font-bold"
                            >
                              📎 {attachment.fileName || "View Logo"}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="p-2">{item.specification}</td>
                    </tr>
                  );
                })}
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
            6. Financial Information
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
      {(generalTerms?.deliveryTimeValue ||
        (Array.isArray(generalTerms?.selectedTerms) && generalTerms.selectedTerms.length > 0) ||
        (Array.isArray(generalTerms?.customTerms) && generalTerms.customTerms.length > 0) ||
        (Array.isArray(generalTerms?.deliveryLocations) && generalTerms.deliveryLocations.length > 0)) && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            7. General Terms & Conditions
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {generalTerms.deliveryTimeValue && (
              <li>
                Delivery Lead Time: {generalTerms.deliveryTimeValue}{" "}
                {generalTerms.deliveryTimeUnit || "days"}
              </li>
            )}
            {Array.isArray(generalTerms.deliveryLocations) &&
              generalTerms.deliveryLocations.length > 0 && (
                <li>
                  Delivery Locations:{" "}
                  {generalTerms.deliveryLocations
                    .map((loc: any) =>
                      typeof loc === "string"
                        ? loc
                        : loc?.name && loc?.state
                        ? `${loc.name}, ${loc.state}`
                        : loc?.name || String(loc),
                    )
                    .join("; ")}
                </li>
              )}
            {Array.isArray(generalTerms.selectedTerms) &&
              generalTerms.selectedTerms.map((term: string, idx: number) => (
                <li key={`gt-${idx}`}>{term}</li>
              ))}
            {Array.isArray(generalTerms.customTerms) &&
              generalTerms.customTerms.map((term: string, idx: number) => (
                <li key={`gtc-${idx}`}>{term}</li>
              ))}
          </ul>
        </div>
      )}

      {/* 8. Special Terms */}
      {((Array.isArray(specialTerms?.selectedTerms) && specialTerms.selectedTerms.length > 0) ||
        (Array.isArray(specialTerms?.customTerms) && specialTerms.customTerms.length > 0) ||
        (Array.isArray(specialTerms) && specialTerms.length > 0)) && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            8. Special Terms & Conditions
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {Array.isArray(specialTerms.selectedTerms) &&
              specialTerms.selectedTerms.map((term: string, idx: number) => (
                <li key={`st-${idx}`}>{term}</li>
              ))}
            {Array.isArray(specialTerms.customTerms) &&
              specialTerms.customTerms.map((term: string, idx: number) => (
                <li key={`stc-${idx}`}>{term}</li>
              ))}
            {Array.isArray(specialTerms) &&
              specialTerms.map((term: any, idx: number) => (
                <li key={`starr-${idx}`}>{typeof term === "string" ? term : term.text || String(term)}</li>
              ))}
          </ul>
        </div>
      )}

      {/* 9. Documents to Share */}
      {documentsList.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            9. Documents to Share
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {documentsList.map((docName: string, index: number) => (
              <li key={index}>{docName}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 10. Vendor Selection Criteria */}
      {(vendors?.selectionMethod || vendors?.vendorRequirements || vendors?.vendorSelectionProcess) && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            10. Vendor Selection Criteria
          </h3>
          <div className="space-y-1 font-mono text-xs sm:text-sm text-slate-700">
            {vendors.selectionMethod && (
              <p>
                <strong className="font-sans text-slate-900">Selection Method:</strong>{" "}
                {vendors.selectionMethod}
              </p>
            )}
            {vendors.vendorRequirements && (
              <p>
                <strong className="font-sans text-slate-900">Requirements:</strong>{" "}
                {typeof vendors.vendorRequirements === "string"
                  ? vendors.vendorRequirements
                  : JSON.stringify(vendors.vendorRequirements)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 11. Vendor Contacts */}
      {vendorContacts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            11. Vendor Contacts ({vendorContacts.length})
          </h3>
          <ul className="list-disc pl-5 text-slate-700 space-y-1 font-mono text-xs sm:text-sm">
            {vendorContacts.map((vc: any, idx: number) => (
              <li key={idx}>
                <span className="font-bold text-slate-900">{vc.name || vc.companyName}</span> ({vc.email})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 12. RFQ Timeline */}
      {(rfpDates?.startDate || rfpDates?.endDate) && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            12. RFQ Timeline
          </h3>
          <div className="space-y-1 font-mono text-xs sm:text-sm text-slate-700">
            {rfpDates.startDate && (
              <p>
                <strong className="font-sans text-slate-900">Release Date:</strong>{" "}
                {rfpDates.startDate}
              </p>
            )}
            {rfpDates.endDate && (
              <p>
                <strong className="font-sans text-slate-900">Submission Deadline:</strong>{" "}
                {rfpDates.endDate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 13. Buyer Contacts */}
      <div className="space-y-2 pt-2">
        <h3 className="text-base font-bold text-slate-900">
          13. Buyer Contacts
        </h3>
        <div className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-700">
          <p>
            <strong className="font-sans text-slate-900">Contact Name:</strong>{" "}
            {contact.contactName || "Devipriya"}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Email:</strong>{" "}
            {contact.contactEmail || "priya@gmail.com"}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Phone:</strong>{" "}
            {company.isPhoneMasked ? "Masked from vendors" : (contact.contactPhone || "+91 8909876545")}
          </p>
          <p>
            <strong className="font-sans text-slate-900">Address:</strong>{" "}
            {contact.contactCity || company.city || "Chennai"}, {contact.contactState || company.state || "Tamil Nadu"}
            , {contact.contactPostalCode || company.postalCode || "600014"}, {contact.contactCountry || company.country || "India"}
          </p>
        </div>
      </div>
    </div>
  );
};
