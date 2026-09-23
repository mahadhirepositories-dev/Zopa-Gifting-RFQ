import React from "react";

interface UniqueVendorCountProps {
  responses: { vendorId: unknown }[];
  children?: (count: number) => React.ReactNode;
}

export const UniqueVendorCount: React.FC<UniqueVendorCountProps> = ({
  responses,
  children,
}) => {
  const countUniqueVendorResponses = (responses: { vendorId: unknown }[]) => {
    const uniqueVendorIds = new Set();
    responses.forEach((response: { vendorId: unknown }) => {
      uniqueVendorIds.add(response.vendorId);
    });
    return uniqueVendorIds.size;
  };

  const count = countUniqueVendorResponses(responses);

  return children ? children(count) : <span>{count}</span>;
};
