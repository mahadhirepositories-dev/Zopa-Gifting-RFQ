/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Level2ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string | null;
  onConfirm: (comments: string) => Promise<void>;
  isLoading?: boolean;
  level1ApproverName?: string;
  requesterName?: string;
}

export function Level2ApprovalDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  isLoading = false,
  level1ApproverName,
  requesterName,
}: Level2ApprovalDialogProps) {
  const [comments, setComments] = useState("");

  const handleConfirm = async () => {
    await onConfirm(comments);
    setComments("");
  };

  const getTitle = () => {
    switch (action) {
      case "approve":
        return "Level 2 Final Approval";
      case "reject":
        return "Reject RFQ Proposal";
      case "revision":
        return "Request Revision";
      default:
        return "Level 2 Decision";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {action === "approve" &&
              "You are providing final Level 2 approval for this RFQ selection."}
            {action === "reject" &&
              "You are rejecting this RFQ proposal. Please provide a clear rationale."}
            {action === "revision" &&
              "Request changes/revisions before giving final approval."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {level1ApproverName && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border">
              Level 1 Approved by: <strong>{level1ApproverName}</strong>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="level2-comments" className="text-sm font-medium">
              Comments / Feedback {action !== "approve" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="level2-comments"
              placeholder="Enter your decision comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || (action !== "approve" && !comments.trim())}
          >
            {isLoading ? "Submitting..." : "Confirm Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
