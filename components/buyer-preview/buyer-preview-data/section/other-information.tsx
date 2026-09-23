import React from "react";
import { VendorRevision } from "@/lib/types/index";

interface OtherInformationProps {
  selectedVendor: VendorRevision | null;
}

export const OtherInformation: React.FC<OtherInformationProps> = ({ 
  selectedVendor 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        8. Other Information
      </h2>

      <h3 className="text-md font-medium mb-2">Notes to Buyer</h3>
      <div className="bg-white p-3 border border-gray-200 rounded-md">
        {selectedVendor?.revisionData?.buyerNotes?.remarks ||
          "No additional notes"}
      </div>
    </div>
  );
};