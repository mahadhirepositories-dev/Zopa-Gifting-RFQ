// components/buyer-preview/premium-features/index.tsx

import React from "react";
import { BarChart4, ClipboardCheck, ListChecks, Shield, X } from "lucide-react";
import { SendLogo } from "@/components/svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";

interface PremiumFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleExpressInterest: () => void;
  vendorName?: string;
  isSubmitting?: boolean;
  contactId?: number;
  rfpId?: string;
}

const PremiumFeaturesDialog: React.FC<PremiumFeaturesDialogProps> = ({
  open,
  onOpenChange,
  handleExpressInterest,
  isSubmitting,
  contactId,
  rfpId,
}) => {
  console.log("Contact ID:", contactId);
  
  const handleExpressInterestClick = async () => {
    try {
      if (!contactId) {
        console.error("Contact ID is required");
        return;
      }

      const response = await fetch("/api/sub-express-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId,
          rfpId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Thanks for expressing interest! Our admin will contact you shortly."
        );
        handleExpressInterest();
      } else {
        console.error("Failed to express interest:", data.error);
      }
    } catch (error) {
      console.error("Error expressing interest:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-125 overflow-hidden p-0">
        <div className="h-full w-full flex items-center justify-center relative">
          {/* Blurred Background Tables */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden blur-[2px] p-6">
            <div className="w-full grid grid-cols-2 gap-24">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      colSpan={4}
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      RFQ No: RFP-2025-0042
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      colSpan={4}
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      RFQ: IT Infrastructure Upgrade Project
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      Vendor A
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Quote Ref Id
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      QR-A-10582
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Rev No
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      Rev 2.1
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Overall Score
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 font-medium border-b border-gray-200">
                      8
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Lowest in price
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 bg-green-100 border-b border-gray-200">
                      35,00,000
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Faster Delivery
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      4 Days
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Compliance score
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 bg-green-100 border-b border-gray-200">
                      4
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      colSpan={4}
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      &nbsp;
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      colSpan={4}
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      &nbsp;
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      Vendor B
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200"
                    >
                      Vendor C
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      QR-B-24789
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      QR-C-36514
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      Rev 1.0
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      Rev 1.5
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      5
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      7
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      43,00,000
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      38,00,000
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 bg-green-100 border-b border-gray-200">
                      3 Days
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      4 Days
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      3
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 border-b border-gray-200">
                      3
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action Card - Fixed positioning and sizing */}
          <div className="relative z-50 w-full max-w-md mx-auto bg-blue-600 rounded-lg shadow-2xl">
            <div className="p-6">
              <DialogHeader className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <DialogTitle className="text-2xl font-bold text-white">
                    Upgrade to Premium!
                  </DialogTitle>
                  <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-white -mt-1 -mr-1">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </div>
                <DialogDescription className="text-white text-sm">
                  Take your procurement process to the next level with our
                  comprehensive suite of tools.
                </DialogDescription>
              </DialogHeader>

              <hr className="border-gray-400 w-full my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white p-2 rounded-full text-blue-600 shrink-0">
                    <BarChart4 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Comprehensive Dashboard
                    </h4>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      Track all your RFQ and responses in one location
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white p-2 rounded-full text-blue-600 shrink-0">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Detailed Comparison
                    </h4>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      Compare vendor responses down to the finest details
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white p-2 rounded-full text-blue-600 shrink-0">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Decision Support
                    </h4>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      AI-powered recommendations to help you select the best vendor
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-white p-2 rounded-full text-blue-600 shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      Secure Access
                    </h4>
                    <p className="text-gray-200 text-xs leading-relaxed">
                      Password-protected RFQ with role-based permissions
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-400 w-full my-4" />

              <DialogFooter className="w-full mt-4 flex flex-col gap-2">
                <Button
                  variant="white"
                  className="cursor-pointer transition-all w-full"
                  onClick={handleExpressInterestClick}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <SendLogo />
                      Submitting...
                    </div>
                  ) : (
                    "Express Interest"
                  )}
                </Button>

                <Link href="/login" passHref className="w-full">
                  <Button variant="link" className="w-full text-white hover:text-gray-200">
                    Premium User? Login
                  </Button>
                </Link>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeaturesDialog;