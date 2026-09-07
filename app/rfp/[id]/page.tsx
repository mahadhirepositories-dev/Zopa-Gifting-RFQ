import { redirect } from "next/navigation";

export default async function RFPPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/rfp/${resolvedParams.id}/requirement`);
}
