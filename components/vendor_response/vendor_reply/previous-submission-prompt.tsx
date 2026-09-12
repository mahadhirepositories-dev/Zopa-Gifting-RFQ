import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle, XCircle } from "lucide-react";

interface PreviousSubmissionPromptProps {
  isOpen: boolean;
  companyName: string;
  submittedAt?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const PreviousSubmissionPrompt: React.FC<PreviousSubmissionPromptProps> = ({
  isOpen,
  companyName,
  submittedAt,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Previous Submission Found
            </h3>
            <p className="text-sm text-gray-600">
              We found a previous submission from{" "}
              <span className="font-medium text-gray-900">{companyName}</span>{" "}
              submitted {formatDate(submittedAt)}.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800">
            Would you like to auto-fill your company details from this previous
            submission? This will save you time by pre-filling:
          </p>
          <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-4">
            <li>• Company information</li>
            <li>• Address details</li>
            <li>• Contact information</li>
            <li>• Company logo (if available)</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
            No, Enter Manually
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            Yes, Auto-fill
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You can still edit all fields after auto-filling
        </p>
      </div>
    </div>
  );
};
