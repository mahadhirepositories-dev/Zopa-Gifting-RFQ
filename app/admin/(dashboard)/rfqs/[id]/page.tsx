import React from "react";
import { notFound } from "next/navigation";
import { getAdminRfqDetails } from "@/lib/admin-rfq-data";
import { AdminRfqDetailView } from "./rfq-detail-view";

interface AdminRfqDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminRfqDetailPage({
  params,
  searchParams,
}: AdminRfqDetailPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const fromBuyerId = typeof sParams.buyerId === "string" ? sParams.buyerId : null;

  const rfqDetails = await getAdminRfqDetails(id);

  if (!rfqDetails) {
    notFound();
  }

  return <AdminRfqDetailView data={rfqDetails} fromBuyerId={fromBuyerId} />;
}
