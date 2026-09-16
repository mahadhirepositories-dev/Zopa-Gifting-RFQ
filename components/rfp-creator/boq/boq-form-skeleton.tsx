import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Specific skeleton for BOQ form loading
function BOQFormSkeleton() {
  return (
    <div className="py-2 px-2">
      <Skeleton className="h-8 w-32 mb-2" /> {/* Title */}
      <Skeleton className="h-4 w-full mb-4" /> {/* Description */}
      
      {/* Add/Edit Item Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <Skeleton className="h-6 w-40 mb-4" /> {/* Form title */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Category field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Description field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* UOM field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Target Price field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Quantity field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Specification field */}
          <div className="mb-4">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        {/* Full-width remarks field */}
        <div className="mb-4">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Bulk Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        
        {/* Download template section */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        
        {/* Upload area */}
        <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, BOQFormSkeleton };