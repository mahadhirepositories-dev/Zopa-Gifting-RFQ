import React from "react";
import { FileText, Download } from "lucide-react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface AttachmentsProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const Attachments: React.FC<AttachmentsProps> = ({ 
  buyerData, 
  selectedVendor 
}) => {
  const renderDocumentStatus = (documentType: string) => {
    const matchingAttachment = selectedVendor?.revisionData?.attachments?.find(
      (a: { documentName: string }) => a.documentName === documentType
    );

    return (
      <div className="flex items-center p-3 border border-gray-200 rounded-md bg-white">
        <FileText className="h-5 w-5 text-blue-500 mr-3" />
        <div className="grow">
          <p className="font-medium text-gray-700 truncate">
            {documentType}
          </p>
        </div>
        <div className="flex items-center">
          <span
            className={`text-sm ${matchingAttachment ? "text-green-600" : "text-red-600"} mr-2`}
          >
            {matchingAttachment ? "✓ Provided" : "✗ Missing"}
          </span>
          {matchingAttachment && (
            <a
              href={matchingAttachment.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-700"
              download={matchingAttachment.name}
              title="Download document"
            >
              <Download className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const requestedDocs = buyerData?.documentsToShare?.documentsToShare
    ? buyerData.documentsToShare.documentsToShare.split(",").map((d: string) => d.trim())
    : [];

  const allAttachments = selectedVendor?.revisionData?.attachments || [];
  
  const additionalAttachments = allAttachments.filter(
    (a: any) => !a.documentName || !requestedDocs.includes(a.documentName)
  );

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        9. Attachments
      </h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Requested Documents</h3>
        {requestedDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requestedDocs.map((doc: string, index: number) => (
              <React.Fragment key={`requested-${index}`}>
                {renderDocumentStatus(doc)}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents requested by buyer</p>
        )}
      </div>

      {additionalAttachments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4 pt-4 border-t border-gray-100">Additional Attachments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {additionalAttachments.map((attachment: any, index: number) => (
              <div key={`additional-${index}`} className="flex items-center p-3 border border-gray-200 rounded-md bg-white">
                <FileText className="h-5 w-5 text-gray-500 mr-3" />
                <div className="grow overflow-hidden">
                  <p className="font-medium text-gray-700 truncate" title={attachment.documentName || attachment.name || `Additional File ${index + 1}`}>
                    {attachment.documentName || attachment.name || `Additional File ${index + 1}`}
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