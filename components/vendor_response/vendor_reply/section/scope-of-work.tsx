/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ScopeOfWorkProps {
  register: any;
  watch: any;
  setValue: any;
  trigger: any;
  errors: any;
  buyerData: {
    scope?: {
      deliverables?: any[];
    };
  };
}

export const ScopeOfWork: React.FC<ScopeOfWorkProps> = ({
  register,
  buyerData,
}) => {
  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        2. Scope of work
      </h2>
      <p className="font-medium">
        We hereby confirm to fit the requirement as per RFQ:
      </p>
      <ul className="space-y-2">
        {(buyerData?.scope?.deliverables ?? []).flatMap(
          (deliverable: any, index: number) => {
            const content = deliverable?.text || deliverable;
            let items: any[] = [];

            if (typeof content === "string") {
              try {
                if (
                  content.trim().startsWith("[") ||
                  content.trim().startsWith("{")
                ) {
                  items = JSON.parse(content);
                  if (!Array.isArray(items)) {
                    items = [items];
                  }
                } else {
                  items = content
                    .split("\n")
                    .filter((line) => line.trim() !== "");
                }
              } catch {
                items = content
                  .split("\n")
                  .filter((line) => line.trim() !== "");
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
                <span className="text-gray-700">{typeof item === "object" && item.text ? item.text : item}</span>
              </li>
            ));
          }
        )}
      </ul>

      <div className="flex items-center space-x-4 mb-2">
        <Label className="inline-flex items-center space-x-2">
          <input
            type="radio"
            value="agree"
            className="form-radio"
            {...register("scopeOfWork.agreement")}
            defaultChecked
          />
          <span>Agree</span>
        </Label>
        <Label className="inline-flex items-center space-x-2">
          <input
            type="radio"
            value="disagree"
            className="form-radio"
            {...register("scopeOfWork.agreement")}
          />
          <span>Disagree</span>
        </Label>
      </div>
      <div className="space-y-1">
        <Label htmlFor="fitmentRemarks">Remarks (if any)</Label>
        <Textarea
          id="fitmentRemarks"
          rows={3}
          className="w-full"
          {...register("scopeOfWork.remarks")}
        />
      </div>
    </section>
  );
};
