"use server";

// ============================================================================
// Admin CRUD Server Actions.
//
// Every action re-checks administrator privileges on the SERVER before touching
// the database (getAdminContext), so a student who somehow reaches these
// endpoints is rejected. Writes still run through Row Level Security — the
// admin RLS policies decide what is allowed.
//
// "use server" modules may only export async functions, so shared types live
// in @/lib/form-state.
// ============================================================================

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  CategoryInput,
  CandidateInput,
  SettingsInput,
} from "@/lib/form-state";

function unauthorized(): never {
  throw new Error("You must be an administrator to perform this action.");
}

/** Turn a slug-worthy name into a url-safe slug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategoryAction(input: CategoryInput) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: input.name.trim(),
    slug: slugify(input.name),
    description: input.description?.trim() || null,
    icon: input.icon?.trim() || null,
    is_active: input.is_active,
    voting_start: input.voting_start || null,
    voting_end: input.voting_end || null,
  });

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateCategoryAction(
  id: string,
  input: CategoryInput
) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name.trim(),
      slug: slugify(input.name),
      description: input.description?.trim() || null,
      icon: input.icon?.trim() || null,
      is_active: input.is_active,
      voting_start: input.voting_start || null,
      voting_end: input.voting_end || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function deleteCategoryAction(id: string) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();

  // Guard: refuse to delete a category that still has candidates — deleting it
  // would either fail on the foreign key or orphan nominees, depending on the
  // constraint. Surface a clear message instead of a raw database error.
  const { count } = await supabase
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    throw new Error(
      "This category still has candidates. Remove them first, then delete the category."
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

export async function createCandidateAction(input: CandidateInput) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();
  const { error } = await supabase.from("candidates").insert({
    category_id: input.category_id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    class_name: input.class_name?.trim() || null,
    photo_url: input.photo_url?.trim() || null,
    is_active: input.is_active,
  });

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateCandidateAction(
  id: string,
  input: CandidateInput
) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();
  const { error } = await supabase
    .from("candidates")
    .update({
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      class_name: input.class_name?.trim() || null,
      photo_url: input.photo_url?.trim() || null,
      is_active: input.is_active,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function deleteCandidateAction(id: string) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();

  // Guard: refuse to delete a candidate that already has votes, so the results
  // history stays intact.
  const { count } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", id);

  if ((count ?? 0) > 0) {
    throw new Error(
      "This candidate already has votes and cannot be deleted."
    );
  }

  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

// ---------------------------------------------------------------------------
// Election settings
// ---------------------------------------------------------------------------

export async function updateSettingsAction(input: SettingsInput) {
  if (!(await getAdminContext())) unauthorized();

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      election_name: input.election_name.trim(),
      election_year: input.election_year.trim(),
      voting_start: input.voting_start || null,
      voting_end: input.voting_end || null,
      results_visibility: input.results_visibility,
      allow_registration: input.allow_registration,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}
