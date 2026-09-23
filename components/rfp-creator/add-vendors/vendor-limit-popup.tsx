import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorLimitPopupProps {
  isOpen: boolean;
  limitInfo: {
    maxLimit: number;
    userType: "organization" | "contact";
    currentCount?: number;
    creditExpiresAt?: string | null;
    creditsExpiringSoon?: boolean;
  };
  onRedirect: () => void;
  onClose: () => void;
}

export const VendorLimitPopup: React.FC<VendorLimitPopupProps> = ({
  isOpen,
  limitInfo,
  onRedirect,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calculate expiration status
  const calculateExpirationStatus = () => {
    if (!limitInfo?.creditExpiresAt) return null;

    const now = new Date();
    const expirationDate = new Date(limitInfo.creditExpiresAt);
    const timeDiff = expirationDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return {
      isExpired: timeDiff < 0,
      daysRemaining,
      expirationDate,
    };
  };

  const expirationStatus = calculateExpirationStatus();
  const isExpired = expirationStatus?.isExpired;
  const creditsExpiringSoon = limitInfo?.creditsExpiringSoon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className={cn(
                "text-xl font-semibold",
                isExpired ? "text-red-600" : "text-yellow-600"
              )}
            >
              {isExpired ? "Credits Expired" : "Vendor Limit Reached"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Expiration Status */}
          {expirationStatus && (
            <div
              className={cn(
                "flex items-start p-3 rounded-md mb-4",
                isExpired
                  ? "bg-red-50 border border-red-200"
                  : creditsExpiringSoon
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-blue-50 border border-blue-200"
              )}
            >
              <div className="shrink-0 mr-3">
                <CalendarIcon
                  className={cn(
                    "h-5 w-5 mt-0.5",
                    isExpired
                      ? "text-red-600"
                      : creditsExpiringSoon
                        ? "text-amber-600"
                        : "text-blue-600"
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "font-medium",
                    isExpired
                      ? "text-red-700"
                      : creditsExpiringSoon
                        ? "text-amber-700"
                        : "text-blue-700"
                  )}
                >
                  Credits {isExpired ? "expired" : "expire"}:{" "}
                  {format(expirationStatus.expirationDate, "MMM d, yyyy")}
                </p>
                {!isExpired && (
                  <p className="text-sm mt-1">
                    {creditsExpiringSoon
                      ? `Expiring in ${expirationStatus.daysRemaining} days - renew soon!`
                      : `Expires in ${expirationStatus.daysRemaining} days`}
                  </p>
                )}
              </div>
            </div>
          )}

          {limitInfo?.userType === "organization" ? (
            <>
              <p className="text-gray-700 mb-4">
                {isExpired
                  ? "Your organization's credits have expired."
                  : `Your organization is limited to ${limitInfo?.maxLimit} vendors per RFP.`}
              </p>
              <p className="text-gray-700 mb-6">
                {isExpired
                  ? "Renew your credits to continue adding vendors."
                  : "Please contact support to increase your organization's limit."}
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                {isExpired
                  ? "Your credits have expired."
                  : `You have reached the maximum of ${limitInfo?.maxLimit} vendors for this RFP.`}
              </p>
              <p className="text-gray-700 mb-6">
                {isExpired
                  ? "Renew your credits to continue adding vendors."
                  : "To add more vendors, please contact the admin."}
              </p>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={onRedirect}
              className={cn(
                isExpired
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700",
                "text-white"
              )}
            >
              {isExpired ? "Renew Credits" : "Contact Support"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
