"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";

interface BlockedAccessDialogProps {
  open: boolean;
  projectName?: string;
  message?: string | null;
  onClose: () => void;
}

export function BlockedAccessDialog({
  open,
  projectName,
  message,
  onClose,
}: BlockedAccessDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-center">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        <h3 className="text-center text-xl font-bold text-slate-900">
          Response Submission Closed
        </h3>
        <div className="text-center space-y-3">
          <div className="flex items-start gap-2 bg-amber-50 border-l-4 border-amber-400 p-4 text-left rounded">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              {message ||
                "Unfortunately, the buyer has already moved forward with the RFQ approval process. New responses are no longer being accepted at this time."}
            </div>
          </div>
          {projectName && (
            <p className="text-sm text-gray-600">
              <strong>Project:</strong> {projectName}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Thank you for your interest. Please contact the buyer directly if you have any questions.
          </p>
        </div>
        <div className="pt-2">
          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Understood
          </Button>
        </div>
      </div>
    </div>
  );
}
