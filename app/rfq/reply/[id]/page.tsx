/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  Upload,
  File,
} from "lucide-react";

export default function VendorReplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rfpId = resolvedParams.id;
  const searchParams = useSearchParams();
  const router = useRouter();

  const responseId =
    searchParams.get("responseId") ||
    searchParams.get("response") ||
    `VR-${rfpId.substring(0, 8).toUpperCase()}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 1. Company Introduction State
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "UrbanNext Interiors",
    addressLine1: "12/4 MG Road",
    addressLine2: "Floor 4",
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
    postalCode: "600083",
    phone: "8909865433",
    email: "priyavenkatesan41@gmail.com",
    businessType: "Software Development",
    logoUploaded: true,
  });

  // 2. Scope of Work State
  const [scopeAgreement, setScopeAgreement] = useState<"agree" | "disagree">("agree");
  const [scopeRemarks, setScopeRemarks] = useState("");

  // 3. BOQ Quotes State
  const [boqQuotes, setBoqQuotes] = useState<
    Record<
      string,
      {
        quotePrice: string;
        gstPercent: string;
        make: string;
        model: string;
        compliance: string;
        remarks: string;
      }
    >
  >({});

  // 4. Evaluation Criteria Compliance State
  const [evalCompliance, setEvalCompliance] = useState<
    Record<string, { compliance: string; remarks: string }>
  >({});

  // 5. Financials / Payment Terms State
  const [paymentRemarks, setPaymentRemarks] = useState("");

  // 6. General Terms State
  const [generalAgreement, setGeneralAgreement] = useState<"agree" | "disagree">("agree");
  const [generalRemarks, setGeneralRemarks] = useState("");

  // 7. Special Terms State
  const [specialAgreement, setSpecialAgreement] = useState<"agree" | "disagree">("agree");
  const [specialRemarks, setSpecialRemarks] = useState("");

  // 8. Special Note to Buyer State
  const [specialNote, setSpecialNote] = useState("");

  // 9. Documents State
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    async function loadData() {
      if (!rfpId) {
        setError("Invalid RFQ reference ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/rfps/${rfpId}`);
        if (!res.ok) {
          throw new Error("Failed to load RFQ specifications.");
        }
        const data = await res.json();
        setRfpData(data);

        if (data.vendorContacts && Array.isArray(data.vendorContacts)) {
          const contact = data.vendorContacts[0];
          if (contact) {
            setCompanyInfo((prev) => ({
              ...prev,
              companyName: contact.companyName || contact.name || prev.companyName,
              email: contact.email || prev.email,
              phone: contact.mobileNo || prev.phone,
            }));
          }
        }

        const boqItems = data?.boq || data?.rfpBoqItems || [];
        const initialBoqQuotes: Record<string, any> = {};
        boqItems.forEach((item: any, idx: number) => {
          const key = item.id || `boq_${idx}`;
          initialBoqQuotes[key] = {
            quotePrice: "0",
            gstPercent: "0",
            make: "",
            model: "",
            compliance: "Select",
            remarks: "",
          };
        });
        setBoqQuotes(initialBoqQuotes);

        const evalItems = data?.evaluationCriteria || data?.evaluation || [];
        const initialEval: Record<string, any> = {};
        evalItems.forEach((item: any, idx: number) => {
          const key = item.id || `eval_${idx}`;
          initialEval[key] = { compliance: "Select", remarks: "N/A" };
        });
        setEvalCompliance(initialEval);

        if (responseId) {
          try {
            const respRes = await fetch(`/api/vendor-response?responseId=${responseId}`);
            if (respRes.ok) {
              const respJson = await respRes.json();
              if (respJson?.data) {
                if (respJson.data.status === "submitted") {
                  setSubmitted(true);
                }
                if (respJson.data.companyInfo) {
                  setCompanyInfo((prev) => ({ ...prev, ...respJson.data.companyInfo }));
                }
                if (respJson.data.boqQuotes) {
                  setBoqQuotes((prev) => ({ ...prev, ...respJson.data.boqQuotes }));
                }
                if (respJson.data.evalCompliance) {
                  setEvalCompliance((prev) => ({ ...prev, ...respJson.data.evalCompliance }));
                }
              }
            }
          } catch (e) {
            console.warn("No prior response found:", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load RFQ.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [rfpId, responseId]);

  const calculateLineTotal = (qty: number, priceStr: string, gstStr: string) => {
    const p = parseFloat(priceStr) || 0;
    const g = parseFloat(gstStr) || 0;
    const lineSubtotal = p * qty;
    const gstVal = lineSubtotal * (g / 100);
    return (lineSubtotal + gstVal).toFixed(2);
  };

  const grandTotal = useMemo(() => {
    const boqItems = rfpData?.boq || rfpData?.rfpBoqItems || [];
    return boqItems
      .reduce((acc: number, item: any, idx: number) => {
        const key = item.id || `boq_${idx}`;
        const qty = parseFloat(item.qty || item.quantity) || 1;
        const q = boqQuotes[key];
        if (!q) return acc;
        const lineTot = parseFloat(calculateLineTotal(qty, q.quotePrice, q.gstPercent)) || 0;
        return acc + lineTot;
      }, 0)
      .toFixed(2);
  }, [boqQuotes, rfpData]);

  const hasZeroGst = useMemo(() => {
    return Object.values(boqQuotes).some((q) => (parseFloat(q.gstPercent) || 0) === 0);
  }, [boqQuotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo.companyName || !companyInfo.email || !companyInfo.phone) {
      alert("Please fill in all required company introduction fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rfpId,
        vendorResponseId: responseId,
        companyInfo,
        scopeAgreement,
        scopeRemarks,
        boqQuotes,
        evalCompliance,
        paymentRemarks,
        generalAgreement,
        generalRemarks,
        specialAgreement,
        specialRemarks,
        specialNote,
        grandTotal,
        status: "submitted",
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/vendor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save response. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit vendor response.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Loading Vendor Response Form...</p>
        </div>
      </div>
    );
  }

  if (error || !rfpData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-sm p-6 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold text-slate-900">Unable to Access RFQ Response</h2>
          <p className="text-xs text-slate-600">{error || "Invalid or expired RFQ link."}</p>
        </Card>
      </div>
    );
  }

  const projectName = rfpData?.requirement?.projectName || "Facility Expansion & Automation";
  const rfpUniqId = rfpData?.rfpUniqueId || `RFP-${rfpId.substring(0, 8)}`;
  const buyerName = rfpData?.contact?.contactName || "Devipriya Venkatesan";
  const buyerCompany = rfpData?.company?.name || "KG Corp";
  const buyerAddress = rfpData?.company?.addressLine1 || "894, Sri Ram Colony, Jai Ram Puram";
  const buyerLocation = `${rfpData?.company?.city || "Chennai"}, ${rfpData?.company?.state || "Tamil Nadu"}, India - ${rfpData?.company?.postalCode || "600014"}`;
  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");

  const boqItems = rfpData?.boq || rfpData?.rfpBoqItems || [];
  const evalItems = rfpData?.evaluationCriteria || rfpData?.evaluation || [];
  const financials = rfpData?.financials || {};
  const generalTerms = rfpData?.generalTerms || {};

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 text-xs font-sans">
      {/* Top Header Bar fixed at top */}
      <div className="bg-gray-100 fixed top-0 left-0 right-0 z-10 w-full border-b">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm sm:text-base tracking-tight">
            Response: <span className="font-semibold text-white">{projectName}</span>
          </span>
          <span className="font-bold text-sm tracking-tight text-blue-300">
            RFQ ID : <span className="text-white font-bold">{rfpUniqId}</span>
          </span>
        </div>
        <Button
          onClick={() => router.push(`/rfq/preview/${rfpId}?response=${responseId}`)}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs uppercase px-4 h-8 rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO RFQ
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Quote Header Card */}
        <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-2 font-mono">
            <div>
              <span className="font-bold text-slate-900">
                Quote against the RFQ for &quot;{projectName}&quot; Date: {currentDateFormatted}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-700">Revision :R-0</span>
              <div className="text-[11px] text-slate-400 border border-slate-200 px-2.5 py-1 rounded bg-slate-50">
                Company Logo
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
            {/* Buyer To Info */}
            <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200/80 space-y-1.5 font-mono">
              <span className="font-bold text-slate-900 uppercase block mb-2">TO:</span>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Buyer Name</span>
                <span className="col-span-2 text-slate-900">{buyerName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Company Name</span>
                <span className="col-span-2 text-slate-900">{buyerCompany}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Address</span>
                <span className="col-span-2 text-slate-900">{buyerAddress}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Location</span>
                <span className="col-span-2 text-slate-900">{buyerLocation}</span>
              </div>
            </div>

            {/* Vendor Quote By Info */}
            <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200/80 space-y-1.5 font-mono">
              <span className="font-bold text-slate-900 uppercase block mb-2">QUOTE BY:</span>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Company Name</span>
                <span className="col-span-2 text-slate-900">{companyInfo.companyName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Address</span>
                <span className="col-span-2 text-slate-900">
                  {companyInfo.addressLine1}, {companyInfo.addressLine2}, {companyInfo.city}, {companyInfo.state}, {companyInfo.country}, {companyInfo.postalCode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Phone</span>
                <span className="col-span-2 text-slate-900">{companyInfo.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-700">Email</span>
                <span className="col-span-2 text-slate-900">{companyInfo.email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Vendor Response Quote Section Title */}
        <div className="pt-1">
          <h2 className="text-xs font-bold text-[#2563eb] uppercase tracking-wider font-mono">
            VENDOR RESPONSE QUOTE:
          </h2>
        </div>

        {submitted ? (
          <Card className="bg-emerald-50 border-emerald-300 p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Response Submitted Successfully</h2>
            <p className="text-xs text-slate-700 max-w-md mx-auto">
              Your quote with Response ID <strong className="text-slate-900">{responseId}</strong> has been saved and transmitted to {buyerCompany}.
            </p>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Company Introduction */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                1. Company Introduction
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.addressLine1}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Address Line 2
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.addressLine2}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Select Country <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={companyInfo.country}
                    onValueChange={(val) => setCompanyInfo((prev) => ({ ...prev, country: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 rounded-md">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Select State <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={companyInfo.state}
                    onValueChange={(val) => setCompanyInfo((prev) => ({ ...prev, state: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 rounded-md">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Select City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={companyInfo.city}
                    onValueChange={(val) => setCompanyInfo((prev) => ({ ...prev, city: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs border-slate-200 rounded-md">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.postalCode}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, postalCode: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-md px-2.5 bg-white h-9">
                    <span className="text-xs font-medium text-slate-600">🇮🇳 +91</span>
                    <Input
                      type="text"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      className="h-7 border-none p-0 text-xs focus-visible:ring-0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Business type <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={companyInfo.businessType}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, businessType: e.target.value }))}
                    className="h-9 text-xs border-slate-200 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    Upload Logo
                  </label>
                  <Input type="file" className="h-9 text-xs border-slate-200 rounded-md file:text-xs" />
                  <p className="text-[11px] font-medium text-emerald-600 mt-1">Logo uploaded successfully</p>
                </div>
              </div>
            </Card>

            {/* 2. Scope of work */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                2. Scope of work
              </h3>

              <div className="space-y-2">
                <p className="font-medium text-slate-800">We hereby confirm to fit the requirement as per RFQ:</p>
                <ul className="space-y-1.5 pl-2">
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>Supply, installation, testing, and commissioning of the item as per the specification and scope</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>Supply of items as per the BOQ</span>
                  </li>
                </ul>

                <div className="flex items-center gap-6 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="scopeAgreement"
                      value="agree"
                      checked={scopeAgreement === "agree"}
                      onChange={() => setScopeAgreement("agree")}
                      className="accent-blue-600"
                    />
                    Agree
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="scopeAgreement"
                      value="disagree"
                      checked={scopeAgreement === "disagree"}
                      onChange={() => setScopeAgreement("disagree")}
                      className="accent-blue-600"
                    />
                    Disagree
                  </label>
                </div>

                <div className="pt-2">
                  <label className="font-medium text-slate-700 block mb-1">Remarks (if any)</label>
                  <Textarea
                    value={scopeRemarks}
                    onChange={(e) => setScopeRemarks(e.target.value)}
                    rows={3}
                    className="text-xs border-slate-200 rounded-md"
                  />
                </div>
              </div>
            </Card>

            {/* 3. BOQ/BOM */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4 font-mono">
              <h3 className="font-semibold text-slate-800 text-sm font-sans">
                3. BOQ/BOM
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-slate-200 text-[10px] text-slate-700 uppercase font-bold">
                      <th className="p-2.5 border-r border-slate-200">DESCRIPTION</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-16">QTY</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-28">TARGET PRICE (PER UNIT EXCL TAX)</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-28">YOUR QUOTE PRICE</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-20">GST %</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-28">ITEM TOTAL (INCL. GST)</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-36">DETAILS</th>
                      <th className="p-2.5 border-r border-slate-200 text-center w-28">COMPLIANCE</th>
                      <th className="p-2.5 text-center w-36">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.length === 0 ? (
                      <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900">
                          Branded Pen testing
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center">
                          <span className="font-bold">20</span>
                          <span className="block text-[10px] text-slate-400">Nos</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                          ₹100.00
                        </td>
                        <td className="p-2.5 border-r border-slate-200">
                          <div className="flex items-center gap-1 border border-blue-400 bg-blue-50/40 px-2 py-1 rounded">
                            <span className="text-slate-500 font-bold">₹</span>
                            <Input
                              type="number"
                              defaultValue="0"
                              className="h-6 border-none p-0 text-center font-mono focus-visible:ring-0"
                            />
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-slate-200">
                          <div className="flex items-center gap-1 border border-blue-400 bg-blue-50/40 px-2 py-1 rounded">
                            <Input
                              type="number"
                              defaultValue="0"
                              className="h-6 border-none p-0 text-center font-mono focus-visible:ring-0"
                            />
                            <span className="text-slate-500 font-bold">%</span>
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                          ₹0.00
                        </td>
                        <td className="p-2.5 border-r border-slate-200 space-y-1">
                          <Input type="text" placeholder="Make" className="h-6 text-[11px] font-mono border-blue-200 rounded" />
                          <Input type="text" placeholder="Model" className="h-6 text-[11px] font-mono border-blue-200 rounded" />
                        </td>
                        <td className="p-2.5 border-r border-slate-200">
                          <Select defaultValue="Select">
                            <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Select">Select</SelectItem>
                              <SelectItem value="Compliant">Compliant</SelectItem>
                              <SelectItem value="Deviated">Deviated</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2.5">
                          <Input type="text" placeholder="Enter remarks." className="h-7 text-[11px] font-mono border-slate-200 rounded" />
                        </td>
                      </tr>
                    ) : (
                      boqItems.map((item: any, idx: number) => {
                        const key = item.id || `boq_${idx}`;
                        const qty = parseFloat(item.qty || item.quantity) || 1;
                        const quote = boqQuotes[key] || {
                          quotePrice: "0",
                          gstPercent: "0",
                          make: "",
                          model: "",
                          compliance: "Select",
                          remarks: "",
                        };
                        const itemTotal = calculateLineTotal(qty, quote.quotePrice, quote.gstPercent);

                        return (
                          <tr key={key} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900">
                              {item.description || item.category || `Item ${idx + 1}`}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center">
                              <span className="font-bold">{qty}</span>
                              <span className="block text-[10px] text-slate-400">{item.uom || "Nos"}</span>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                              ₹{item.targetPrice || "0.00"}
                            </td>
                            <td className="p-2.5 border-r border-slate-200">
                              <div className="flex items-center gap-1 border border-blue-400 bg-blue-50/40 px-2 py-1 rounded">
                                <span className="text-slate-500 font-bold">₹</span>
                                <Input
                                  type="number"
                                  value={quote.quotePrice}
                                  onChange={(e) =>
                                    setBoqQuotes((prev) => ({
                                      ...prev,
                                      [key]: { ...prev[key], quotePrice: e.target.value },
                                    }))
                                  }
                                  className="h-6 border-none p-0 text-center font-mono focus-visible:ring-0"
                                />
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-200">
                              <div className="flex items-center gap-1 border border-blue-400 bg-blue-50/40 px-2 py-1 rounded">
                                <Input
                                  type="number"
                                  value={quote.gstPercent}
                                  onChange={(e) =>
                                    setBoqQuotes((prev) => ({
                                      ...prev,
                                      [key]: { ...prev[key], gstPercent: e.target.value },
                                    }))
                                  }
                                  className="h-6 border-none p-0 text-center font-mono focus-visible:ring-0"
                                />
                                <span className="text-slate-500 font-bold">%</span>
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-900">
                              ₹{itemTotal}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 space-y-1">
                              <Input
                                type="text"
                                placeholder="Make"
                                value={quote.make}
                                onChange={(e) =>
                                  setBoqQuotes((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], make: e.target.value },
                                  }))
                                }
                                className="h-6 text-[11px] font-mono border-blue-200 rounded"
                              />
                              <Input
                                type="text"
                                placeholder="Model"
                                value={quote.model}
                                onChange={(e) =>
                                  setBoqQuotes((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], model: e.target.value },
                                  }))
                                }
                                className="h-6 text-[11px] font-mono border-blue-200 rounded"
                              />
                            </td>
                            <td className="p-2.5 border-r border-slate-200">
                              <Select
                                value={quote.compliance}
                                onValueChange={(val) =>
                                  setBoqQuotes((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], compliance: val },
                                  }))
                                }
                              >
                                <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Select">Select</SelectItem>
                                  <SelectItem value="Compliant">Compliant</SelectItem>
                                  <SelectItem value="Deviated">Deviated</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2.5">
                              <Input
                                type="text"
                                placeholder="Enter remarks."
                                value={quote.remarks}
                                onChange={(e) =>
                                  setBoqQuotes((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], remarks: e.target.value },
                                  }))
                                }
                                className="h-7 text-[11px] font-mono border-slate-200 rounded"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end pt-2 space-y-1">
                <div className="flex items-center gap-4 text-xs font-bold font-mono">
                  <span>Grand Total:</span>
                  <span className="text-blue-600 text-sm">₹{grandTotal}</span>
                </div>
                {hasZeroGst && (
                  <p className="text-red-500 font-bold text-[11px] font-mono">
                    You&apos;re proceeding with 0% GST
                  </p>
                )}
              </div>
            </Card>

            {/* 4. Evaluation Criteria */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                4. Evaluation Criteria
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-lg max-w-xl font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-slate-200 text-[10px] text-slate-700 uppercase font-bold">
                      <th className="p-2.5 border-r border-slate-200">CRITERIA</th>
                      <th className="p-2.5 border-r border-slate-200 w-36">COMPLIANCE</th>
                      <th className="p-2.5">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {evalItems.length === 0 ? (
                      <>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">OEM Only</td>
                          <td className="p-2.5">
                            <Select defaultValue="Select">
                              <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Select">Select</SelectItem>
                                <SelectItem value="Compliant">Compliant</SelectItem>
                                <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2.5 text-slate-500">N/A</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">Authorized distributor</td>
                          <td className="p-2.5">
                            <Select defaultValue="Select">
                              <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Select">Select</SelectItem>
                                <SelectItem value="Compliant">Compliant</SelectItem>
                                <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2.5 text-slate-500">N/A</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">Comparable business value</td>
                          <td className="p-2.5">
                            <Select defaultValue="Select">
                              <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Select">Select</SelectItem>
                                <SelectItem value="Compliant">Compliant</SelectItem>
                                <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2.5 text-slate-500">N/A</td>
                        </tr>
                      </>
                    ) : (
                      evalItems.map((item: any, idx: number) => {
                        const key = item.id || `eval_${idx}`;
                        const critText = item.evaluation || item.criterion || item.criteria || `Criteria ${idx + 1}`;
                        const comp = evalCompliance[key] || { compliance: "Select", remarks: "N/A" };

                        return (
                          <tr key={key} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-900">{critText}</td>
                            <td className="p-2.5">
                              <Select
                                value={comp.compliance}
                                onValueChange={(val) =>
                                  setEvalCompliance((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], compliance: val },
                                  }))
                                }
                              >
                                <SelectTrigger className="h-7 text-[11px] font-mono border-blue-200 rounded">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Select">Select</SelectItem>
                                  <SelectItem value="Compliant">Compliant</SelectItem>
                                  <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2.5">
                              <Input
                                type="text"
                                value={comp.remarks}
                                onChange={(e) =>
                                  setEvalCompliance((prev) => ({
                                    ...prev,
                                    [key]: { ...prev[key], remarks: e.target.value },
                                  }))
                                }
                                className="h-7 text-[11px] font-mono rounded"
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 5. Confirm on Payment Terms */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                5. Confirm on Payment Terms
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Cost model</span>
                  <Input
                    type="text"
                    disabled
                    value={financials.budgetType || "Discount On Rate Card"}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Currency</span>
                  <Input
                    type="text"
                    disabled
                    value={financials.currency || "INR"}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Payment Terms</span>
                  <Input
                    type="text"
                    disabled
                    value={financials.paymentTerm || financials.paymentTerms || "No Terms Provided"}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>

                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">PBG Amount</span>
                  <Input
                    type="text"
                    disabled
                    value={financials.pbgAmount || "No Amount provided"}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>

                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Financial Notes</span>
                  <Input
                    type="text"
                    disabled
                    value={financials.financialNotes || "No Notes provided"}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="font-medium text-slate-700 block mb-1">Additional Remarks (if any)</label>
                <Textarea
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  rows={3}
                  className="text-xs border-slate-200 rounded-md"
                  placeholder="Please enter additional remarks regarding financial terms..."
                />
              </div>
            </Card>

            {/* 6. General Terms & Conditions */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                6. General Terms & Conditions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Delivery Lead Time Given:</span>
                  <Input
                    type="text"
                    disabled
                    value={`${generalTerms.deliveryTimeValue || 20} days`}
                    className="h-9 text-xs bg-white border-slate-200 rounded-md"
                  />
                </div>
                <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Delivery Location (s) Split Requirement:</span>
                  <div className="bg-[#2563eb] text-white text-[11px] font-bold px-3 py-1 rounded inline-block">
                    Surat, Gujarat
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-medium text-slate-800 block">General Terms List:</span>
                <ul className="space-y-1.5 pl-2">
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
                </ul>

                <div className="flex items-center gap-6 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="generalAgreement"
                      value="agree"
                      checked={generalAgreement === "agree"}
                      onChange={() => setGeneralAgreement("agree")}
                      className="accent-blue-600"
                    />
                    Agree
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="generalAgreement"
                      value="disagree"
                      checked={generalAgreement === "disagree"}
                      onChange={() => setGeneralAgreement("disagree")}
                      className="accent-blue-600"
                    />
                    Disagree
                  </label>
                </div>

                <div className="pt-2">
                  <label className="font-medium text-slate-700 block mb-1">Additional Remarks (if any)</label>
                  <Textarea
                    value={generalRemarks}
                    onChange={(e) => setGeneralRemarks(e.target.value)}
                    rows={3}
                    className="text-xs border-slate-200 rounded-md"
                    placeholder="Please enter additional remarks regarding general terms..."
                  />
                </div>
              </div>
            </Card>

            {/* 7. Special Terms & Conditions */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                7. Special Terms & Conditions
              </h3>

              <ul className="space-y-1.5 pl-2">
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
              </ul>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="specialAgreement"
                    value="agree"
                    checked={specialAgreement === "agree"}
                    onChange={() => setSpecialAgreement("agree")}
                    className="accent-blue-600"
                  />
                  Agree
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="specialAgreement"
                    value="disagree"
                    checked={specialAgreement === "disagree"}
                    onChange={() => setSpecialAgreement("disagree")}
                    className="accent-blue-600"
                  />
                  Disagree
                </label>
              </div>

              <div className="pt-2">
                <label className="font-medium text-slate-700 block mb-1">Additional Remarks (if any)</label>
                <Textarea
                  value={specialRemarks}
                  onChange={(e) => setSpecialRemarks(e.target.value)}
                  rows={3}
                  className="text-xs border-slate-200 rounded-md"
                  placeholder="Please enter additional remarks regarding special terms..."
                />
              </div>
            </Card>

            {/* 8. Special Note to Buyer */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">
                8. Special Note to Buyer
              </h3>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Remarks (If any)</label>
                <Textarea
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  rows={3}
                  className="text-xs border-slate-200 rounded-md"
                  placeholder="Please enter any special note or remarks to the buyer..."
                />
              </div>
            </Card>

            {/* 9. Attach Required Documents */}
            <Card className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">
                9. Attach Required Documents
              </h3>

              <div className="space-y-4">
                <p className="font-medium text-slate-800">Documents asked by buyer to be uploaded:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-[#f8fafc] text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-medium text-slate-800 text-xs">Total installation base</p>
                    <Input
                      type="file"
                      onChange={(e) => setUploadedFiles((prev) => ({ ...prev, doc1: e.target.files?.[0] || null }))}
                      className="text-xs border-slate-200 rounded-md h-9 file:text-xs"
                    />
                  </div>

                  <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-[#f8fafc] text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-medium text-slate-800 text-xs">List of serviceable location</p>
                    <Input
                      type="file"
                      onChange={(e) => setUploadedFiles((prev) => ({ ...prev, doc2: e.target.files?.[0] || null }))}
                      className="text-xs border-slate-200 rounded-md h-9 file:text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="font-medium text-slate-800 mb-2">Additional Document (If any)</p>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-[#f8fafc] text-center space-y-2">
                    <File className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">Upload optional additional document for buyer review</p>
                    <Input
                      type="file"
                      onChange={(e) => setUploadedFiles((prev) => ({ ...prev, extra: e.target.files?.[0] || null }))}
                      className="text-xs border-slate-200 rounded-md h-9 file:text-xs max-w-md mx-auto"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Bottom Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs uppercase px-8 h-10 rounded-md shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Quote...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT RESPONSE
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Footer fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-2.5 text-center text-[11px] text-slate-500 font-sans shadow-md">
        <p>Need Assistance? Contact us for support: <a href="mailto:flux@zopapro.com" className="text-blue-600 underline">flux@zopapro.com</a></p>
        <p>© 2026 ZOPA FLUX. All rights reserved.</p>
      </footer>
    </div>
  );
}
