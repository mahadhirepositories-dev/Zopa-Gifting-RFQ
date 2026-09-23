/* eslint-disable @typescript-eslint/no-explicit-any */

// components/rfp-creator/add-vendors/vendor-limit-status.tsx
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle } from "lucide-react";

interface VendorLimitStatusProps {
  organizationId?: string | null;
  email?: string | null;
  currentCount: number;
  showDetails?: boolean;
  vendorLimitInfo?: any;
}

export const VendorLimitStatus: React.FC<VendorLimitStatusProps> = ({
  organizationId,
  email,
  currentCount,
  showDetails = false,
  vendorLimitInfo: propVendorLimitInfo = null,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [limitInfo, setLimitInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propVendorLimitInfo) {
      setLimitInfo({
        ...propVendorLimitInfo,
        currentCount
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [propVendorLimitInfo, currentCount]);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!limitInfo) return null;

  const { maxLimit } = limitInfo;
  const percentage = Math.min(100, (currentCount / maxLimit) * 100);
  // FIXED: Check if limit is reached (current count equals max limit)
  const isLimitReached = currentCount >= maxLimit;
  const remainingCount = Math.max(0, maxLimit - currentCount);

  return (
    <div className={cn(
      "mb-6 p-4 rounded-md border",
      isExpired 
        ? "bg-red-50 border-red-200" 
        : isLimitReached 
          ? "bg-yellow-50 border-yellow-200"
          : creditsExpiringSoon
            ? "bg-amber-50 border-amber-200"
            : "bg-blue-50 border-blue-200"
    )}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">
          {organizationId ? "Organization Vendor Limit" : "Your Vendor Limit"}
        </h3>
        <span className={cn(
          "text-sm font-medium",
          isExpired 
            ? "text-red-700" 
            : isLimitReached 
              ? "text-yellow-700"
              : creditsExpiringSoon
                ? "text-amber-700"
                : "text-blue-700"
        )}>
          {currentCount} / {maxLimit} vendors
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-2 mb-2",
          isExpired 
            ? "[&>div]:bg-red-500" 
            : isLimitReached 
              ? "[&>div]:bg-yellow-500"
              : creditsExpiringSoon
                ? "[&>div]:bg-amber-500"
                : "[&>div]:bg-blue-500"
        )} 
      />
      
      {/* Expiration Information */}
      {expirationStatus && (
        <div className={cn(
          "flex items-center text-sm mt-2",
          isExpired 
            ? "text-red-600" 
            : creditsExpiringSoon
              ? "text-amber-600"
              : "text-muted-foreground"
        )}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          <div>
            <p>
              Credits {isExpired ? "expired" : "expire"}:{" "}
              {format(expirationStatus.expirationDate, "MMM d, yyyy")}
              {!isExpired && ` (in ${expirationStatus.daysRemaining} days)`}
            </p>
            {creditsExpiringSoon && !isExpired && (
              <p className="mt-1 text-xs flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Your credits will expire soon. Renew them to maintain access.
              </p>
            )}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="mt-2">
          <p className={cn(
            "text-sm",
            isExpired 
              ? "text-red-600 font-medium" 
              : isLimitReached 
                ? "text-yellow-600"
                : "text-blue-600"
          )}>
            {isExpired
              ? "Your credits have expired"
              : isLimitReached
                ? "You've reached your vendor limit for this RFP"
                : `You can add ${remainingCount} more vendor${remainingCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}
    </div>
  );
};