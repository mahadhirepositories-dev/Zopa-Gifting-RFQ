import { NextResponse } from "next/server";

export async function GET() {
  const defaultTerms = [
    {
      id: 1,
      title: "1. Scope of Quotation",
      text: "Vendors must provide complete quotations covering all deliverables specified in this RFQ. Partial bids may be rejected unless explicitly permitted.",
      createdAt: null,
      updatedAt: null,
    },
    {
      id: 2,
      title: "2. Pricing and Taxes",
      text: "All prices quoted must be exclusive of applicable taxes. Taxes, duties, and other levies must be itemized separately in the quotation.",
      createdAt: null,
      updatedAt: null,
    },
    {
      id: 3,
      title: "3. Validity of Quotation",
      text: "Quotations must be submitted before the specified RFQ End Date. Quotations shall remain firm and valid for the evaluation period.",
      createdAt: null,
      updatedAt: null,
    },
    {
      id: 4,
      title: "4. Award of Contract",
      text: "ZOPA reserves the right to accept or reject any quotation, and to annul the RFQ process at any time without incurring liability to affected vendors.",
      createdAt: null,
      updatedAt: null,
    },
  ];

  return NextResponse.json([{ data: defaultTerms }]);
}
