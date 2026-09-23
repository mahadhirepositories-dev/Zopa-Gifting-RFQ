// terms_condition.tsx
"use client";

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import React from "react";

export interface TermsAndCondition {
  id: number;
  title: string;
  text: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface TermsAndConditionsPopupProps {
  show: boolean;
  onClose: () => void;
  termsData: TermsAndCondition[];
  loading: boolean;
  error: string | null;
}
export const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({
  show,
  onClose,
  termsData,
  loading,
  error,
}) => {

  if (!show) return null;

  return (
<>
<Dialog open={show} onOpenChange={onClose}>
  <DialogContent className="w-11/12 max-w-2xl max-h-[90vh]">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">Terms and Conditions</DialogTitle>
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </DialogHeader>
    
    <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 max-h-[60vh] overflow-y-auto space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : termsData?.length === 0 ? (
        <div className="text-gray-500 text-center">
          No terms and conditions found
        </div>
      ) : (
        termsData?.map((term) => (
          <div key={term.id} className="mb-4">
            <h3 className="font-semibold mb-2">{term.title}</h3>
            <p className="mb-3 text-gray-700">{term.text}</p>
          </div>
        ))
      )}
    </div>
  </DialogContent>
</Dialog>
</>
  );
};  