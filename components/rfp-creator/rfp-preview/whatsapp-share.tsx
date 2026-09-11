"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { Loader2, MessageCircle, Check, AlertCircle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VendorContact {
  name: string;
  email: string;
  mobileNo: string;
  countryCode?: string;
  companyName?: string;
  emailSent?: boolean;
  email_sent?: boolean;
  whatsappSent?: boolean;
  isFromMaster?: boolean;
  masterVendorId?: string | number | null;
}

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: VendorContact[];
  rfpId: string;
  rfpName: string;
  companyName: string;
  endDate: string;
  onSuccess?: () => void;
}

interface VendorShareStatus {
  email: string;
  status: "idle" | "processing" | "success" | "error";
  error?: string;
  whatsappUrl?: string;
  vendorResponseId?: string;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  vendors,
  rfpId,
  rfpName,
  companyName,
  endDate,
  onSuccess,
}) => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vendorStatuses, setVendorStatuses] = useState<
    Map<string, VendorShareStatus>
  >(new Map());
  const [showResults, setShowResults] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://staging-rfp.zopapro.com";

  // Filter vendors who have valid phone numbers
  const vendorsWithPhone = vendors.filter(
    (v) => v.mobileNo && v.mobileNo.length >= 10,
  );

  const toggleVendor = (email: string) => {
    setSelectedVendors((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const toggleAll = () => {
    if (selectedVendors.length === vendorsWithPhone.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendorsWithPhone.map((v) => v.email));
    }
  };

  const generateWhatsAppMessage = (vendorName: string, uniqueUrl: string) => {
    const message = `Hello ${vendorName},

You have been invited to submit a proposal for: *${rfpName}*

Company: ${companyName}
Submission Deadline: ${new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}

Click the link below to view the RFQ details and submit your proposal:
${uniqueUrl}

Please respond before the deadline.

Thank you!`;

    return encodeURIComponent(message);
  };

  const createVendorResponseAndGetLink = async (
    vendor: VendorContact,
  ): Promise<{
    success: boolean;
    url?: string;
    vendorResponseId?: string;
    error?: string;
  }> => {
    try {
      // Step 1: Create or get vendor
      let vendorId;
      let vendorData;

      const vendorRes = await fetch(
        `/api/vendors?email=${encodeURIComponent(vendor.email)}`,
      );

      if (vendorRes.ok) {
        vendorData = await vendorRes.json();
        vendorId = vendorData.id;
      } else if (vendorRes.status === 404) {
        const createRes = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: vendor.name || vendor.email.split("@")[0],
            email: vendor.email,
            companyName: vendor.companyName || "Unknown",
            mobileNo: vendor.mobileNo || "",
          }),
        });

        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err?.error || "Failed to create vendor");
        }

        vendorData = await createRes.json();
        vendorId = vendorData.id;
      } else {
        throw new Error(`Failed to fetch vendor: ${vendorRes.statusText}`);
      }

      // Step 2: Create vendor response
      const responseRes = await fetch("/api/vendor-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfpId,
          vendorId,
          vendorEmail: vendor.email,
          status: "draft",
          isFromMaster: vendor.isFromMaster || false,
          masterVendorId: vendor.masterVendorId || null,
        }),
      });

      if (!responseRes.ok) {
        const err = await responseRes.json();
        throw new Error(err?.error || "Failed to create vendor response");
      }

      const { vendorResponseId } = await responseRes.json();

      // Step 3: Create access token by calling the same API endpoint that email uses
      // This will generate session ID and token, and store it in rfp_access_tokens table
      const tokenRes = await fetch("/api/rfp-auth/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: vendor.email,
          rfpId: rfpId,
          vendorResponseId: vendorResponseId,
          expiresAt: endDate, // Use the RFQ end date
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err?.error || "Failed to create access token");
      }

      const { sessionId } = await tokenRes.json();

      // Step 4: Generate unique URL with both response and sid parameters
      const vendorUrl = `${baseUrl}/rfp/preview/${rfpId}?response=${vendorResponseId}&sid=${sessionId}`;

      return { success: true, url: vendorUrl, vendorResponseId };
    } catch (error) {
      console.error(
        `Error creating vendor response for ${vendor.email}:`,
        error,
      );
      return { success: false, error: (error as Error).message };
    }
  };

  const handleGenerateLinks = async () => {
    if (selectedVendors.length === 0) {
      toast.error("Please select at least one vendor");
      return;
    }

    setIsProcessing(true);
    setShowResults(true);
    const statusMap = new Map<string, VendorShareStatus>();

    // Initialize status for all selected vendors
    selectedVendors.forEach((email) => {
      statusMap.set(email, { email, status: "processing" });
    });
    setVendorStatuses(new Map(statusMap));

    // Process each vendor
    for (const email of selectedVendors) {
      const vendor = vendors.find((v) => v.email === email);
      if (!vendor) continue;

      const result = await createVendorResponseAndGetLink(vendor);

      if (result.success && result.url && result.vendorResponseId) {
        const phoneNumber = vendor.mobileNo.replace(/[^0-9+]/g, "");
        const message = generateWhatsAppMessage(
          vendor.name || vendor.companyName || "Vendor",
          result.url,
        );
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        statusMap.set(email, {
          email,
          status: "success",
          whatsappUrl,
          vendorResponseId: result.vendorResponseId,
        });

        // Update whatsapp sent status in database
        try {
          await fetch("/api/update-vendor-email-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              rfpId,
              whatsappSent: true,
            }),
          });
        } catch (error) {
          console.error("Failed to update WhatsApp status:", error);
        }
      } else {
        statusMap.set(email, {
          email,
          status: "error",
          error: result.error || "Failed to generate link",
        });
      }

      setVendorStatuses(new Map(statusMap));
    }

    setIsProcessing(false);

    const successCount = Array.from(statusMap.values()).filter(
      (s) => s.status === "success",
    ).length;
    if (successCount > 0) {
      toast.success(
        `Generated WhatsApp links for ${successCount} vendor${successCount > 1 ? "s" : ""}`,
      );
      onSuccess?.();
    }
  };

  const handleOpenWhatsApp = (whatsappUrl: string) => {
    window.open(whatsappUrl, "_blank");
  };

  const handleOpenAllWhatsApp = () => {
    const successStatuses = Array.from(vendorStatuses.values()).filter(
      (s) => s.status === "success" && s.whatsappUrl,
    );

    if (successStatuses.length === 0) {
      toast.error("No WhatsApp links available");
      return;
    }

    // Open each WhatsApp link with a small delay to prevent browser blocking
    successStatuses.forEach((status, index) => {
      setTimeout(() => {
        if (status.whatsappUrl) {
          window.open(status.whatsappUrl, "_blank");
        }
      }, index * 500); // 500ms delay between each
    });

    toast.success(
      `Opening ${successStatuses.length} WhatsApp conversation${successStatuses.length > 1 ? "s" : ""}`,
    );
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleReset = () => {
    setShowResults(false);
    setVendorStatuses(new Map());
    setSelectedVendors([]);
  };

  const getVendorDisplayName = (vendor: VendorContact) => {
    return vendor.name || vendor.companyName || vendor.email;
  };

  const successCount = Array.from(vendorStatuses.values()).filter(
    (s) => s.status === "success",
  ).length;
  const errorCount = Array.from(vendorStatuses.values()).filter(
    (s) => s.status === "error",
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Share RFQ via WhatsApp
          </DialogTitle>
          <DialogDescription>
            {!showResults
              ? "Share RFQ with vendors via WhatsApp in addition to email. Each vendor will receive a personalized link with their unique response ID."
              : `Generated links for ${successCount} vendor${successCount !== 1 ? "s" : ""}${errorCount > 0 ? `, ${errorCount} failed` : ""}`}
          </DialogDescription>
        </DialogHeader>

        {vendorsWithPhone.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No vendors with valid phone numbers found. Please add phone
              numbers to vendor contacts before sharing via WhatsApp. Note:
              WhatsApp sharing is in addition to email notifications.
            </AlertDescription>
          </Alert>
        ) : !showResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVendors.length === vendorsWithPhone.length}
                  onCheckedChange={toggleAll}
                  id="select-all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select All ({vendorsWithPhone.length})
                </label>
              </div>
              <Badge variant="secondary">
                {selectedVendors.length} selected
              </Badge>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
              <div className="space-y-2">
                {vendorsWithPhone.map((vendor) => (
                  <div
                    key={vendor.email}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleVendor(vendor.email)}
                  >
                    <Checkbox
                      checked={selectedVendors.includes(vendor.email)}
                      onCheckedChange={() => toggleVendor(vendor.email)}
                      id={`vendor-${vendor.email}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {getVendorDisplayName(vendor)}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span>{vendor.email}</span>
                        <span>
                          {vendor.countryCode || "+91"} {vendor.mobileNo}
                        </span>
                      </div>
                    </div>
                    {(vendor.emailSent || vendor.email_sent) && (
                      <Badge variant="outline" className="text-xs">
                        Email Sent
                      </Badge>
                    )}
                    {vendor.whatsappSent && (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        WhatsApp Sent
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleGenerateLinks}
                disabled={selectedVendors.length === 0 || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Links...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Generate WhatsApp Links ({selectedVendors.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto pr-1">
              <div className="space-y-2">
                {Array.from(vendorStatuses.entries()).map(([email, status]) => {
                  const vendor = vendors.find((v) => v.email === email);
                  if (!vendor) return null;

                  return (
                    <div
                      key={email}
                      className={`p-3 border rounded-lg ${
                        status.status === "success"
                          ? "bg-green-50 border-green-200"
                          : status.status === "error"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {getVendorDisplayName(vendor)}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {email} • {vendor.countryCode || "+91"}{" "}
                            {vendor.mobileNo}
                          </p>
                        </div>
                        {status.status === "processing" && (
                          <div className="flex items-center text-xs text-blue-600">
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Generating link...
                          </div>
                        )}
                        {status.status === "success" && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Link Ready
                          </Badge>
                        )}
                        {status.status === "error" && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>

                      {status.error && (
                        <p className="text-xs text-red-600 mt-2 font-mono">
                          Error: {status.error}
                        </p>
                      )}

                      {status.status === "success" && status.whatsappUrl && (
                        <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyLinkToClipboard(status.whatsappUrl!)
                            }
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleOpenWhatsApp(status.whatsappUrl!)
                            }
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Open WhatsApp
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              {successCount > 0 && (
                <Button
                  onClick={handleOpenAllWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open All WhatsApp ({successCount})
                </Button>
              )}
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
