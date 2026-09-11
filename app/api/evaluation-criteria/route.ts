import { NextResponse } from "next/server";

export async function GET() {
  const criteria = [
    {
      id: "1",
      criteria: "OEM Only",
      label: "OEM Only",
    },
    {
      id: "2",
      criteria: "Authorized distributor",
      label: "Authorized distributor",
    },
    {
      id: "3",
      criteria: "Comparable business value",
      label: "Comparable business value",
    },
    {
      id: "4",
      criteria: "Specific location",
      label: "Specific location",
    },
    {
      id: "5",
      criteria: "Earliest delivery",
      label: "Earliest delivery",
    },
    {
      id: "6",
      criteria: "ISO certified",
      label: "ISO certified",
    },
    {
      id: "7",
      criteria: "SGST registered only",
      label: "SGST registered only",
    },
    {
      id: "8",
      criteria: "Weighted Score",
      label: "Weighted Score",
    },
    {
      id: "9",
      criteria: "Service experience",
      label: "Service experience",
    },
    {
      id: "10",
      criteria: "Turnover",
      label: "Turnover",
    },
  ];

  return NextResponse.json(criteria);
}
