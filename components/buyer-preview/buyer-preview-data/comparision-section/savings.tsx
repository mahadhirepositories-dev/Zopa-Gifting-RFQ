import React from "react";
import { TrendingDown } from "lucide-react";

interface SavingsData {
  negotiations: number;
  targetVsLastRev: number;
  lopVsLastRev: number;
  firstRevTotal: number;
  lastRevTotal: number;
  lastRevTotalExclGst: number;
}

interface SavingsProps {
  savings: SavingsData | null;
  targetPriceTotal: number;
  lopTotals: {
    totalExclTax: number;
    totalInclTax: number;
  };
  getCurrencySymbol: () => string;
}

export const SavingsAnalysis: React.FC<SavingsProps> = ({
  savings,
  targetPriceTotal,
  lopTotals,
  getCurrencySymbol,
}) => {
  if (!savings) return null;

  // LOP data is only meaningful if an actual LOP total exists.
  // When it's 0 (i.e. no LOP submitted/available), we show a flat ₹0.00
  // instead of the raw computed savings.lopVsLastRev.
  const hasLopData = lopTotals.totalInclTax > 0;
  const displayLopSavings = hasLopData ? savings.lopVsLastRev : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingDown className="h-5 w-5 text-green-600 mr-3" />
            Savings Analysis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cost savings comparison across different pricing strategies
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Negotiations Savings */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Negotiations Savings
              </h3>
              <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                R0 → Rn
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">First Revision (R0):</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {savings.firstRevTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Last Revision (Rn):</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {savings.lastRevTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Savings:
                </span>
                <div
                  className={`text-2xl font-bold ${savings.negotiations >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {getCurrencySymbol()}
                  {Math.abs(savings.negotiations).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Target Price Savings */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Target Price Savings
              </h3>
              <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                Target → Rn
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Target Price:</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {targetPriceTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Last Revision (Rn):</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {savings.lastRevTotalExclGst.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Savings:
                </span>
                <div
                  className={`text-2xl font-bold ${savings.targetVsLastRev >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {getCurrencySymbol()}
                  {Math.abs(savings.targetVsLastRev).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* LOP Savings */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                LOP Savings
              </h3>
              <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                LOP → Rn
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">LOP Total:</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {lopTotals.totalInclTax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Last Revision (Rn):</span>
                <div className="text-lg font-bold">
                  {getCurrencySymbol()}
                  {savings.lastRevTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Savings:
                </span>
                <div
                  className={`text-2xl font-bold ${
                    !hasLopData
                      ? "text-gray-500"
                      : displayLopSavings >= 0
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {getCurrencySymbol()}
                  {Math.abs(displayLopSavings).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Savings Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Overall Savings Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-black-600">Negotiations</div>
              <div
                className={`font-bold ${savings.negotiations >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {getCurrencySymbol()}
                {Math.abs(savings.negotiations).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">Target Price</div>
              <div
                className={`font-bold ${savings.targetVsLastRev >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {getCurrencySymbol()}
                {Math.abs(savings.targetVsLastRev).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">LOP</div>
              <div
                className={`font-bold ${
                  !hasLopData
                    ? "text-gray-500"
                    : displayLopSavings >= 0
                      ? "text-green-600"
                      : "text-red-600"
                }`}
              >
                {getCurrencySymbol()}
                {Math.abs(displayLopSavings).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
