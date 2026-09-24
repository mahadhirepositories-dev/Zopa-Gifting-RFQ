/* eslint-disable @typescript-eslint/no-explicit-any */
interface BuyerSectionProps {
  buyerData: any;
  watch: (fieldName: string) => any;
}

export const BuyerSection: React.FC<BuyerSectionProps> = ({
  buyerData,
  watch,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <p className="font-bold mb-1">To:</p>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="font-bold p-2 w-40">Buyer Name</td>
              <td className="p-2">
                {buyerData?.contact?.contactName || buyerData?.contactName || "[Contact Name]"}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Company Name</td>
              <td className="p-2">
                {buyerData?.company?.name || buyerData?.companyName || "[Company Name]"}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Address</td>
              <td className="p-2">
                {[
                  buyerData?.company?.addressLine1 || buyerData?.companyAddress,
                  buyerData?.company?.addressLine2,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not provided"}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Location</td>
              <td className="p-2">
                {[
                  buyerData?.company?.city,
                  buyerData?.company?.state,
                  buyerData?.company?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
                {buyerData?.company?.postalCode ? ` - ${buyerData.company.postalCode}` : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <p className="font-bold mb-1">Quote by:</p>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="font-bold p-2 w-40">Company Name</td>
              <td className="p-2">
                {watch("companydetails.companyName") || ""}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Address</td>
              <td className="p-2">
                {[
                  watch("companydetails.addressLine1"),
                  watch("companydetails.addressLine2"),
                  watch("companydetails.city"),
                  watch("companydetails.state"),
                  watch("companydetails.country"),
                  watch("companydetails.postalCode"),
                ]
                  .filter(
                    (val) =>
                      val &&
                      val !== "Address 1" &&
                      val !== "Unknown" &&
                      val !== "000000"
                  )
                  .join(", ")}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Phone</td>
              <td className="p-2">
                {watch("companydetails.phone") &&
                watch("companydetails.phone") !== "0000000000"
                  ? watch("companydetails.phone")
                  : ""}
              </td>
            </tr>
            <tr>
              <td className="font-bold p-2">Email</td>
              <td className="p-2">{watch("companydetails.email") || ""}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
