/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { BuyerPreviewProps, VendorRevision } from "@/lib/types/index";

interface EvaluationCriteriaProps {
  buyerData: BuyerPreviewProps['buyerData'];
  selectedVendor: VendorRevision | null;
}

export const EvaluationCriteria: React.FC<EvaluationCriteriaProps> = ({ 
  buyerData, 
  selectedVendor 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
        4. Evaluation Criteria
      </h2>
      <div className="overflow-hidden">
        <table className="min-w-50 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                Criteria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {buyerData?.evaluation?.length > 0 ? (
              buyerData.evaluation.map((criteria: string, index: number) => {
                const evalSource =
                  selectedVendor?.revisionData?.evaluationCriteria ||
                  selectedVendor?.revisionData?.evalCompliance ||
                  selectedVendor?.revisionData?.evaluation;

                let vendorResponse: any = {};
                if (Array.isArray(evalSource)) {
                  vendorResponse = evalSource[index] || {};
                } else if (typeof evalSource === "object" && evalSource !== null) {
                  vendorResponse =
                    evalSource[index] || evalSource[String(index)] || evalSource[criteria] || {};
                }

                if (typeof vendorResponse === "string") {
                  vendorResponse = { value: vendorResponse, remarks: "" };
                }

                const valueDisplay =
                  vendorResponse?.value || vendorResponse?.compliance || "-";

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 break-words">
                      {criteria}
                      {criteria.toLowerCase() === "earliest delivery" ? (
                        <>
                          {valueDisplay !== "-" ? valueDisplay : ""}
                          {"deliveryTimeValue" in vendorResponse &&
                            "deliveryTimeUnit" in vendorResponse && (
                              <span className="ml-1">
                                ({String(vendorResponse.deliveryTimeValue)}{" "}
                                {String(vendorResponse.deliveryTimeUnit)}
                              </span>
                            )}
                        </>
                      ) : (
                        <>
                          <span className="flex font-semibold">
                            {vendorResponse.deliveryTimeValue &&
                              vendorResponse.deliveryTimeUnit && (
                                <>
                                  <span className="me-1">Vendor Reply:</span>
                                  {vendorResponse.deliveryTimeValue}{" "}
                                  {vendorResponse.deliveryTimeUnit}
                                </>
                              )}
                          </span>
                        </>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {valueDisplay}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 break-words">
                      {vendorResponse.remarks || "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No evaluation criteria available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};