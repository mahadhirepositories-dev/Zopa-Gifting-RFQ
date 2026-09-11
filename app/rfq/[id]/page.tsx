import { redirect } from "next/navigation";

export default async function RFQPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/rfq/${resolvedParams.id}/requirement`);
}
