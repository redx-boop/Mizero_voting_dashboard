import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getVotes, countVotes } from "@/lib/admin-data";
import { VotesView } from "@/components/admin/VotesView";

export const metadata: Metadata = { title: "Votes" };
export const dynamic = "force-dynamic";

const RECENT_LIMIT = 300;

export default async function VotesPage() {
  await requireAdminContext();
  const [votes, total] = await Promise.all([
    getVotes(RECENT_LIMIT),
    countVotes(),
  ]);

  return <VotesView votes={votes} total={total} />;
}
