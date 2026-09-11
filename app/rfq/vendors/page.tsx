/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileText,
  Boxes,
  ListChecks,
  DollarSign,
  FileCheck,
  Calendar,
  Building2,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Info,
  ShieldCheck,
} from "lucide-react";

function VendorRFQPortalContent() {
  const searchParams = useSearchParams();
  const rfpId = searchParams.get("rfpId") || searchParams.get("id");
  const vendorResponseId = searchParams.get("response") || searchParams.get("responseId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpData, setRfpData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Vendor response state
  const [vendorDetails, setVendorDetails] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    deliveryTimeValue: "",
    deliveryTimeUnit: "days",
    remarks: "",
  });

  const [itemQuotes, setItemQuotes] = useState<Record<string, { unitPrice: string; total: string; remarks: string }>>({});

  useEffect(() => {
    if (rfpId) {
      const targetUrl = `/rfq/preview/${rfpId}${vendorResponseId ? `?response=${vendorResponseId}` : ""}`;
      window.location.replace(targetUrl);
      return;
    }
    async function fetchRFQDetails() {
      if (!rfpId) {
        setError("Invalid link: Missing RFQ ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/rfps/${rfpId}`);
        if (!res.ok) {
          throw new Error("Failed to load RFQ details. The link may have expired or is invalid.");
        }
        const data = await res.json();
        setRfpData(data);

        // Initialize item quotes structure if BOQ items exist
        const boqItems = data?.boq || data?.rfpBoqItems || [];
        const initialQuotes: Record<string, { unitPrice: string; total: string; remarks: string }> = {};
        boqItems.forEach((item: any, idx: number) => {
          const key = item.id || `item_${idx}`;
          initialQuotes[key] = { unitPrice: "", total: "0", remarks: "" };
        });
        setItemQuotes(initialQuotes);

        // Check if there's existing response data
        if (vendorResponseId) {
          try {
            const respRes = await fetch(`/api/vendor-response?responseId=${vendorResponseId}`);
            if (respRes.ok) {
              const respData = await respRes.json();
              if (respData?.data) {
                if (respData.data.status === "submitted") {
                  setSubmitted(true);
                }
                if (respData.data.vendorDetails) {
                  setVendorDetails((prev) => ({ ...prev, ...respData.data.vendorDetails }));
                }
                if (respData.data.itemQuotes) {
                  setItemQuotes((prev) => ({ ...prev, ...respData.data.itemQuotes }));
                }
              }
            }
          } catch (e) {
            console.warn("Could not fetch existing vendor response:", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load RFQ details.");
      } finally {
        setLoading(false);
      }
    }

    fetchRFQDetails();
  }, [rfpId, vendorResponseId]);

  const handlePriceChange = (key: string, qty: number, unitPrice: string) => {
    const numericPrice = parseFloat(unitPrice) || 0;
    const lineTotal = (numericPrice * (qty || 1)).toFixed(2);
    setItemQuotes((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { remarks: "" }),
        unitPrice,
        total: lineTotal,
      },
    }));
  };

  const calculateGrandTotal = () => {
    return Object.values(itemQuotes).reduce((acc, curr) => {
      return acc + (parseFloat(curr.total) || 0);
    }, 0).toFixed(2);
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorDetails.companyName || !vendorDetails.contactName || !vendorDetails.email) {
      alert("Please fill in your company name, contact person name, and email.");
      return;
    }

    setSubmitting(true);
    try {
      const grandTotal = calculateGrandTotal();
      const payload = {
        rfpId,
        vendorResponseId,
        vendorDetails,
        itemQuotes,
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
        throw new Error("Failed to submit quotation. Please try again.");
      }

      // Notify buyer via email API
      try {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "vendor-submission",
            data: {
              companyName: rfpData?.company?.name || "Buyer Company",
              projectName: rfpData?.requirement?.projectName || "RFQ",
              vendorEmail: vendorDetails.email,
              vendorCompanyName: vendorDetails.companyName,
              buyerEmail: rfpData?.contact?.contactEmail,
              grandTotal,
            },
          }),
        });
      } catch (mailErr) {
        console.warn("Notification email trigger error:", mailErr);
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit quote.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading RFQ details for vendor response...</p>
        </div>
      </div>
    );
  }

  if (error || !rfpData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-sm">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-xl text-slate-900">RFQ Access Link Expired or Invalid</CardTitle>
            <CardDescription className="text-slate-600">
              {error || "Unable to load RFQ details. Please contact the buyer for a new link."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const boqItems = rfpData?.boq || rfpData?.rfpBoqItems || [];
  const projectName = rfpData?.requirement?.projectName || "Gifting Requirement";
  const buyerCompany = rfpData?.company?.name || rfpData?.rfpsData?.companyName || "Buyer";
  const endDate = rfpData?.rfpDates?.endDate || rfpData?.dates?.endDate || "N/A";
  const docsToShare = rfpData?.documentsToShare?.documentsToShare || rfpData?.documents || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/zopa-logo.svg"
              alt="ZOPA FLUX Logo"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline text-xs font-semibold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
              Vendor Proposal Portal
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Deadline: <strong className="text-slate-900">{endDate}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-blue-200 text-xs uppercase font-bold tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Request for Proposal from {buyerCompany}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{projectName}</h1>
            <p className="text-sm text-blue-100 max-w-2xl">
              You have been invited to submit your competitive quotation and technical proposal for this requirement.
            </p>
          </div>
        </div>

        {submitted ? (
          <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Quotation Submitted Successfully</h2>
            <p className="text-sm text-slate-700 max-w-lg mx-auto">
              Thank you! Your quote for <strong className="text-slate-900">{projectName}</strong> has been received by <strong className="text-slate-900">{buyerCompany}</strong>. The buyer will review your response.
            </p>
            <div className="pt-2">
              <Badge className="bg-emerald-600 text-white text-xs px-3 py-1">Response Status: Submitted</Badge>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmitResponse} className="space-y-6">
            {/* Section 1: Requirement Overview */}
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. About the Requirement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Project Name</label>
                    <p className="font-semibold text-slate-900 text-base">{projectName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Buyer Organization</label>
                    <p className="font-semibold text-slate-900 text-base">{buyerCompany}</p>
                  </div>
                </div>

                {rfpData?.requirement?.purpose && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Purpose / Objective</label>
                    <p className="mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">{rfpData.requirement.purpose}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Scope of Work */}
            {rfpData?.scope?.deliverables && (
              <Card className="border-slate-200 shadow-2xs">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    2. Scope of Work & Deliverables
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {rfpData.scope.deliverables}
                </CardContent>
              </Card>
            )}

            {/* Section 3: Bill of Quantities (BOQ) & Quote Table */}
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <ListChecks className="w-4 h-4 text-blue-600" />
                    3. Items Required & Your Quotation
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Enter your unit price for each item requested below.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5 min-w-[140px]">Category / Item</th>
                      <th className="p-3.5 min-w-[200px]">Description & Specifications</th>
                      <th className="p-3.5 text-center min-w-[80px]">Qty</th>
                      <th className="p-3.5 text-center min-w-[70px]">UOM</th>
                      <th className="p-3.5 min-w-[130px]">Unit Price (INR) <span className="text-red-500">*</span></th>
                      <th className="p-3.5 text-right min-w-[120px]">Line Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {boqItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 text-sm">
                          No BOQ items specified by buyer.
                        </td>
                      </tr>
                    ) : (
                      boqItems.map((item: any, idx: number) => {
                        const key = item.id || `item_${idx}`;
                        const qty = parseFloat(item.qty || item.quantity) || 1;
                        const quote = itemQuotes[key] || { unitPrice: "", total: "0" };

                        return (
                          <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-medium text-slate-900 align-top">
                              {item.category || "Item"}
                            </td>
                            <td className="p-3.5 text-slate-700 align-top">
                              <p className="font-medium text-slate-900">{item.description || "General Item"}</p>
                              {item.specification && typeof item.specification === "object" && (
                                <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                                  {Object.entries(item.specification).map(([k, v]) => (
                                    <div key={k}>
                                      <strong className="capitalize">{k}:</strong> {String(v)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.targetPrice && (
                                <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                  Target Unit: ₹{item.targetPrice}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-900 align-top">
                              {qty}
                            </td>
                            <td className="p-3.5 text-center text-slate-600 align-top">
                              {item.uom || "Units"}
                            </td>
                            <td className="p-3.5 align-top">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={quote.unitPrice}
                                onChange={(e) => handlePriceChange(key, qty, e.target.value)}
                                className="h-9 text-xs font-semibold"
                                required
                              />
                            </td>
                            <td className="p-3.5 text-right font-bold text-slate-900 align-top pt-5">
                              ₹{quote.total}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {boqItems.length > 0 && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end items-center gap-4">
                    <span className="text-sm font-semibold text-slate-700 uppercase">Grand Total (Estimated):</span>
                    <span className="text-xl font-extrabold text-blue-700">₹{calculateGrandTotal()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Vendor Contact Details & Proposal Details */}
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Send className="w-4 h-4 text-blue-600" />
                  4. Your Vendor Information & Proposal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Vendor Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Acme Gifting Solutions Pvt Ltd"
                      value={vendorDetails.companyName}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, companyName: e.target.value }))}
                      className="mt-1 h-9 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={vendorDetails.contactName}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, contactName: e.target.value }))}
                      className="mt-1 h-9 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="vendor@company.com"
                      value={vendorDetails.email}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-1 h-9 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Phone / Mobile</label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={vendorDetails.phone}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Proposed Delivery Lead Time (Days)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 7"
                      value={vendorDetails.deliveryTimeValue}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, deliveryTimeValue: e.target.value }))}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Technical & Commercial Remarks</label>
                    <Textarea
                      placeholder="Add any specific notes, GST inclusions, warranty terms or comments for your quotation..."
                      value={vendorDetails.remarks}
                      onChange={(e) => setVendorDetails((prev) => ({ ...prev, remarks: e.target.value }))}
                      className="mt-1 text-xs"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Action Footer */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 h-11 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Quotation...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Quotation to {buyerCompany}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default function VendorRFQPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VendorRFQPortalContent />
    </Suspense>
  );
}
