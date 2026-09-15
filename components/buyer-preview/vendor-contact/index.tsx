import React, { useState, useEffect } from "react";
import { Star, Mail, Phone, MapPin, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VendorResponseType {
  id: string;
  vendorResponseId: string;
  revisionNumber: number | string;
  rfpId?: string;
  lastUpdated?: string;
  companydetails: {
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  logoUrl?: string | null;
  rating?: number;
  status?: string;
}

interface VendorContactDetailsProps {
  formattedResponses: VendorResponseType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfpId?: string;
}

export const VendorContactDetails: React.FC<VendorContactDetailsProps> = ({
  formattedResponses,
  open,
  onOpenChange,
  rfpId,
}) => {
  const [latestVendors, setLatestVendors] = useState<VendorResponseType[]>([]);

  useEffect(() => {
    let filteredResponses = rfpId
      ? formattedResponses.filter((v) => v.rfpId === rfpId)
      : [...formattedResponses];
    filteredResponses = filteredResponses.filter(
      (v) => v.status !== "draft" && v.revisionNumber !== ""
    );
    const vendorsMap = new Map<string, VendorResponseType>();

    filteredResponses.forEach((response) => {
      const existing = vendorsMap.get(response.vendorResponseId);

      // If no existing entry or this one has higher revision number
      if (
        !existing ||
        (typeof response.revisionNumber === "number" &&
          typeof existing.revisionNumber === "number" &&
          response.revisionNumber > existing.revisionNumber) ||
        (response.lastUpdated &&
          existing.lastUpdated &&
          new Date(response.lastUpdated) > new Date(existing.lastUpdated))
      ) {
        vendorsMap.set(response.vendorResponseId, response);
      }
    });

    setLatestVendors(Array.from(vendorsMap.values()));
  }, [formattedResponses, rfpId]);

  const handleContactVendor = (email?: string | null) => {
    if (email) {
      window.open(`mailto:${email}`, "_blank");
    } else {
      console.warn("Vendor email not found");
    }
  };

  const renderStars = (rating: number | undefined) => {
    const validRating = rating ?? 0;
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(validRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-gray-800">
              Vendor Contacts ({latestVendors?.length})
            </DialogTitle>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <DialogDescription>
            Contact information for all vendors who responded to this RFQ.
          </DialogDescription>
        </DialogHeader>

        {latestVendors?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No vendor details available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestVendors.map((vendor) => (
              <div
                key={`${vendor.vendorResponseId}-${vendor.revisionNumber}`}
                className="border rounded-lg p-5 transition-all duration-300 hover:border-blue-600 hover:shadow-lg flex flex-col justify-between bg-blue-50/30"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="grow pr-2">
                      <h3 className="font-bold text-lg text-gray-800 truncate">
                        {vendor.companydetails.companyName || "N/A"}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 gap-2">
                        <span>Vendor ID: {vendor.vendorResponseId}</span>
                      </div>
                      {vendor.rating !== undefined &&
                        vendor.rating !== null && (
                          <div className="flex mt-1 items-center">
                            {renderStars(vendor.rating)}
                            <span className="text-sm text-gray-600 ml-2">
                              {vendor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 break-all">
                      <Mail className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      {vendor.companydetails.email || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      {vendor.companydetails.phone || "N/A"}
                    </div>
                    {vendor.companydetails.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-2">
                          {vendor.companydetails.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                  <Button
                    onClick={() =>
                      handleContactVendor(vendor.companydetails.email)
                    }
                  >
                    <Mail className="w-3 h-3 mr-1.5" /> Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};