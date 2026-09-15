
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
} from "lucide-react";

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "approve" | "reject" | "request-revision";
  selectedVendors: SelectedVendor[];
  comments: string;
  isProcessing: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  selectedVendors,
  comments,
  isProcessing,
}) => {
  const getActionDetails = () => {
    switch (action) {
      case "approve":
        return {
          title: "Approve RFP",
          description:
            "Are you sure you want to approve this RFP? This action cannot be undone.",
          color: "text-green-600",
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          buttonText: "Approve RFP",
          buttonClass: "bg-green-600 hover:bg-green-700",
        };
      case "reject":
        return {
          title: "Reject RFP",
          description:
            "Are you sure you want to reject this RFP? This will require the buyer to start a new approval process.",
          color: "text-red-600",
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          buttonText: "Reject RFP",
          buttonClass: "bg-red-600 hover:bg-red-700",
        };
      case "request-revision":
        return {
          title: "Request Revision",
          description:
            "Are you sure you want to request revisions? The buyer will need to update the RFP and resubmit.",
          color: "text-amber-600",
          icon: <Edit className="h-6 w-6 text-amber-600" />,
          buttonText: "Request Revision",
          buttonClass: "bg-amber-600 hover:bg-amber-700",
        };
    }
  };

  const actionDetails = getActionDetails();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {actionDetails.icon}
            {actionDetails.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {actionDetails.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {action === "approve" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium text-blue-800">
                Vendor Recommendations ({selectedVendors.length})
              </Label>
              {selectedVendors.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {selectedVendors.map((vendor) => (
                    <div
                      key={vendor.vendorResponseId}
                      className="bg-white p-3 rounded border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">
                          {vendor.companyName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {vendor.remarks}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 bg-red-50 p-3 rounded border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      No vendors recommended for approval
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {action !== "approve" && selectedVendors.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium text-blue-800">
                Your Vendor Recommendations ({selectedVendors.length})
              </Label>
              <div className="mt-2 space-y-2">
                {selectedVendors.map((vendor) => (
                  <div
                    key={vendor.vendorResponseId}
                    className="bg-white p-3 rounded border border-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">
                        {vendor.companyName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {vendor.remarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comments && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Label className="text-sm font-medium text-gray-800">
                Approval Comments
              </Label>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {comments}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className={actionDetails.buttonClass}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              actionDetails.icon
            )}
            {isProcessing ? "Processing..." : actionDetails.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};