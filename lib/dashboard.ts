// ============================================================================
// Dashboard data access.
//
// Every number here comes from the REAL Supabase database using the admin's
// session (anon key + RLS). Nothing is mocked. The admin RLS policies allow
// an administrator to read all profiles and all votes:
//   • "admins can read all profiles"  → student count
//   • "admins can read all votes"     → total votes / participation
// Categories, candidates and settings are publicly readable.
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import type { ElectionStatus, Settings } from "@/lib/types";
import { getElectionStatus } from "@/lib/status";

export interface DashboardStats {
  students: number;
  categories: number;
  candidates: number;
  totalVotes: number;
  voters: number;
  /** Whole-number percentage of students who have cast at least one vote. */
  participationRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  settings: Settings | null;
  electionStatus: ElectionStatus | "unknown";
  generatedAt: string;
}

/**
 * Loads every value the dashboard overview needs, in parallel. Throws when a
 * query fails so the route's error boundary can show a retry state instead of
 * silently rendering zeros.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [students, categories, candidates, votes, voters, settings] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("candidates").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
      // One row per vote; used to count DISTINCT voters for participation.
      fetchVoterIds(supabase),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const failed = [students, categories, candidates, votes, settings].find(
    (result) => result.error
  );
  if (failed?.error) {
    throw new Error(`Failed to load dashboard data: ${failed.error.message}`);
  }

  const studentCount = students.count ?? 0;
  const voterCount = voters.size;

  const participationRate =
    studentCount > 0
      ? Math.min(100, Math.round((voterCount / studentCount) * 100))
      : 0;

  const settingsRow = (settings.data as Settings | null) ?? null;

  return {
    stats: {
      students: studentCount,
      categories: categories.count ?? 0,
      candidates: candidates.count ?? 0,
      totalVotes: votes.count ?? 0,
      voters: voterCount,
      participationRate,
    },
    settings: settingsRow,
    electionStatus: getElectionStatus(settingsRow),
    generatedAt: new Date().toISOString(),
  };
}

/** Rows requested per page. PostgREST caps responses (Supabase's default is
 * 1000 rows), so a single unbounded query would silently truncate the voter
 * list and understate participation. Ordering by the primary key keeps the
 * paging stable. */
const VOTE_PAGE_SIZE = 1000;

/**
 * Returns the set of distinct user ids that have cast at least one vote.
 * Throws on a query error so the route's error boundary can show a retry.
 */
async function fetchVoterIds(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Set<string>> {
  const voters = new Set<string>();

  for (let from = 0; ; from += VOTE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("votes")
      .select("user_id")
      .order("id", { ascending: true })
      .range(from, from + VOTE_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to load voters: ${error.message}`);
    }

    for (const row of data ?? []) {
      if (row.user_id) voters.add(row.user_id as string);
    }

    if (!data || data.length < VOTE_PAGE_SIZE) break;
  }

  return voters;
}
