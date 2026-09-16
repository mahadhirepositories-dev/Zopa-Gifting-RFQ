/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface QuoteHeaderProps {
  buyerData: BuyerPreviewProps["buyerData"];
  rfpUniqueId: any;
  selectedVendor: VendorRevision | null;
  today: string;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({
  buyerData,
  rfpUniqueId,
  selectedVendor,
  today,
}) => (
  <section className="flex justify-between items-center">
    <p className="text-lg font-medium">
      Quote against the RFQ for &quot;
      {buyerData?.requirement?.projectName ||
        "CMS : Content management Systems"}
      &quot; Date: {today}
    </p>

    <div className="text-lg font-medium"></div>
    <div className="flex items-center">
      <div className="text-lg font-medium">
        <span className="text-blue-600 font-bold">RFQ ID :</span> {rfpUniqueId}
      </div>
      <span className="mx-2">/</span>
      <div className="text-lg font-medium">
        <span className="text-blue-600 font-bold">VENDOR ID :</span>{" "}
        {(selectedVendor?.vendorResponseId as unknown as string) || "N/A"}
      </div>
    </div>
  </section>
);
