import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getResults } from "@/lib/admin-data";
import { ResultsView } from "@/components/admin/ResultsView";

export const metadata: Metadata = { title: "Results" };
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  await requireAdminContext();
  const results = await getResults();

  return <ResultsView results={results} />;
}
