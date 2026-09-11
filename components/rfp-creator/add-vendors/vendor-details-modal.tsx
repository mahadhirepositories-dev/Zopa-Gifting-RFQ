/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "./vendor-types";
import { displayFlexibleArrayField } from "@/lib/vendor-field-parser";
import {
  parseDisplayField,
  parseDisplayFieldAsString,
} from "@/utils/parse-field";
import { FileText, MapPin, Building2, Tag, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

// VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]">
    {children}
  </span>
);

interface VendorDetailsModalProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}

type DocField =
  | "gstCertificateUrl"
  | "msmeCertificateUrl"
  | "incCertificateUrl";

const DOCUMENT_FIELDS: { field: DocField; label: string }[] = [
  { field: "gstCertificateUrl", label: "GST Certificate" },
  { field: "msmeCertificateUrl", label: "MSME Certificate" },
  { field: "incCertificateUrl", label: "Certificate of Incorporation (CIN)" },
];

const parseTags = (tags: string | null | undefined): string[] => {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
};

const resolveUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  if (url.includes("/_next/image?")) {
    const params = new URLSearchParams(url.split("?")[1]);
    const original = params.get("url");
    if (original) return decodeURIComponent(original);
  }

  if (url.startsWith("/uploads/")) {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${baseUrl}${url}`;
  }

  return url;
};

const isImageDocument = (url: string): boolean =>
  /\.(png|jpe?g|gif|webp)$/i.test(url);

// Check if document is a PDF
const isPDFDocument = (url: string): boolean => /\.pdf$/i.test(url);

// Copy prevention handlers
const preventCopy = (e: React.ClipboardEvent) => e.preventDefault();
const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();
const preventDragStart = (e: React.DragEvent) => e.preventDefault();

// Document Viewer Modal Component
const DocumentViewerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentLabel: string;
}> = ({ isOpen, onClose, documentUrl, documentLabel }) => {
  if (!isOpen) return null;

  const isPDF = isPDFDocument(documentUrl);
  const isImage = isImageDocument(documentUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-white [&>button]:hidden">
        {/* Hidden DialogTitle for accessibility */}
        <VisuallyHidden>
          <DialogTitle>Document Viewer: {documentLabel}</DialogTitle>
        </VisuallyHidden>

        {/* Custom Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {documentLabel}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close document viewer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Document Content */}
        <div className="p-4 overflow-auto max-h-[calc(95vh-80px)] bg-gray-100">
          {isPDF ? (
            // PDF Viewer with hidden download/print options
            <div className="w-full h-[calc(95vh-120px)] bg-white rounded-lg shadow-lg overflow-hidden">
              <object
                data={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full"
                aria-label={documentLabel}
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Unable to display PDF directly.
                  </p>
                  <button
                    onClick={() => window.open(documentUrl, "_blank")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open PDF in New Tab
                  </button>
                </div>
              </object>
            </div>
          ) : isImage ? (
            // Image Viewer
            <div className="flex items-center justify-center w-full h-[calc(95vh-120px)] bg-white rounded-lg shadow-lg">
              <div className="relative w-full h-full">
                <Image
                  src={documentUrl}
                  alt={documentLabel}
                  fill
                  className="object-contain"
                  unoptimized
                  draggable={false}
                />
              </div>
            </div>
          ) : (
            // Other document types
            <div className="flex flex-col items-center justify-center h-[calc(95vh-120px)] bg-white rounded-lg shadow-lg p-8">
              <FileText className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4 text-center">
                This document type cannot be previewed directly.
              </p>
              <button
                onClick={() => window.open(documentUrl, "_blank")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Open Document in New Tab
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({
  vendor,
  isOpen,
  onClose,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    label: string;
  } | null>(null);

  if (!vendor) return null;

  const v = vendor as any;
  const tags = parseTags(v.tags);
  const descriptionItems = parseDisplayField(vendor.description);
  const serviceAreas = v.serviceAreas ? parseDisplayField(v.serviceAreas) : [];
  const category = displayFlexibleArrayField(vendor.category);
  const hasAnyDocument = DOCUMENT_FIELDS.some((d) => !!v[d.field]);

  const initials = (vendor.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const location = [
    parseDisplayFieldAsString(v.city),
    parseDisplayFieldAsString(v.state),
    parseDisplayFieldAsString(v.country),
  ]
    .filter(Boolean)
    .join(", ");

  const logoSrc = resolveUrl(v.logoUrl);

  const handleViewDocument = (url: string, label: string) => {
    setSelectedDocument({ url, label });
  };

  const closeDocumentViewer = () => {
    setSelectedDocument(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto p-0 select-none"
          onCopy={preventCopy}
          onCut={preventCopy}
          onContextMenu={preventContextMenu}
          onDragStart={preventDragStart}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Detailed information about {vendor.name}
            </DialogDescription>
          </DialogHeader>

          {/* Header */}
          <div
            className="flex items-start gap-4 p-6 pb-4 border-b border-gray-100"
            onCopy={preventCopy}
            onCut={preventCopy}
            onContextMenu={preventContextMenu}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shrink-0 overflow-hidden relative">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={vendor.name || "Vendor"}
                  fill
                  className="object-cover"
                  unoptimized
                  draggable={false}
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <div className="space-y-0.5 text-left">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {vendor.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {vendor.companyName || "Vendor details"}
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 pt-4 space-y-5"
            onCopy={preventCopy}
            onCut={preventCopy}
            onContextMenu={preventContextMenu}
          >
            {/* Contact grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-sm text-gray-800 break-all">
                  {vendor.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Phone
                </p>
                <p className="text-sm text-gray-800">
                  {v.countryCode} {vendor.phoneNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="text-sm text-gray-800">{location || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Business Type
                </p>
                <p className="text-sm text-gray-800">{v.businessType || "—"}</p>
              </div>
            </div>

            {/* Registration badges */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  GST Registered
                </p>
                <Badge
                  className={cn(
                    v.hasGst
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {v.hasGst ? "Yes" : "No"}
                </Badge>
                {v.hasGst && v.gstNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    GST No: {v.gstNumber}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  MSME Registered
                </p>
                <Badge
                  className={cn(
                    v.isMsme
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {v.isMsme ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-sm text-gray-800">{category || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  PAN Number
                </p>
                <p className="text-sm text-gray-800">{v.panNumber || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                CIN Number
              </p>
              <p className="text-sm text-gray-800">{v.cinNumber || "—"}</p>
            </div>

            {/* Tags + Description side by side */}
            {(tags.length > 0 || descriptionItems.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {descriptionItems.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      Description
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {descriptionItems.map((item, i) => (
                        <Badge key={i} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {serviceAreas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  Service Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area, i) => (
                    <Badge key={i} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {hasAnyDocument && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Attached Documents
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {DOCUMENT_FIELDS.map(({ field, label }) => {
                    const docUrl = resolveUrl(v[field]);
                    if (!docUrl) {
                      return (
                        <div
                          key={field}
                          className="border border-dashed border-gray-200 rounded-lg p-3 text-center bg-gray-50"
                        >
                          <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-xs text-gray-400">Not uploaded</p>
                        </div>
                      );
                    }

                    const isImage = isImageDocument(docUrl);
                    const isPDF = isPDFDocument(docUrl);

                    return (
                      <div
                        key={field}
                        className="border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all cursor-pointer hover:border-blue-400 group"
                        onClick={() => handleViewDocument(docUrl, label)}
                      >
                        {isImage ? (
                          <div className="relative w-10 h-10 mx-auto mb-2 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={docUrl}
                              alt={label}
                              fill
                              className="object-cover"
                              unoptimized
                              draggable={false}
                            />
                          </div>
                        ) : isPDF ? (
                          <div className="w-10 h-10 mx-auto mb-2 rounded bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 mx-auto mb-2 rounded bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                        )}
                        <p
                          className="text-xs text-gray-600 mb-1.5 truncate"
                          title={label}
                        >
                          {label}
                        </p>
                        <div className="inline-flex items-center gap-1 text-xs text-blue-600 group-hover:text-blue-800 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!selectedDocument}
        onClose={closeDocumentViewer}
        documentUrl={selectedDocument?.url || ""}
        documentLabel={selectedDocument?.label || ""}
      />
    </>
  );
};
