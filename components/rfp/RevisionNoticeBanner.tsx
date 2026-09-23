"use client";

import React from "react";
import { Edit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RevisionNoticeBannerProps {
  message: string;
}

export function RevisionNoticeBanner({ message }: RevisionNoticeBannerProps) {
  return (
    <Alert className="bg-blue-50 border-blue-200 mb-6">
      <Edit className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800 font-semibold">
        Revision Requested
      </AlertTitle>
      <AlertDescription className="text-blue-700">
        {message}
      </AlertDescription>
    </Alert>
  );
}
