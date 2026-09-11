/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Vendor } from "./vendor-types";
import { displayFlexibleArrayField } from "@/lib/vendor-field-parser";
import { VendorDetailsModal } from "./vendor-details-modal";

interface VendorContact {
  name: string;
  email: string;
  mobileNo: string;
  countryCode?: string;
  companyName?: string;
  isNew?: boolean;
  email_sent?: boolean;
  isFromMaster?: boolean;
  masterVendorId?: string | number;
}

interface MasterVendorsTableProps {
  data: Vendor[];
  onVendorToggle: (vendor: Vendor, isSelected: boolean) => Promise<void>;
  addedContacts: VendorContact[];
  disabled?: boolean;
  isCheckingLimit?: boolean;
}

const STICKY_LEFT =
  "sticky left-0 z-20 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]";
const STICKY_RIGHT =
  "sticky right-0 z-20 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]";

const parseTags = (tags: string | null | undefined): string[] => {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
};

const preventCopy = (e: React.ClipboardEvent) => e.preventDefault();
const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

export const MasterVendorsTable: React.FC<MasterVendorsTableProps> = ({
  data,
  onVendorToggle,
  addedContacts,
  disabled = false,
  isCheckingLimit = false,
}) => {
  const [detailsVendor, setDetailsVendor] = useState<Vendor | null>(null);

  // Filter approved vendors
  const approvedVendors = data.filter(
    (vendor) => vendor.approvalStatus === "approved",
  );

  const isVendorAdded = (vendor: Vendor) =>
    addedContacts.some((contact) =>
      contact.masterVendorId !== undefined
        ? String(contact.masterVendorId) === String(vendor.id)
        : contact.email === vendor.email &&
          contact.companyName === vendor.companyName,
    );

  const handleVendorToggle = async (
    vendor: Vendor,
    event?: React.MouseEvent,
  ) => {
    if (disabled || isCheckingLimit) return;

    if (event) {
      event.stopPropagation();
    }

    const isCurrentlyAdded = isVendorAdded(vendor);
    await onVendorToggle(vendor, !isCurrentlyAdded);
  };

  const getAvailableVendors = () =>
    approvedVendors.filter((vendor) => !isVendorAdded(vendor));

  const getAddedVendors = () =>
    approvedVendors.filter((vendor) => isVendorAdded(vendor));

  const handleSelectAll = async () => {
    if (disabled || isCheckingLimit) return;

    const availableVendors = getAvailableVendors();
    const addedVendors = getAddedVendors();

    if (addedVendors.length === data.length) {
      // All vendors are added, remove all
      for (const vendor of data) {
        if (isVendorAdded(vendor)) {
          await onVendorToggle(vendor, false);
        }
      }
    } else {
      for (const vendor of availableVendors) {
        await onVendorToggle(vendor, true);
      }
    }
  };

  const handleViewDetails = (vendor: Vendor, event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailsVendor(vendor);
  };

  const addedVendorsCount = getAddedVendors().length;
  const totalVendors = data.length;
  const isTableDisabled = disabled || isCheckingLimit;

  return (
    <div
      className="relative select-none"
      onCopy={preventCopy}
      onCut={preventCopy}
      onContextMenu={preventContextMenu}
    >
      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("w-12 bg-white", STICKY_LEFT)}>
              <Checkbox
                checked={addedVendorsCount === totalVendors && totalVendors > 0}
                onCheckedChange={handleSelectAll}
                disabled={isTableDisabled || totalVendors === 0}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead
              className={cn("w-16 text-center bg-white", STICKY_RIGHT)}
            >
              Details
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedVendors.map((vendor) => {
            const isAdded = isVendorAdded(vendor);
            const categoryDisplay =
              displayFlexibleArrayField(vendor.category) || "—";
            const descriptionDisplay =
              displayFlexibleArrayField(vendor.description) || "—";
            const tags = parseTags((vendor as any).tags);
            const stickyBg = isAdded ? "bg-green-50" : "bg-white";

            return (
              <TableRow
                key={vendor.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  isAdded && "bg-green-50",
                  isTableDisabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => !isTableDisabled && handleVendorToggle(vendor)}
              >
                <TableCell
                  className={cn(stickyBg, STICKY_LEFT)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isAdded}
                    disabled={isTableDisabled}
                    onCheckedChange={() =>
                      !isTableDisabled && handleVendorToggle(vendor)
                    }
                  />
                </TableCell>
                <TableCell
                  className="font-medium max-w-[140px] truncate"
                  title={vendor.name ?? undefined}
                >
                  {vendor.name}
                </TableCell>
                <TableCell
                  className="max-w-[160px] truncate"
                  title={vendor.companyName ?? undefined}
                >
                  {vendor.companyName}
                </TableCell>
                <TableCell
                  className="max-w-[140px] truncate"
                  title={categoryDisplay}
                >
                  {categoryDisplay}
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={descriptionDisplay}
                >
                  {descriptionDisplay}
                </TableCell>
                <TableCell className="max-w-[180px]">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-muted-foreground bg-gray-100 rounded px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell
                  className={cn("text-center", stickyBg, STICKY_RIGHT)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    title="View vendor details"
                    aria-label="View vendor details"
                    onClick={(e) => handleViewDetails(vendor, e)}
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {approvedVendors.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No vendors found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Loading overlay when checking limits */}
      {isCheckingLimit && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Checking vendor limits...
            </span>
          </div>
        </div>
      )}

      <VendorDetailsModal
        vendor={detailsVendor}
        isOpen={!!detailsVendor}
        onClose={() => setDetailsVendor(null)}
      />
    </div>
  );
};
