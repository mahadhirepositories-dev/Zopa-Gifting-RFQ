// components/vendor-rating/vendor-rating-display.tsx
import React, { useState, useEffect } from "react";
import { Star, TrendingUp, MessageSquare, DollarSign, Clock, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface VendorRatingDisplay {
  id: number;
  rfpId: string;
  rfpUniqId: string;
  projectName: string;
  organizationName: string;
  overallRating: number;
  responseQualityRating: number;
  pricingRating: number;
  communicationRating: number;
  deliverySpeedRating: number;
  feedbackText: string | null;
  ratedAt: string;
}

interface VendorRatingSummary {
  vendorId: string;
  vendorName: string;
  companyName: string;
  email: string;
  totalRatings: number;
  averageOverallRating: number;
  averageResponseQualityRating: number;
  averagePricingRating: number;
  averageCommunicationRating: number;
  averageDeliverySpeedRating: number;
  recentRatings: VendorRatingDisplay[];
}

interface VendorRatingDisplayProps {
  vendorId: string;
  vendorEmail?: string;
  companyName?: string;
  compact?: boolean;
}

const StarRating: React.FC<{ rating: number; size?: "sm" | "md" }> = ({ 
  rating, 
  size = "sm" 
}) => {
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      <span className="text-xs text-gray-600 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const RatingCriteriaDisplay: React.FC<{
  label: string;
  rating: number;
  icon: React.ReactNode;
}> = ({ label, rating, icon }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <StarRating rating={rating} />
  </div>
);

export const VendorRatingDisplay: React.FC<VendorRatingDisplayProps> = ({
  vendorId,
  vendorEmail,
  companyName,
  compact = false,
}) => {
  const [ratingData, setRatingData] = useState<VendorRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      // Prefer email over vendorId for lookup
      const searchId = vendorEmail || vendorId;
      
      if (!searchId) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/vendors/${encodeURIComponent(searchId)}/ratings`);
        
        const result = await response.json();
        
        if (result.success) {
          setRatingData(result.data);
        } else {
          setError(result.error || "Failed to fetch ratings");
          console.error("VendorRatingDisplay: API error:", result.error);
        }
      } catch (err) {
        console.error("VendorRatingDisplay: Fetch error:", err);
        setError("Failed to load ratings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [vendorId, vendorEmail]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!ratingData || ratingData.totalRatings === 0) {
    return (
      <div className="text-xs text-gray-400">
        No ratings yet
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StarRating rating={ratingData.averageOverallRating} />
        <Badge variant="secondary" className="text-xs">
          {ratingData.totalRatings} rating{ratingData.totalRatings !== 1 ? 's' : ''}
        </Badge>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1">
          <div className="flex items-center gap-2">
            <StarRating rating={ratingData.averageOverallRating} />
            <Badge variant="secondary" className="text-xs">
              {ratingData.totalRatings} rating{ratingData.totalRatings !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Vendor Ratings - {ratingData.companyName}
          </DialogTitle>
          <DialogDescription>
            {ratingData.vendorName} • {ratingData.email}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Overall Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Rating Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {ratingData.averageOverallRating.toFixed(1)}
                  </div>
                  <StarRating rating={ratingData.averageOverallRating} size="md" />
                  <div className="text-sm text-gray-600 mt-1">
                    Overall Rating
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {ratingData.totalRatings}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Rating{ratingData.totalRatings !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Criteria */}
            <div>
              <h3 className="font-semibold mb-3">Rating Breakdown</h3>
              <div className="space-y-1">
                <RatingCriteriaDisplay
                  label="Response Quality"
                  rating={ratingData.averageResponseQualityRating}
                  icon={<MessageSquare className="w-4 h-4 text-blue-500" />}
                />
                <RatingCriteriaDisplay
                  label="Pricing"
                  rating={ratingData.averagePricingRating}
                  icon={<DollarSign className="w-4 h-4 text-green-500" />}
                />
                <RatingCriteriaDisplay
                  label="Communication"
                  rating={ratingData.averageCommunicationRating}
                  icon={<Phone className="w-4 h-4 text-purple-500" />}
                />
                <RatingCriteriaDisplay
                  label="Delivery Speed"
                  rating={ratingData.averageDeliverySpeedRating}
                  icon={<Clock className="w-4 h-4 text-orange-500" />}
                />
              </div>
            </div>

            {/* Recent Ratings */}
            {ratingData.recentRatings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Recent Ratings</h3>
                <div className="space-y-4">
                  {ratingData.recentRatings.map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            RFQ: {rating.rfpUniqId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {rating.organizationName} • {new Date(rating.ratedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <StarRating rating={rating.overallRating} />
                      </div>
                      
                      {rating.feedbackText && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            Feedback:
                          </div>
                          {rating.feedbackText}
                        </div>
                      )}
                      
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <StarRating rating={rating.responseQualityRating} />
                        </div>
                        <div className="flex justify-between">
                          <span>Pricing:</span>
                          <StarRating rating={rating.pricingRating} />
                        </div>
                        <div className="flex justify-between">
                          <span>Communication:</span>
                          <StarRating rating={rating.communicationRating} />
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery:</span>
                          <StarRating rating={rating.deliverySpeedRating} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};