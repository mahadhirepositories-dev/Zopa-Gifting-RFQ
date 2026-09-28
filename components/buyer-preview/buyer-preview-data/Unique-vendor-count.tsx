/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface UniqueVendorCountProps {
  responses?: any[];
  totalVendorsSent?: number;
  buyerData?: any;
  children?: (count: number) => React.ReactNode;
}

export const UniqueVendorCount: React.FC<UniqueVendorCountProps> = ({
  responses = [],
  totalVendorsSent,
  buyerData,
  children,
}) => {
  const countUniqueVendorResponses = (responsesList: any[]) => {
    const uniqueKeys = new Set();
    responsesList.forEach((response: any) => {
      const key =
        response.vendorResponseId ||
        response.companydetails?.email ||
        response.companydetails?.companyName ||
        response.id;
      if (key) uniqueKeys.add(key);
    });
    return uniqueKeys.size;
  };

  const calculatedFromResponses = countUniqueVendorResponses(responses);

  const countFromBuyerData = Math.max(
    Array.isArray(buyerData?.vendorContacts) ? buyerData.vendorContacts.length : 0,
    Array.isArray(buyerData?.vendorcontacts) ? buyerData.vendorcontacts.length : 0,
    Array.isArray(buyerData?.vendors?.vendorList) ? buyerData.vendors.vendorList.length : 0
  );

  const count = Math.max(
    totalVendorsSent || 0,
    countFromBuyerData,
    calculatedFromResponses,
    1
  );

  return children ? children(count) : <span>{count}</span>;
};
