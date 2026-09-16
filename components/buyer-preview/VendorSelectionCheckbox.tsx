// Enhanced VendorSelectionCheckbox.tsx
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface SelectedVendor {
  vendorResponseId: string;
  companyName: string;
  remarks: string;
}

interface VendorSelectionCheckboxProps {
  vendorResponseId: string;
  companyName: string;
  isSelected: boolean;
  onToggle: (vendorResponseId: string, companyName: string) => void;
  onUpdateRemarks?: (vendorResponseId: string, remarks: string) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selectedVendors?: Map<string, SelectedVendor>;
  validationErrors?: Map<string, string>;
  showInlineRemarks?: boolean;
  isDisabled?: boolean; // ✅ FIXED: Added this prop to the interface
}

export const VendorSelectionCheckbox: React.FC<VendorSelectionCheckboxProps> = ({
  vendorResponseId,
  companyName,
  isSelected,
  onToggle,
  onUpdateRemarks,
  showLabel = false,
  size = 'md',
  selectedVendors,
  validationErrors,
  showInlineRemarks = true,
  isDisabled = false
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const containerClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const vendorRemarks = selectedVendors?.get(vendorResponseId)?.remarks || '';
  const hasValidationError = validationErrors?.has(vendorResponseId);
  const validationError = validationErrors?.get(vendorResponseId);

  return (
    <div className={`flex flex-col ${containerClasses[size]} ${isSelected ? 'bg-blue-50 rounded-md' : ''} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} transition-all duration-200`}>
      {/* Checkbox Section */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="relative">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => !isDisabled && onToggle(vendorResponseId, companyName)}
            disabled={isDisabled}
            className={`${sizeClasses[size]} ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} transition-colors`}
          />
          {isSelected && !isDisabled && (
            <div className="absolute -top-1 -right-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current animate-pulse" />
            </div>
          )}
          {isDisabled && (
            <div className="absolute -top-1 -right-1">
              <Lock className="h-3 w-3 text-amber-500" />
            </div>
          )}
        </div>
        
        {showLabel && (
          <div className="flex items-center gap-1">
            <span className={`text-sm ${isDisabled ? 'text-gray-400' : isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
              {isDisabled ? 'Locked' : isSelected ? 'Recommended' : 'Recommend'}
            </span>
            {isSelected && !isDisabled && <CheckCircle className="h-3 w-3 text-green-600" />}
            {isDisabled && <Lock className="h-3 w-3 text-amber-500" />}
          </div>
        )}
      </div>

      {/* Inline Remarks Section */}
      {showInlineRemarks && isSelected && onUpdateRemarks && (
        <div className="w-full mt-1 min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Label htmlFor={`remarks-${vendorResponseId}`} className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : 'text-blue-700'}`}>
                Recommendation Remarks * {isDisabled && "(Locked)"}
              </Label>
              {hasValidationError && !isDisabled && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
            </div>
            
            <Textarea
              id={`remarks-${vendorResponseId}`}
              placeholder={isDisabled ? "Locked during approval process" : "Why recommend this vendor? (e.g., competitive pricing, expertise...)"}
              value={vendorRemarks}
              onChange={(e) => !isDisabled && onUpdateRemarks(vendorResponseId, e.target.value)}
              disabled={isDisabled}
              className={`
                min-h-[60px] text-xs resize-none
                ${isDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
                ${hasValidationError && !isDisabled ? 'border-red-300 focus:border-red-400' : 'border-blue-200 focus:border-blue-400'} 
                ${!isDisabled && 'bg-white'}
              `}
            />
            
            {hasValidationError && !isDisabled && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError}
              </p>
            )}
            
            {isDisabled && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Selection locked during approval process
              </p>
            )}
            
            {/* Character count */}
            {!isDisabled && (
              <div className="text-xs text-gray-500 text-right">
                {vendorRemarks.length}/500
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact remarks display when showInlineRemarks is false */}
      {!showInlineRemarks && isSelected && vendorRemarks && (
        <div className="w-full mt-1">
          <div className={`border rounded p-2 text-xs ${isDisabled ? 'bg-gray-100 border-gray-300' : 'bg-blue-100 border-blue-200'}`}>
            <div className={`font-medium mb-1 ${isDisabled ? 'text-gray-600' : 'text-blue-800'}`}>
              Recommendation:
              {isDisabled && <Lock className="h-3 w-3 inline ml-1" />}
            </div>
            <div className={isDisabled ? 'text-gray-500' : 'text-blue-700'}>
              {vendorRemarks}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};