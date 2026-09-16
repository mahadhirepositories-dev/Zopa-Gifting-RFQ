import React from "react";
import { File } from "lucide-react";

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-gray-50 fixed top-0 left-0 right-0 z-10 w-full border-b">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="h-10 bg-gray-300 rounded w-48"></div>
            <div className="h-10 bg-gray-300 rounded w-24 flex items-center justify-center">
              <File className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="container mx-auto py-32 space-y-6">
        {/* Top Section */}
        <section className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded w-96"></div>
          <div className="flex items-center space-x-4">
            <div className="h-6 bg-gray-300 rounded w-32"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
          </div>
        </section>

        {/* Company Details Cards */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="h-5 bg-gray-300 rounded w-16 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex">
                  <div className="h-4 bg-gray-300 rounded w-24 mr-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <div className="h-5 bg-gray-300 rounded w-20 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex">
                  <div className="h-4 bg-gray-300 rounded w-24 mr-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Cards */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((section) => (
          <div key={section} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
            {/* Section Header */}
            <div className="flex items-center border-b border-gray-100 pb-6 mb-6">
              <div className="h-6 bg-gray-300 rounded w-8 mr-3"></div>
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>

            {/* Section Content */}
            {section === 3 ? (
              // BOQ Table Skeleton
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                          <th key={col} className="px-4 py-3 border border-gray-200">
                            <div className="h-4 bg-gray-300 rounded"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[1, 2, 3].map((row) => (
                        <tr key={row}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                            <td key={col} className="px-4 py-2 border border-gray-200">
                              <div className="h-4 bg-gray-300 rounded"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : section === 4 ? (
              // Evaluation Criteria Table Skeleton
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      {[1, 2, 3].map((col) => (
                        <th key={col} className="px-6 py-3 border border-gray-200">
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4].map((row) => (
                      <tr key={row}>
                        {[1, 2, 3].map((col) => (
                          <td key={col} className="px-6 py-4 border border-gray-200">
                            <div className="h-4 bg-gray-300 rounded"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : section === 5 ? (
              // Financial Terms Grid Skeleton
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                  {[2, 1, 3, 4].map((span, i) => (
                    <div key={i} className={`md:col-span-${span}`}>
                      <div className="bg-gray-50 p-4 rounded-lg border h-20">
                        <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Default Section Content Skeleton
              <div className="space-y-4">
                <div className="h-5 bg-gray-300 rounded w-64 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start">
                      <div className="h-5 w-5 bg-gray-300 rounded-full mr-3 mt-1"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-4">
                  <div className="h-8 bg-gray-300 rounded-full w-24"></div>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-200 rounded-md">
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="fixed bottom-0 w-full z-10 h-16 bg-gray-100 border-t">
        <div className="h-full bg-gray-300"></div>
      </div>
    </div>
  );
};

const BuyerPreviewSkeleton = () => {
  return <SkeletonLoader />;
};

export default BuyerPreviewSkeleton;