/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { VendorRevision } from "@/lib/types/index";

interface ScopeOfWorkProps {
  buyerData: {
    scope?: {
      deliverables?: any[];
    };
  };
  selectedVendor: VendorRevision | null;
}

export const ScopeOfWork: React.FC<ScopeOfWorkProps> = ({
  buyerData,
  selectedVendor,
}) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-100 pb-6 mb-6">
      2. Scope of Work
    </h2>
    <h3 className="text-lg font-medium mb-2">
      Scope of Work (As Confirmed by Vendor)
    </h3>
    <ul className="space-y-2">
      {(buyerData?.scope?.deliverables ?? []).flatMap(
        (deliverable: any, index: number) => {
          const content = deliverable?.text || deliverable;
          let items = [];

          if (typeof content === "string") {
            try {
              items = JSON.parse(content);
              if (!Array.isArray(items)) {
                items = content
                  .split("\n")
                  .filter((line) => line.trim() !== "");
              }
            } catch (e) {
              items = content.split("\n").filter((line) => line.trim() !== "");
            }
          } else if (Array.isArray(content)) {
            items = content;
          } else {
            items = [content];
          }

          return items.map((item: any, itemIndex: number) => (
            <li key={`${index}-${itemIndex}`} className="flex items-start">
              <span className="shrink-0 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center mr-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              </span>
              <span className="text-gray-700">{item}</span>
            </li>
          ));
        }
      )}
    </ul>
    <div className="flex items-center my-4">
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
          selectedVendor?.revisionData?.scopeOfWork?.agreement === "agree"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {selectedVendor?.revisionData?.scopeOfWork?.agreement === "agree" ? (
          <>
            <CheckCircleIcon className="h-4 w-4 mr-1" /> Agreed
          </>
        ) : (
          <>
            <XCircleIcon className="h-4 w-4 mr-1" /> Disagreed
          </>
        )}
      </div>
    </div>
    {selectedVendor?.revisionData?.scopeOfWork?.remarks && (
      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">Vendor Remarks</h3>
        <div className="bg-white p-3 border border-gray-200 rounded-md">
          {selectedVendor.revisionData.scopeOfWork.remarks}
        </div>
      </div>
    )}
  </div>
);
