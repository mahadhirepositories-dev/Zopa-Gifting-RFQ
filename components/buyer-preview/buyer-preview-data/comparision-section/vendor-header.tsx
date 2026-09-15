import React from "react";
// import Image from "next/image";
import { ProcessedVendor } from "./vendor-comparison-helpers";

interface VendorHeaderProps {
  vendors: ProcessedVendor[];
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({ vendors }) => (
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
        Criteria
      </th>
      {vendors.map((vendor) => (
        <th
          key={vendor.id}
          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
        >
          <div className="flex flex-col items-center">
            {/* {vendor.logoUrl && (
              <Image
                src={vendor.logoUrl}
                alt={vendor.name}
                className="h-8 w-8 object-contain mb-1"
                width={32}
                height={32}
              />
            )} */}
            <span className="font-medium text-gray-700">{vendor.name}</span>
            {/* <span className="text-xs text-gray-500">{vendor.status}</span> */}
          </div>
        </th>
      ))}
    </tr>
  </thead>
);
