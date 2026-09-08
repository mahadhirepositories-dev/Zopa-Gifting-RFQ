/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { UploadCloud, FileText } from "lucide-react";

interface DocumentsToShareProps {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const DocumentsToShare: React.FC<DocumentsToShareProps> = ({
  data,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Documents to Share</h2>
        <p className="text-xs text-slate-500 mt-0.5">Attach brand guidelines, design mockups, or reference files for vendors.</p>
      </div>

      <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">Upload Reference Attachments</p>
          <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG, or ZIP up to 25MB</p>
        </div>
        {!disabled && (
          <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-blue-500/20">
            Browse Files
            <input type="file" className="hidden" multiple disabled={disabled} />
          </label>
        )}
      </div>

      {data?.documentsToShare?.length > 0 && (
        <div className="space-y-2">
          {data.documentsToShare.map((doc: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">{doc.name || `Document_${idx + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
