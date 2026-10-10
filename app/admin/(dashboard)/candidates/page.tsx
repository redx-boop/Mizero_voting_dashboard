import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getCandidates, getCategories } from "@/lib/admin-data";
import { CandidatesManager } from "@/components/admin/CandidatesManager";

export const metadata: Metadata = { title: "Candidates" };
export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  await requireAdminContext();
  const [candidates, categories] = await Promise.all([
    getCandidates(),
    getCategories(),
  ]);

  return <CandidatesManager candidates={candidates} categories={categories} />;
}
