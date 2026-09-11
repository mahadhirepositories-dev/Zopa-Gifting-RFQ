/* eslint-disable @typescript-eslint/no-explicit-any */
// components/rfp-creator/add-vendors/organization-vendors-table.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Vendor } from "./vendor-types";
import { VendorRatingDisplay } from "./vendor-rating-display";

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

// Use the same Vendor type from your schema
interface OrganizationVendor {
  id: number;
  name: string | null;
  companyName: string;
  email: string;
  phoneNumber: string;
  countryCode?: string | null;
  category?: string | null;
  serviceAreas?: string | null;
  isActive?: boolean | null;
  // Add all other fields that exist in your actual vendor type
  [key: string]: any; // Allow other fields
}

interface OrganizationVendorsTableProps {
  data: OrganizationVendor[];
  onVendorToggle: (
    vendor: OrganizationVendor | Vendor,
    isSelected: boolean,
  ) => Promise<void>;
  addedContacts: VendorContact[];
  disabled?: boolean;
  isCheckingLimit?: boolean;
}

export const OrganizationVendorsTable: React.FC<
  OrganizationVendorsTableProps
> = ({
  data,
  onVendorToggle,
  addedContacts,
  disabled = false,
  isCheckingLimit = false,
}) => {
  // Filter only active vendors (no approval status check needed)
  const activeVendors = data.filter((vendor) => vendor.isActive !== false);

  const isVendorAdded = (vendor: OrganizationVendor) =>
    addedContacts.some(
      (contact) =>
        contact.email === vendor.email &&
        contact.companyName === vendor.companyName,
    );

  const handleVendorToggle = async (
    vendor: OrganizationVendor,
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
    activeVendors.filter((vendor) => !isVendorAdded(vendor));

  const getAddedVendors = () =>
    activeVendors.filter((vendor) => isVendorAdded(vendor));

  const handleSelectAll = async () => {
    if (disabled || isCheckingLimit) return;

    const availableVendors = getAvailableVendors();
    const addedVendors = getAddedVendors();

    if (addedVendors.length === activeVendors.length) {
      for (const vendor of activeVendors) {
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

  const addedVendorsCount = getAddedVendors().length;
  const totalVendors = activeVendors.length;
  const isTableDisabled = disabled || isCheckingLimit;

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={addedVendorsCount === totalVendors && totalVendors > 0}
                onCheckedChange={handleSelectAll}
                disabled={isTableDisabled || totalVendors === 0}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Ratings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeVendors.map((vendor) => {
            const isAdded = isVendorAdded(vendor);

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
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isAdded}
                    disabled={isTableDisabled}
                    onCheckedChange={() =>
                      !isTableDisabled && handleVendorToggle(vendor)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {vendor.name || "N/A"}
                </TableCell>
                <TableCell>{vendor.companyName}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phoneNumber}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <VendorRatingDisplay
                    vendorId={vendor.email}
                    vendorEmail={vendor.email}
                    companyName={vendor.companyName}
                    compact={true}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {activeVendors.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No vendors found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
    </div>
  );
};
