import React from "react";
import { Filter, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { ProcessedVendor } from "./vendor-comparison-helpers";

interface VendorFilterProps {
  vendors: ProcessedVendor[];
  /**
   * Ids of vendors excluded from the comparison. Tracked as "hidden" rather
   * than "shown" so a vendor that submits after the filter was set still
   * appears by default instead of silently going missing.
   */
  hiddenVendorIds: Set<string>;
  onChange: (hiddenVendorIds: Set<string>) => void;
}

export const VendorFilter: React.FC<VendorFilterProps> = ({
  vendors,
  hiddenVendorIds,
  onChange,
}) => {
  const visibleCount = vendors.filter(
    (vendor) => !hiddenVendorIds.has(vendor.vendorResponseId)
  ).length;
  // Derived from what is actually on screen, so stale ids left in the set by a
  // refetched vendor list never make the bar claim a filter that isn't active.
  const isFiltered = visibleCount < vendors.length;

  const toggleVendor = (vendorResponseId: string) => {
    const next = new Set(hiddenVendorIds);
    if (next.has(vendorResponseId)) {
      next.delete(vendorResponseId);
    } else {
      // Keep at least one vendor on screen — an empty comparison is never useful.
      if (visibleCount <= 1) return;
      next.add(vendorResponseId);
    }
    onChange(next);
  };

  const selectAll = () => onChange(new Set());

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Vendors in Comparison
            </h3>
            <p className="text-sm text-gray-500">
              Showing {visibleCount} of {vendors.length} vendor
              {vendors.length > 1 ? "s" : ""}
              {isFiltered && " — some vendors are hidden"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="text-blue-600 hover:text-blue-700"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4">
                <Filter className="h-4 w-4 mr-2" />
                Select Vendors
                {isFiltered && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-700"
                  >
                    {visibleCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-800">
                  Show in comparison
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={selectAll}
                  disabled={!isFiltered}
                >
                  Select all
                </Button>
              </div>

              <Separator />

              <div className="max-h-72 overflow-y-auto py-1">
                {vendors.map((vendor) => {
                  const isShown = !hiddenVendorIds.has(vendor.vendorResponseId);
                  const isLastShown = isShown && visibleCount <= 1;

                  return (
                    <label
                      key={vendor.vendorResponseId}
                      className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                        isLastShown
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-gray-50"
                      }`}
                      title={
                        isLastShown
                          ? "At least one vendor must stay in the comparison"
                          : undefined
                      }
                    >
                      <Checkbox
                        checked={isShown}
                        disabled={isLastShown}
                        onCheckedChange={() =>
                          toggleVendor(vendor.vendorResponseId)
                        }
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vendor.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {vendor.quoteRefId}
                          {vendor.revision ? ` • ${vendor.revision}` : ""}
                        </p>
                      </div>
                      {isShown && (
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Hidden:</span>
          {vendors
            .filter((vendor) => hiddenVendorIds.has(vendor.vendorResponseId))
            .map((vendor) => (
              <Badge
                key={vendor.vendorResponseId}
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-200 font-normal"
              >
                {vendor.name}
                <button
                  type="button"
                  onClick={() => toggleVendor(vendor.vendorResponseId)}
                  className="ml-1.5 hover:text-gray-900"
                  aria-label={`Show ${vendor.name} in comparison`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
};
