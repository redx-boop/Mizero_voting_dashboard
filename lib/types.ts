// ============================================================================
// TypeScript types that mirror the REAL Supabase tables used by the Mizero
// Awards voting system (see mizero-voting-main/supabase/schema.sql).
//
// Keeping them here means the whole dashboard shares one source of truth for
// the shapes returned by the database. Do not invent fields — these match the
// columns that already exist.
// ============================================================================

export type Role = "student" | "admin";

/** public.profiles */
export interface Profile {
  id: string;
  student_id: string | null;
  full_name: string;
  class_name: string | null;
  role: Role;
  created_at: string;
}

/** public.categories */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  voting_start: string | null;
  voting_end: string | null;
  created_at: string;
}

/** public.candidates */
export interface Candidate {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  class_name: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

/** public.votes */
export interface Vote {
  id: string;
  category_id: string;
  candidate_id: string;
  user_id: string;
  created_at: string;
}

export type ResultsVisibility = "hidden" | "visible" | "after_close";

/** public.settings — a single row with id = 1 */
export interface Settings {
  id: number;
  election_name: string;
  election_year: string;
  voting_start: string | null;
  voting_end: string | null;
  results_visibility: ResultsVisibility;
  allow_registration: boolean;
  updated_at: string;
}

/**
 * Global election state for the admin dashboard, derived purely from the
 * settings voting window.
 */
export type ElectionStatus = "scheduled" | "open" | "closed";
