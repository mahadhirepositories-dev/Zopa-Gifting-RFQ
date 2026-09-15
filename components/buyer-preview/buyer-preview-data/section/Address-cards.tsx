import React from "react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface AddressCardsProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const AddressCards: React.FC<AddressCardsProps> = ({
  buyerData,
  selectedVendor
}) => (
  <div className="grid grid-cols-2 gap-6">
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <p className="font-medium mb-1">To: </p>
      <table className="w-full">
        <tbody>
          <tr>
            <td className="font-bold p-2">Buyer Name</td>
            <td className="p-2">
              {buyerData?.contact?.contactName || "Contact Name"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Company Name</td>
            <td className="p-2">
              {buyerData?.company?.name || "Company Name"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Address</td>
            <td className="p-2">
              {buyerData?.company?.addressLine1 || "Address Line 1"},{" "}
              {buyerData?.company?.addressLine2 || "Address Line 2"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Location</td>
            <td className="p-2">
              {buyerData?.company?.city || "City"},{" "}
              {buyerData?.company?.state || "State"},{" "}
              {buyerData?.company?.country || "Country"} -{" "}
              {buyerData?.company?.postalCode || "Postal Code"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
      <p className="font-bold mb-1">Quote by:</p>
      <table className="w-full">
        <tbody>
          <tr>
            <td className="font-bold p-2">Company Name</td>
            <td className="p-2">
              {selectedVendor?.companydetails?.companyName || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Address</td>
            <td className="p-2">
              {[
                selectedVendor?.companydetails?.addressLine1,
                selectedVendor?.companydetails?.addressLine2,
                selectedVendor?.companydetails?.city,
                selectedVendor?.companydetails?.state,
                selectedVendor?.companydetails?.country,
                selectedVendor?.companydetails?.postalCode,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Phone</td>
            <td className="p-2">
              {selectedVendor?.companydetails?.phone || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="font-bold p-2">Email</td>
            <td className="p-2">
              {selectedVendor?.companydetails?.email || "N/A"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);