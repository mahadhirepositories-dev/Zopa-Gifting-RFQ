import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface AttachmentsProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const Attachments: React.FC<AttachmentsProps> = ({
  buyerData,
  selectedVendor,
}) => {
  const parseDocuments = (
    rawDocs: any,
  ): Array<{ name: string; url?: string; path?: string }> => {
    if (!rawDocs) return [];

    let docInput = rawDocs;
    if (
      typeof rawDocs === "object" &&
      rawDocs !== null &&
      rawDocs.documentsToShare !== undefined
    ) {
      docInput = rawDocs.documentsToShare;
    }

    if (Array.isArray(docInput)) {
      return docInput.map((item) => {
        if (typeof item === "string") return { name: item };
        return {
          name: item.name || item.fileName || "Document",
          url: item.url || item.path,
          path: item.path || item.url,
        };
      });
    }

    if (typeof docInput === "string" && docInput.trim()) {
      try {
        const parsed = JSON.parse(docInput);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === "string") return { name: item };
            return {
              name: item.name || item.fileName || "Document",
              url: item.url || item.path,
              path: item.path || item.url,
            };
          });
        }
      } catch {
        return docInput
          .split(",")
          .map((d: string) => ({ name: d.trim() }))
          .filter((d) => d.name.length > 0);
      }
    }

    return [];
  };

  const requestedDocs = parseDocuments(buyerData?.documentsToShare);
  const requestedDocNames = requestedDocs.map((d) => d.name.trim().toLowerCase());

  const allVendorDocAttachments: Array<any> = selectedVendor?.revisionData?.attachments || [];

  const renderDocumentStatus = (docObj: {
    name: string;
    url?: string;
    path?: string;
  }) => {
    const documentType = docObj.name;
    const buyerDocUrl = docObj.url || docObj.path;

    const matchingAttachment = allVendorDocAttachments.find(
      (a: { documentName?: string; name?: string }) => {
        const dName = (a.documentName || a.name || "").trim().toLowerCase();
        const targetName = documentType.trim().toLowerCase();
        return dName === targetName || dName.includes(targetName) || targetName.includes(dName);
      },
    );

    const fileUrl = matchingAttachment?.url || buyerDocUrl;
    const displayName = matchingAttachment?.name || matchingAttachment?.documentName || documentType;

    const normalizedUrl = fileUrl && fileUrl.includes("://")
      ? new URL(fileUrl).pathname
      : fileUrl;

    return (
      <div className="flex items-center p-3 border border-gray-200 rounded-md bg-white shadow-2xs">
        <FileText className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
        <div className="grow overflow-hidden">
          <p
            className="font-medium text-gray-800 text-sm truncate"
            title={documentType}
          >
            {documentType}
          </p>
          {matchingAttachment?.name && matchingAttachment.name !== documentType && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {matchingAttachment.name}
            </p>
          )}
        </div>
        <div className="flex items-center ml-2 shrink-0 gap-1.5">
          {matchingAttachment ? (
            <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded border border-green-200">
              ✓ Provided
            </span>
          ) : buyerDocUrl ? (
            <span className="text-xs text-blue-600 font-medium px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
              Shared
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium px-2 py-0.5 bg-red-50 rounded border border-red-200">
              ✗ Missing
            </span>
          )}

          {normalizedUrl && (
            <div className="flex items-center gap-1 ml-1">
              <a
                href={normalizedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded border border-blue-200 font-medium transition-colors"
                title={`View ${displayName}`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View</span>
              </a>
              <a
                href={normalizedUrl}
                download={displayName}
                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 hover:bg-green-50 rounded border border-green-200 font-medium transition-colors"
                title={`Download ${displayName}`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Filter additional attachments that weren't directly matched with requested documents
  const additionalAttachments = allVendorDocAttachments.filter(
    (a: any) => {
      const dName = (a.documentName || a.name || "").trim().toLowerCase();
      return !requestedDocNames.some((req) => dName === req || dName.includes(req) || req.includes(dName));
    },
  );

  // Collect item / BOQ attachments uploaded by vendor
  const collectBoqAttachments = () => {
    const results: Array<{ name: string; url: string; itemName?: string }> = [];
    const boqData = selectedVendor?.revisionData?.boqQuotes || selectedVendor?.revisionData?.boqDetails;
    if (!boqData) return results;

    const groups = Array.isArray(boqData) ? boqData : Object.values(boqData);
    groups.forEach((group: any) => {
      const items = Array.isArray(group?.items)
        ? group.items
        : Array.isArray(group)
        ? group
        : [group];

      items.forEach((item: any) => {
        if (Array.isArray(item?.vendorAttachments)) {
          item.vendorAttachments.forEach((att: any) => {
            if (att?.url) {
              results.push({
                name: att.name || att.documentName || item.itemName || "Item Attachment",
                url: att.url,
                itemName: item.itemName,
              });
            }
          });
        } else if (item?.vendorAttachmentUrl) {
          results.push({
            name: item.vendorAttachmentName || item.itemName || "Item Attachment",
            url: item.vendorAttachmentUrl,
            itemName: item.itemName,
          });
        }
      });
    });

    return results;
  };

  const boqAttachments = collectBoqAttachments();

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-4">
        9. Attachments & Required Documents
      </h2>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Required / Shared Documents
        </h3>
        {requestedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestedDocs.map((docObj, index) => (
              <React.Fragment key={`requested-${index}`}>
                {renderDocumentStatus(docObj)}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No documents requested by buyer</p>
        )}
      </div>

      {additionalAttachments.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Additional Vendor Attachments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalAttachments.map((attachment: any, index: number) => {
              const fileUrl = attachment.url || attachment.path;
              const normalizedUrl = fileUrl && fileUrl.includes("://")
                ? new URL(fileUrl).pathname
                : fileUrl;
              const displayName = attachment.name || attachment.documentName || `Additional File ${index + 1}`;

              return (
                <div
                  key={`additional-${index}`}
                  className="flex items-center p-3 border border-gray-200 rounded-md bg-white shadow-2xs"
                >
                  <FileText className="h-5 w-5 text-gray-500 mr-3 shrink-0" />
                  <div className="grow overflow-hidden">
                    <p
                      className="font-medium text-gray-700 truncate text-sm"
                      title={displayName}
                    >
                      {displayName}
                    </p>
                    {attachment.documentName && attachment.documentName !== displayName && (
                      <p className="text-xs text-gray-400 truncate">{attachment.documentName}</p>
                    )}
                  </div>
                  <div className="flex items-center ml-2 shrink-0 gap-1">
                    {normalizedUrl && (
                      <>
                        <a
                          href={normalizedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded border border-blue-200 font-medium transition-colors"
                          title={`View ${displayName}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>
                        <a
                          href={normalizedUrl}
                          download={displayName}
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 hover:bg-green-50 rounded border border-green-200 font-medium transition-colors"
                          title={`Download ${displayName}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {boqAttachments.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Item / BOQ Attachments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boqAttachments.map((attachment, index) => {
              const fileUrl = attachment.url;
              const normalizedUrl = fileUrl && fileUrl.includes("://")
                ? new URL(fileUrl).pathname
                : fileUrl;
              const displayName = attachment.name || `Item File ${index + 1}`;

              return (
                <div
                  key={`boq-att-${index}`}
                  className="flex items-center p-3 border border-gray-200 rounded-md bg-white shadow-2xs"
                >
                  <FileText className="h-5 w-5 text-purple-500 mr-3 shrink-0" />
                  <div className="grow overflow-hidden">
                    <p
                      className="font-medium text-gray-700 truncate text-sm"
                      title={displayName}
                    >
                      {displayName}
                    </p>
                    {attachment.itemName && (
                      <p className="text-xs text-gray-400 truncate">
                        For: {attachment.itemName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center ml-2 shrink-0 gap-1">
                    {normalizedUrl && (
                      <>
                        <a
                          href={normalizedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded border border-blue-200 font-medium transition-colors"
                          title={`View ${displayName}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>
                        <a
                          href={normalizedUrl}
                          download={displayName}
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 hover:bg-green-50 rounded border border-green-200 font-medium transition-colors"
                          title={`Download ${displayName}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};