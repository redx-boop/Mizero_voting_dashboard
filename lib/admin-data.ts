// ============================================================================
// Data access for the admin management sections.
//
// Everything here runs ON THE SERVER with the admin's session cookie, so Row
// Level Security decides what is readable/writable — exactly like the rest of
// the app. Nothing is mocked; every list is read from the real Supabase tables.
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import type {
  Candidate,
  Category,
  Profile,
  Settings,
  Vote,
} from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** PostgREST code returned by `.single()` / `.maybeSingle()` when no row matches. */
const NO_ROWS = "PGRST116";

/** Supabase's default PostgREST row cap — page large reads so nothing truncates. */
const PAGE_SIZE = 1000;

function fail(scope: string, message: string): never {
  throw new Error(`Failed to load ${scope}: ${message}`);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CategoryWithCounts extends Category {
  candidateCount: number;
}

export async function getCategories(): Promise<CategoryWithCounts[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*, candidates(id)")
    .order("created_at", { ascending: false });

  if (error) fail("categories", error.message);

  return ((data ?? []) as (Category & { candidates: { id: string }[] })[]).map(
    ({ candidates, ...category }) => ({
      ...category,
      candidateCount: candidates?.length ?? 0,
    })
  );
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

export interface CandidateWithCategory extends Candidate {
  categoryName: string;
}

export async function getCandidates(): Promise<CandidateWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (error) fail("candidates", error.message);

  return ((data ?? []) as (Candidate & {
    categories: { name: string } | null;
  })[]).map(({ categories, ...candidate }) => ({
    ...candidate,
    categoryName: categories?.name ?? "Uncategorised",
  }));
}

// ---------------------------------------------------------------------------
// Students (profiles with role = 'student')
// ---------------------------------------------------------------------------

export interface StudentRow extends Profile {
  hasVoted: boolean;
}

export async function getStudents(): Promise<StudentRow[]> {
  const supabase = await createClient();

  // The roster query and the voter-id scan are independent, so run them
  // concurrently — this halves wall-clock time for the Students page instead
  // of paying for two sequential round-trips.
  const [studentsRes, voters] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("full_name", { ascending: true }),
    fetchVoterIds(supabase),
  ]);

  if (studentsRes.error) fail("students", studentsRes.error.message);

  const students = (studentsRes.data ?? []) as Profile[];

  return students.map((student) => ({
    ...student,
    hasVoted: voters.has(student.id),
  }));
}

// ---------------------------------------------------------------------------
// Votes (recent activity)
// ---------------------------------------------------------------------------

export interface VoteWithRelations extends Vote {
  studentName: string;
  candidateName: string;
  categoryName: string;
}

export async function getVotes(limit = 200): Promise<VoteWithRelations[]> {
  const supabase = await createClient();

  // The votes table has a FK to candidates (so we can embed), but NO FK to
  // profiles — PostgREST cannot join voter names in the same query. We fetch
  // the votes with their candidate/category embed, then resolve student names
  // in a second batched query by id.
  const { data, error } = await supabase
    .from("votes")
    .select("*, candidates(name, categories(name))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) fail("votes", error.message);

  type Row = Vote & {
    candidates: {
      name: string;
      categories: { name: string } | null;
    } | null;
  };

  const rows = (data ?? []) as Row[];
  const names = await fetchProfileNames(
    supabase,
    [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[]
  );

  return rows.map((row) => ({
    ...row,
    studentName: names.get(row.user_id) ?? "Unknown student",
    candidateName: row.candidates?.name ?? "Unknown candidate",
    categoryName: row.candidates?.categories?.name ?? "—",
  }));
}

/**
 * Resolves a set of user ids to full names in one query (chunked to stay
 * comfortably under PostgREST's URL length limits).
 */
async function fetchProfileNames(
  supabase: Supabase,
  ids: string[]
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const CHUNK = 100;

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", chunk);

    if (error) fail("votes", error.message);
    for (const row of data ?? []) {
      names.set(row.id as string, row.full_name as string);
    }
  }

  return names;
}

export async function countVotes(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true });
  if (error) fail("votes", error.message);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Results — vote tallies per candidate, grouped by category
// ---------------------------------------------------------------------------

export interface ResultCandidate {
  candidateId: string;
  name: string;
  photoUrl: string | null;
  votes: number;
}

export interface ResultCategory {
  categoryId: string;
  name: string;
  icon: string | null;
  totalVotes: number;
  candidates: ResultCandidate[];
}

export interface ResultsData {
  categories: ResultCategory[];
  totalVotes: number;
  totalVoters: number;
  generatedAt: string;
}

export async function getResults(): Promise<ResultsData> {
  const supabase = await createClient();

  // One pass over the votes table yields EVERYTHING we need (per-candidate
  // tallies, distinct voters, and the total). Doing this in the same
  // Promise.all as the category/candidate reads means the whole page is a
  // single wave of parallel round-trips instead of three separate votes scans
  // followed by a second sequential wave.
  const [categoriesRes, candidatesRes, voteStats] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon")
      .order("created_at", { ascending: true }),
    supabase
      .from("candidates")
      .select("id, category_id, name, photo_url")
      .order("created_at", { ascending: true }),
    fetchVoteStats(supabase),
  ]);

  if (categoriesRes.error) fail("results", categoriesRes.error.message);
  if (candidatesRes.error) fail("results", candidatesRes.error.message);

  const { tallies, voters, total: totalVotes } = voteStats;

  const categories = ((categoriesRes.data ?? []) as {
    id: string;
    name: string;
    icon: string | null;
  }[]).map((category) => {
    const candidates = ((candidatesRes.data ?? []) as {
      id: string;
      category_id: string;
      name: string;
      photo_url: string | null;
    }[])
      .filter((c) => c.category_id === category.id)
      .map((c) => ({
        candidateId: c.id,
        name: c.name,
        photoUrl: c.photo_url,
        votes: tallies.get(c.id) ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      categoryId: category.id,
      name: category.name,
      icon: category.icon,
      totalVotes: candidates.reduce((sum, c) => sum + c.votes, 0),
      candidates,
    };
  });

  return {
    categories,
    totalVotes,
    totalVoters: voters.size,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Single paged scan over the votes table that computes, in one pass:
 *   • tallies — candidate id → vote count
 *   • voters  — distinct user ids that have voted
 *   • total   — overall row count
 *
 * PostgREST caps responses (Supabase's default is 1000 rows), so we page by
 * primary key to avoid silently truncating tallies on a large ballot.
 */
async function fetchVoteStats(
  supabase: Supabase
): Promise<{ tallies: Map<string, number>; voters: Set<string>; total: number }> {
  const tallies = new Map<string, number>();
  const voters = new Set<string>();
  let total = 0;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("votes")
      .select("candidate_id, user_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) fail("results", error.message);

    for (const row of data ?? []) {
      total += 1;
      const candidateId = row.candidate_id as string;
      tallies.set(candidateId, (tallies.get(candidateId) ?? 0) + 1);
      if (row.user_id) voters.add(row.user_id as string);
    }

    if (!data || data.length < PAGE_SIZE) break;
  }

  return { tallies, voters, total };
}

/** Distinct user ids that have cast at least one vote (paged). */
async function fetchVoterIds(supabase: Supabase): Promise<Set<string>> {
  const voters = new Set<string>();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("votes")
      .select("user_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) fail("voters", error.message);

    for (const row of data ?? []) {
      if (row.user_id) voters.add(row.user_id as string);
    }

    if (!data || data.length < PAGE_SIZE) break;
  }

  return voters;
}

// ---------------------------------------------------------------------------
// Election settings (single row, id = 1)
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error && error.code !== NO_ROWS) fail("settings", error.message);
  return (data as Settings | null) ?? null;
}

export { NO_ROWS };
