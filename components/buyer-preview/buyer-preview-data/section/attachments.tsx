import React from "react";
import { FileText, Download } from "lucide-react";
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
  const requestedDocNames = requestedDocs.map((d) => d.name);

  const renderDocumentStatus = (docObj: {
    name: string;
    url?: string;
    path?: string;
  }) => {
    const documentType = docObj.name;
    const documentUrl = docObj.url || docObj.path;

    const matchingAttachment = selectedVendor?.revisionData?.attachments?.find(
      (a: { documentName: string }) => a.documentName === documentType,
    );

    const downloadUrl = documentUrl || matchingAttachment?.url;

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
          {documentUrl && (
            <p className="text-[11px] font-mono text-blue-600 truncate mt-0.5">
              {documentUrl}
            </p>
          )}
        </div>
        <div className="flex items-center ml-2 shrink-0">
          {matchingAttachment ? (
            <span className="text-xs text-green-600 font-medium mr-2">
              ✓ Provided
            </span>
          ) : documentUrl ? (
            <span className="text-xs text-blue-600 font-medium mr-2">
              Uploaded
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium mr-2">
              ✗ Missing
            </span>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
              download={documentType}
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const allAttachments = selectedVendor?.revisionData?.attachments || [];

  const additionalAttachments = allAttachments.filter(
    (a: any) => !a.documentName || !requestedDocNames.includes(a.documentName),
  );

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        9. Attachments & Required Documents
      </h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Required / Shared Documents
        </h3>
        {requestedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requestedDocs.map((docObj, index) => (
              <React.Fragment key={`requested-${index}`}>
                {renderDocumentStatus(docObj)}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents requested by buyer</p>
        )}
      </div>

      {additionalAttachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4 pt-4 border-t border-gray-100">
            Additional Attachments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {additionalAttachments.map((attachment: any, index: number) => (
              <div
                key={`additional-${index}`}
                className="flex items-center p-3 border border-gray-200 rounded-md bg-white"
              >
                <FileText className="h-5 w-5 text-gray-500 mr-3" />
                <div className="grow overflow-hidden">
                  <p
                    className="font-medium text-gray-700 truncate"
                    title={
                      attachment.documentName ||
                      attachment.name ||
                      `Additional File ${index + 1}`
                    }
                  >
                    {attachment.documentName ||
                      attachment.name ||
                      `Additional File ${index + 1}`}
                  </p>
                </div>
                <div className="flex items-center ml-2">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:text-blue-700 p-1"
                    download={attachment.name}
                    title="Download document"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};