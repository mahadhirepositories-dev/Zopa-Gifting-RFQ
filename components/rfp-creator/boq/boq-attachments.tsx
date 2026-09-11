import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FaTrash,
  FaUpload,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export interface Attachment {
  id?: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  localFile?: File;
  isUploading?: boolean;
  isLocal?: boolean;
}

interface BOQAttachmentsProps {
  boqItemRef: string;
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE = 10 * 1024 * 1024;

function FileIcon({ type }: { type: string }) {
  if (type === "application/pdf") return <FaFilePdf className="text-red-500" />;
  if (type.startsWith("image/"))
    return <FaFileImage className="text-blue-500" />;
  return <FaFileAlt className="text-gray-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const BOQAttachments: React.FC<BOQAttachmentsProps> = ({
  boqItemRef,
  attachments,
  onChange,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" — unsupported file type.`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" — exceeds 10 MB limit.`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    const placeholders: Attachment[] = validFiles.map((file) => ({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: "",
      localFile: file,
      isUploading: true,
      isLocal: true,
    }));

    onChange([...attachments, ...placeholders]);

    // Upload each file
    const uploaded: Attachment[] = [];
    for (const file of validFiles) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("boqItemRef", boqItemRef);

        const res = await fetch("/api/boq-attachments", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(`Failed to upload "${file.name}": ${err.error}`);
          uploaded.push({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: "",
            isUploading: false,
            isLocal: true,
          });
        } else {
          const saved = await res.json();
          uploaded.push({
            id: saved.id,
            fileName: saved.fileName,
            fileType: saved.fileType,
            fileSize: saved.fileSize,
            fileUrl: saved.fileUrl,
            isUploading: false,
            isLocal: false,
          });
        }
      } catch {
        toast.error(`Upload error for "${file.name}"`);
        uploaded.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: "",
          isUploading: false,
          isLocal: true,
        });
      }
    }

    // Replace placeholders with actual uploaded attachments
    const finalAttachments = attachments.filter((a) => !a.isUploading);
    onChange([...finalAttachments, ...uploaded]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = async (index: number) => {
    const att = attachments[index];
    if (att.id) {
      try {
        await fetch(`/api/boq-attachments?id=${att.id}`, { method: "DELETE" });
      } catch {
        toast.error("Failed to delete file from server.");
      }
    }
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-gray-600">
          Attachments{" "}
          <span className="text-gray-400 font-normal">
            (images, PDFs, docs – max 10 MB each)
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-blue-600 border-blue-600 hover:bg-blue-50 font-extrabold uppercase text-xs tracking-wider px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs"
        >
          <FaUpload className="w-3.5 h-3.5" />
          UPLOAD FILES
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </div>

      {attachments.length > 0 && (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
          {attachments.map((att, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 px-3 py-2 bg-white",
                att.isUploading && "opacity-60",
              )}
            >
              <FileIcon type={att.fileType} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.fileName}</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(att.fileSize)}
                </p>
              </div>

              {att.isUploading && (
                <span className="text-xs text-blue-500 animate-pulse">
                  Uploading…
                </span>
              )}

              {!att.isUploading && att.fileUrl && (
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500"
                  title="Preview"
                >
                  <FaEye className="w-4 h-4" />
                </a>
              )}

              <Button
                type="button"
                size="iconSmall"
                variant="destructive"
                onClick={() => handleRemove(i)}
                disabled={disabled || att.isUploading}
                title="Remove"
              >
                <FaTrash className="w-3 h-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
