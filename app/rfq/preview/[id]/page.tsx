/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Calendar,
  Contact,
  Phone,
  Send,
  MapPin,
  File,
  Download,
  MessageSquare,
  Lock,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DataType = {
  company?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    businessType?: string;
  };
  requirement?: {
    projectName?: string;
    purpose?: string;
  };
  contact?: {
    logoUrl?: string;
    logoPath?: string;
    logoPreview?: string;
    contactName?: string;
    contactTitle?: string;
    contactDepartment?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddressLine1?: string;
    contactAddressLine2?: string;
    contactCity?: string;
    contactState?: string;
    contactCountry?: string;
    contactPostalCode?: string;
  };
  scope?: {
    deliverables?: Array<{ text: string }>;
  };
  boq?: Array<{
    category?: string;
    description?: string;
    uom?: string;
    qty?: string | number;
    targetPrice?: string | number;
    isVisible?: boolean;
    specification?: string;
    remarks?: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }>;
  evaluation?: string[];
  financials?: {
    budgetType?: string;
    currency?: string;
    paymentTerm?: string;
    paymentTerms?: string;
    pbgAmount?: string | number;
    pbgNotes?: string;
    financialNotes?: string;
  };
  generalTerms?: {
    selectedTerms?: string[];
    deliveryTimeValue?: number;
    deliveryTimeUnit?: string;
    deliveryLocations?: any[];
  };
  specialTerms?: {
    selectedTerms?: string[];
  };
  documentsToShare?: {
    documentsToShare?: string | Array<{ id?: string; name?: string }>;
  };
  vendors?: {
    vendorList?: string[];
    selectionMethod?: string;
    vendorRequirements?: string;
    vendorSelectionProcess?: string;
  };
  rfpDates?: {
    startDate?: string;
    endDate?: string;
    queryDate?: string;
    responseDate?: string;
  };
};

export default function RFQVendorPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfpId = resolvedParams.id;
  const searchParams = useSearchParams();
  const router = useRouter();

  const responseId =
    searchParams.get("response") ||
    searchParams.get("responseId") ||
    `VR-${rfpId.substring(0, 8).toUpperCase()}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<DataType>({});

  useEffect(() => {
    async function fetchRFQ() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rfps/${rfpId}`);
        if (!res.ok) {
          throw new Error("Failed to load RFQ specifications.");
        }
        const data = await res.json();
        setRfpData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load RFQ.");
      } finally {
        setLoading(false);
      }
    }

    if (rfpId) {
      fetchRFQ();
    }
  }, [rfpId]);

  const handleReplyClick = () => {
    router.push(`/rfq/reply/${rfpId}?responseId=${responseId}`);
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-700">Loading RFQ Document...</p>
        </div>
      </div>
    );
  }

  if (error || !rfpData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800">{error || "RFQ not found."}</p>
          <Button onClick={() => router.push("/")} variant="outline" className="text-xs font-bold">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const company = rfpData.company || {};
  const requirement = rfpData.requirement || {};
  const contact = rfpData.contact || {};
  const scope = rfpData.scope || {};
  const boq = rfpData.boq || (rfpData as any).rfpBoqItems || [];
  const evaluation = rfpData.evaluation || (rfpData as any).rfpEvaluationCriteria || [];
  const financials = rfpData.financials || {};
  const generalTerms = rfpData.generalTerms || {};
  const specialTerms = rfpData.specialTerms || {};
  const documentsToShare = rfpData.documentsToShare || {};
  const vendors = rfpData.vendors || {};
  const rfpDates = rfpData.rfpDates || {};

  const rfpUniqId = (rfpData as any).rfpUniqueId || (rfpData as any).rfpuniqId || `RFP-${rfpId.substring(0, 8)}`;
  const projectName = requirement.projectName || (rfpData as any).title || "Facility Expansion & Automation";
  const showTargetPrice = Array.isArray(boq) && boq.some((item) => item?.isVisible);

  return (
    <div className="min-h-screen bg-slate-100/60 font-mono text-slate-800 text-xs flex flex-col">
      {/* Top Header Bar fixed at top */}
      <header className="bg-slate-100 border-b border-slate-200 fixed top-0 left-0 right-0 z-50 shadow-xs py-3 px-6 h-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 h-full">
          {/* Left: Logo & Document Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 relative shrink-0 flex items-center justify-center bg-red-600 rounded-lg overflow-hidden text-white font-bold text-lg shadow-xs">
              {contact.logoUrl || contact.logoPreview ? (
                <Image
                  src={contact.logoPreview || contact.logoUrl || ""}
                  alt="Company Logo"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              ) : (
                "S"
              )}
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Request for Proposal</h1>
              <p className="text-xs text-slate-600 font-semibold">{projectName}</p>
            </div>
          </div>

          {/* Middle: RFQ ID & Deadline Pill */}
          <div className="text-center flex flex-col items-center">
            <div className="text-base font-bold text-blue-700">
              RFQ ID : <span className="text-slate-900">{rfpUniqId}</span>
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 bg-blue-100/80 text-blue-700 px-3 py-0.5 rounded-full text-[11px] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              Valid until: {rfpDates.endDate || "2026-09-30"}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs px-4 h-8 uppercase flex items-center gap-1.5 rounded"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD
            </Button>
            <Button
              onClick={handleReplyClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-8 uppercase flex items-center gap-1.5 rounded shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              REPLY
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-24 flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column (3/4 Width) */}
        <div className="md:col-span-3 space-y-6">
          {/* Section 1: Company Introduction */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                1
              </span>
              Company Introduction
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p>
                <span className="font-bold text-slate-900 capitalize">{company.name || contact.contactName || "KG Corp"}</span> incorporated under Indian Companies Act, having its office at{" "}
                <span className="font-bold text-slate-900 capitalize">
                  {[
                    company.addressLine1 || "894, Sri Ram Colony, Jai Ram Puram",
                    company.city || "Chennai",
                    company.state || "Tamil Nadu",
                    company.country || "India",
                    company.postalCode || "600014",
                  ].filter(Boolean).join(", ")}
                </span>
                , hereinafter referred to as &quot;Company&quot; which expression shall unless repugnant to the context or meaning thereof and include its administrators and successors in interest of the First Part.
              </p>
              <p>
                Company is in the business of{" "}
                <span className="font-bold text-slate-900 capitalize">{company.businessType || "Retail"}</span>
              </p>
            </div>
          </div>

          {/* Section 2: About the Requirement */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                2
              </span>
              About the Requirement
            </h2>
            <p className="text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 capitalize">{company.name || "KG Corp"}</span> has invited you to participate in the RFQ process for <span className="font-bold text-slate-900 capitalize">{projectName}</span> for the purpose of <span className="text-slate-700">{requirement.purpose || "Lorem Ipsum is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since 1966.,"}</span>.
            </p>
          </div>

          {/* Section 3: Scope of Work */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                3
              </span>
              Scope of Work
            </h2>
            <ul className="space-y-2">
              {scope.deliverables && scope.deliverables.length > 0 ? (
                scope.deliverables.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span className="text-slate-700">{typeof item === "string" ? item : item.text}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span className="text-slate-700">Supply, installation, testing, and commissioning of the item as per the specification and scope</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span className="text-slate-700">Supply of items as per the BOQ</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Section 4: BOQ/BOM */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                4
              </span>
              BOQ/BOM
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left font-mono border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
                    <th className="p-2.5 border-r border-slate-200">CATEGORY</th>
                    <th className="p-2.5 border-r border-slate-200">DESCRIPTION</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">UOM</th>
                    <th className="p-2.5 border-r border-slate-200 text-center">QTY</th>
                    <th className="p-2.5 border-r border-slate-200 text-right">TARGET PRICE</th>
                    <th className="p-2.5 border-r border-slate-200">SPECIFICATION</th>
                    <th className="p-2.5 border-r border-slate-200">REMARKS</th>
                    <th className="p-2.5 text-center">ATTACHMENTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {boq.length === 0 ? (
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200">Corporate gift Box</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">Branded Pen</td>
                      <td className="p-2.5 border-r border-slate-200 text-center">Nos</td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-bold">20</td>
                      <td className="p-2.5 border-r border-slate-200 text-right font-bold">100</td>
                      <td className="p-2.5 border-r border-slate-200">testing</td>
                      <td className="p-2.5 border-r border-slate-200">testing</td>
                      <td className="p-2.5 text-center text-slate-400">-</td>
                    </tr>
                  ) : (
                    boq.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200">{item.category || "General"}</td>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{item.description || "Item"}</td>
                        <td className="p-2.5 border-r border-slate-200 text-center">{item.uom || "Nos"}</td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold">{item.qty || item.quantity || 1}</td>
                        <td className="p-2.5 border-r border-slate-200 text-right font-bold">{item.targetPrice || item.price || "0"}</td>
                        <td className="p-2.5 border-r border-slate-200">{typeof item.specification === "object" ? JSON.stringify(item.specification) : item.specification || "-"}</td>
                        <td className="p-2.5 border-r border-slate-200">{item.remarks || "-"}</td>
                        <td className="p-2.5 text-center">
                          {item.attachmentUrl ? (
                            <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              {item.attachmentName || "View"}
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Evaluation Criteria */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                5
              </span>
              Evaluation Criteria
            </h2>
            <ul className="space-y-2">
              {evaluation.length === 0 ? (
                <>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    OEM Only
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Authorized distributor
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Comparable business value
                  </li>
                </>
              ) : (
                evaluation.map((crit: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    {typeof crit === "string" ? crit : crit.evaluation}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Section 6: Financials */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                6
              </span>
              Financials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Cost model</span>
                <p className="font-bold text-slate-900">
                  {financials.budgetType === "mrp"
                    ? "Discount on MRP"
                    : financials.budgetType === "rateCard" || !financials.budgetType
                    ? "Discount On Rate Card"
                    : financials.budgetType}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Currency</span>
                <p className="font-bold text-slate-900">{financials.currency || "INR"}</p>
              </div>
            </div>
          </div>

          {/* Section 7: General Terms & Conditions */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                7
              </span>
              General Terms & Conditions
            </h2>

            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg">
              <span className="font-bold text-slate-800">
                Delivery Lead Time: {generalTerms.deliveryTimeValue || 20} {generalTerms.deliveryTimeUnit || "days"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg space-y-1.5">
              <span className="font-bold text-slate-800 block">Delivery Locations:</span>
              <ul className="list-disc list-inside text-slate-700 pl-2">
                <li>Surat, Gujarat</li>
              </ul>
            </div>

            <ul className="space-y-2">
              {generalTerms.selectedTerms && generalTerms.selectedTerms.length > 0 ? (
                generalTerms.selectedTerms.map((term: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>{term}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>All quotes should be submitted within the defined timeline. Any quote received post the RF date will not be considered.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>By submitting the quote, vendor agrees to participate the bidding and is fully aware of terms and conditions as mentioned in the document.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>Only qualified vendors will be notified for further process.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Section 8: Special Terms & Conditions */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                8
              </span>
              Special Terms & Conditions
            </h2>
            <ul className="space-y-2">
              {specialTerms.selectedTerms && specialTerms.selectedTerms.length > 0 ? (
                specialTerms.selectedTerms.map((term: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>{term}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>All quotes should be submitted within the defined timeline. Any quote received post the RF date will not be considered.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>By submitting the quote, vendor agrees to participate the bidding and is fully aware of terms and conditions as mentioned in the document.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>Only qualified vendors will be notified for further process.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Section 9: Documents to Share */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                9
              </span>
              Documents to Share
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-slate-700">
                <File className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Total installation base</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <File className="w-4 h-4 text-blue-600 shrink-0" />
                <span>List of serviceable location</span>
              </li>
            </ul>
          </div>

          {/* Section 10: Vendor Selection Methods */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold w-6 h-6 rounded-md flex items-center justify-center text-xs">
                10
              </span>
              Vendor Selection Methods
            </h2>
            <p className="text-slate-700">
              <strong className="font-bold text-slate-900">Methods:</strong> Quality-Based Selection
            </p>
          </div>
        </div>

        {/* Right Sidebar (1/4 Width) */}
        <div className="md:col-span-1 space-y-6">
          {/* Contact Information Box */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Contact Information</h3>
            
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Contact className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Contact Name</span>
                  <span className="font-bold text-slate-900">{contact.contactName || "Devipriya Venkatesan"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Send className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Email</span>
                  <span className="font-bold text-slate-900 break-all">{contact.contactEmail || "devipriyavenkatesan.v@gmail.com"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Phone</span>
                  <span className="font-bold text-slate-900">{contact.contactPhone || "+91 8521479630"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Address</span>
                  <span className="font-bold text-slate-900">
                    {company.addressLine1 || "894, Sri Ram Colony, Jai Ram Puram, Chennai, Tamil Nadu, India, 600014"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RFQ Timeline Box */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">RFQ Timeline</h3>
            <div className="space-y-4">
              <div className="relative pl-7">
                <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <span className="font-bold text-slate-900 block">RFQ Release Date</span>
                <span className="text-slate-500 text-[11px]">{rfpDates.startDate || "2025-09-11"}</span>
              </div>

              <div className="relative pl-7">
                <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <span className="font-bold text-slate-900 block">Proposal Submission Deadline</span>
                <span className="text-slate-500 text-[11px]">{rfpDates.endDate || "2025-09-30"}</span>
              </div>
            </div>
          </div>

          {/* Disclaimers Box */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Disclaimers</h3>
            <ul className="text-[11px] text-slate-600 space-y-2 leading-tight">
              <li className="flex items-start gap-1">
                <span>-</span>
                <span>This RFQ is not an offer to contract, but an invitation to submit a proposal.</span>
              </li>
              <li className="flex items-start gap-1">
                <span>-</span>
                <span>Confidential information in this document should not be shared with unauthorized persons.</span>
              </li>
              <li className="flex items-start gap-1">
                <span>-</span>
                <span>The company reserves the right to modify or cancel this RFQ at any time.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-2.5 text-center text-[11px] text-slate-500 font-sans shadow-md">
        <p>Need Assistance? Contact us for support: <a href="mailto:flux@zopapro.com" className="text-blue-600 underline">flux@zopapro.com</a></p>
        <p>© 2026 ZOPA FLUX. All rights reserved.</p>
      </footer>
    </div>
  );
}
