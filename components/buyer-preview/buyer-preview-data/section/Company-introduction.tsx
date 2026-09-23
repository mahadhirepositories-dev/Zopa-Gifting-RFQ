import React from "react";
import { VendorRevision } from "@/lib/types/index";

interface CompanyIntroductionProps {
  selectedVendor: VendorRevision | null;
}

export const CompanyIntroduction: React.FC<CompanyIntroductionProps> = ({
  selectedVendor,
}) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
      1. Company Introduction
    </h2>
    <p className="text-gray-700">
      <span className="font-bold capitalize">
        {selectedVendor?.companydetails?.companyName || "Company Name"}
      </span>{" "}
      incorporated under Indian Companies Act, having its office at{" "}
      <span className="font-bold capitalize">
        {[
          selectedVendor?.companydetails?.addressLine1,
          selectedVendor?.companydetails?.addressLine2,
          selectedVendor?.companydetails?.city,
          selectedVendor?.companydetails?.state,
          selectedVendor?.companydetails?.country,
          selectedVendor?.companydetails?.postalCode,
        ]
          .filter(Boolean)
          .join(", ") || "Company Address"}
      </span>
      , hereinafter referred to as &quot;Company&quot;.
    </p>
    {selectedVendor?.companydetails?.businessType && (
      <p className="text-gray-700 mt-2">
        Company is in the business of{" "}
        <span className="font-bold capitalize">
          {selectedVendor.companydetails.businessType}
        </span>
      </p>
    )}
  </div>
);
