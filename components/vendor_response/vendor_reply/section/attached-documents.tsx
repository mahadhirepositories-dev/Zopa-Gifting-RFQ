/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DocumentAttachmentsProps,
  DocumentItemProps,
  UploadedFileProps,
  AdditionalDocumentsProps,
} from "@/lib/types/vendor-reply";

export const DocumentAttachments = ({
  requiredDocuments,
  documentValidation,
  submissionAttempted,
  watch,
  setValue,
  documentAttachments,
  handleDocumentSelection,
  handleDocumentFileChange,
  validateDocuments,
  removeDocumentAttachment,
  attachments,
  handleFileChange,
  removeAttachment,
}: DocumentAttachmentsProps) => {
  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        9. Attach Required Documents
      </h2>

      {/* Required Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">
            Do you have the below documents for submission?
          </h3>
          <span className="text-red-500">*</span>
        </div>

        <div className="space-y-4">
          {requiredDocuments.map((documentName, index) => (
            <DocumentItem
              key={index}
              index={index}
              documentName={documentName}
              documentValidation={documentValidation}
              submissionAttempted={submissionAttempted}
              watch={watch}
              setValue={setValue}
              documentAttachments={documentAttachments}
              handleDocumentSelection={handleDocumentSelection}
              handleDocumentFileChange={handleDocumentFileChange}
              validateDocuments={validateDocuments}
              removeDocumentAttachment={removeDocumentAttachment}
            />
          ))}
        </div>
      </div>

      {/* Additional Documents Section */}
      <AdditionalDocuments
        attachments={attachments}
        handleFileChange={handleFileChange}
        removeAttachment={removeAttachment}
      />
    </section>
  );
};

const DocumentItem = ({
  index,
  documentName,
  documentValidation,
  submissionAttempted,
  watch,
  setValue,
  documentAttachments,
  handleDocumentSelection,
  handleDocumentFileChange,
  validateDocuments,
  removeDocumentAttachment,
}: DocumentItemProps) => {
  return (
    <div
      className={`p-4 border rounded-lg transition-all duration-200 ${
        documentValidation[index]?.valid === false && submissionAttempted
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {/* Document Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          <p className="text-sm font-medium text-gray-900">{documentName}</p>
        </div>
      </div>

      {/* Yes/No Selection */}
      <div className="mb-3">
        <RadioGroup
          value={watch(`attachments.${index}.hasDocument`) || ""}
          onValueChange={(value: string) => {
            setValue(`attachments.${index}.hasDocument`, value as "yes" | "no");
            handleDocumentSelection(index, value === "yes");
          }}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="yes"
              id={`doc-yes-${index}`}
              className="border-gray-300 text-blue-600"
            />
            <Label
              htmlFor={`doc-yes-${index}`}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Yes, I have this document
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="no"
              id={`doc-no-${index}`}
              className="border-gray-300 text-blue-600"
            />
            <Label
              htmlFor={`doc-no-${index}`}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              No, I don&apos;t have this document
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* File Upload Section - Only show if 'Yes' is selected */}
      {watch(`attachments.${index}.hasDocument`) === "yes" && (
        <div className="space-y-3 p-3 bg-white rounded-md border border-gray-200">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium text-gray-700">
              Upload Document:
            </Label>
            <span className="text-red-500">*</span>
          </div>

          <Input
            type="file"
            id={`document-upload-${index}`}
            className={`cursor-pointer ${
              submissionAttempted &&
              watch(`attachments.${index}.hasDocument`) === "yes" &&
              (!documentAttachments[index]?.files ||
                documentAttachments[index]?.files.length === 0)
                ? "border-red-300"
                : "border-gray-300"
            }`}
            onChange={(e) => {
              handleDocumentFileChange(e, index, documentName);
              validateDocuments();
            }}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
          </p>

          {/* Display uploaded files */}
          {documentAttachments[index]?.files?.length > 0 && (
            <div className="mt-3">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Uploaded Files:
              </Label>
              <div className="space-y-2">
                {documentAttachments[index].files.map((file, fileIndex) => (
                  <UploadedFile
                    key={fileIndex}
                    file={file}
                    variant="success"
                    onRemove={() => {
                      removeDocumentAttachment(index, fileIndex);
                      setTimeout(() => validateDocuments(), 0);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {submissionAttempted && (
        <div className="mt-2">
          {!watch(`attachments.${index}.hasDocument`) && (
            <p className="text-red-500 text-sm flex items-center space-x-1">
              <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-xs">!</span>
              </span>
              <span>Please select Yes or No for {documentName}</span>
            </p>
          )}

          {watch(`attachments.${index}.hasDocument`) === "yes" &&
            (!documentAttachments[index]?.files ||
              documentAttachments[index]?.files.length === 0) && (
              <p className="text-red-500 text-sm flex items-center space-x-1">
                <span className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-xs">!</span>
                </span>
                <span>Please upload documents for {documentName}</span>
              </p>
            )}
        </div>
      )}
    </div>
  );
};

const UploadedFile = ({
  file,
  onRemove,
  variant = "default",
}: UploadedFileProps) => {
  const variantClasses = {
    default: "bg-gray-50 border-gray-200",
    success: "bg-green-50 border-green-200",
  };

  return (
    <div
      className={`flex items-center justify-between p-2 border rounded-md ${variantClasses[variant]}`}
    >
      <div className="flex items-center space-x-2">
        <File className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700 truncate max-w-xs">
          {file.name}
        </span>
        <span className="text-xs text-gray-500">
          ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer"
      >
        ×
      </Button>
    </div>
  );
};

const AdditionalDocuments = ({
  attachments,
  handleFileChange,
  removeAttachment,
}: AdditionalDocumentsProps) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Additional Documents (Optional)
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Upload any additional supporting documents that may strengthen your
          proposal
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <Input
          type="file"
          id="additional-documents"
          className="cursor-pointer"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
        </p>
      </div>

      {attachments?.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Additional Documents:
          </Label>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <UploadedFile
                key={index}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
