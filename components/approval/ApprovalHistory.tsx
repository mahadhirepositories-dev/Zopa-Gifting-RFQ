/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApprovalHistoryProps {
  rfpId: string;
  showMinimal?: boolean;
}

export function ApprovalHistory({ rfpId, showMinimal = false }: ApprovalHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    if (!rfpId) return;
    let isMounted = true;

    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rfq/${rfpId}/approval-history`);
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          try {
            const data = await res.json();
            if (isMounted) {
              setHistoryData(data);
            }
          } catch {
            // Silently handle non-JSON or invalid JSON responses
          }
        }
      } catch (err) {
        console.error("Failed to fetch approval history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [rfpId]);

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
        Loading approval history...
      </div>
    );
  }

  if (!historyData || !historyData.currentApproval) {
    return (
      <div className="py-4 text-center text-xs text-gray-400">
        No approval history recorded yet.
      </div>
    );
  }

  const { currentApproval, recommendations = [] } = historyData;

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "revision_requested":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Revision Requested
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  if (showMinimal) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
        <span className="font-medium text-gray-700">Approval Status:</span>
        {renderStatusBadge(currentApproval.status)}
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">
            Approval History & Timeline
          </CardTitle>
          {renderStatusBadge(currentApproval.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Requester Info */}
        <div className="flex items-start justify-between p-3 bg-slate-50 rounded-md border text-sm">
          <div>
            <div className="font-medium text-slate-900">
              Submitted by: {currentApproval.requester?.name || currentApproval.requestedBy || "Buyer"}
            </div>
            <div className="text-xs text-slate-500">
              {currentApproval.createdAt ? new Date(currentApproval.createdAt).toLocaleString() : ""}
            </div>
          </div>
          <Badge variant="outline">Submitted</Badge>
        </div>

        {/* Level 1 Approver */}
        {(currentApproval.level1Approver || currentApproval.level1ApproverEmail) && (
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded-md border text-sm">
            <div>
              <div className="font-medium text-slate-900">
                Level 1 Approver: {currentApproval.level1Approver?.name || currentApproval.level1ApproverEmail}
              </div>
              {currentApproval.level1Comments && (
                <p className="text-xs text-slate-600 mt-1 italic">
                  &quot;{currentApproval.level1Comments}&quot;
                </p>
              )}
            </div>
            {renderStatusBadge(currentApproval.level1Status || "pending")}
          </div>
        )}

        {/* Level 2 Approver */}
        {(currentApproval.level2Approver || currentApproval.level2ApproverEmail) && (
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded-md border text-sm">
            <div>
              <div className="font-medium text-slate-900">
                Level 2 Approver: {currentApproval.level2Approver?.name || currentApproval.level2ApproverEmail}
              </div>
              {currentApproval.level2Comments && (
                <p className="text-xs text-slate-600 mt-1 italic">
                  &quot;{currentApproval.level2Comments}&quot;
                </p>
              )}
            </div>
            {renderStatusBadge(currentApproval.level2Status || "pending")}
          </div>
        )}


        {/* Recommended Vendors */}
        {recommendations.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Recommended Vendors ({recommendations.length})
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="text-xs p-2 bg-slate-100 rounded flex justify-between items-center">
                  <span className="font-medium text-slate-800">
                    {rec.vendorResponse?.companyDetails?.companyName || rec.vendorResponseId}
                  </span>
                  <span className="text-slate-500">{rec.recommenderRole}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
