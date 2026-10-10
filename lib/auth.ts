// ============================================================================
// Authentication & authorization helpers used by Server Components and Server
// Actions. These run ON THE SERVER, so they can safely decide who may access
// a page.
//
// The admin role lives in the EXISTING database: public.profiles.role = 'admin'
// (the same field the student app and the RLS policies use — see the
// `public.is_admin()` function). Never trust a role sent by the client; always
// look the profile up from the database using the session cookie.
// ============================================================================

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Returns the logged-in Supabase Auth user, or null.
 *
 * Wrapped in React's `cache`, so the layout and the page (which both guard)
 * share ONE `auth.getUser()` call per request instead of hitting Supabase
 * twice.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** PostgREST code returned by `.single()` when no row matches the filter. */
const NO_ROWS = "PGRST116";

/**
 * Returns the user's profiles row, or null when the user has no profile.
 * Cached per request.
 *
 * A genuine database failure (network, RLS, server error) is re-thrown rather
 * than being flattened into null — otherwise an outage would look like "this
 * person is not an administrator" and bounce the admin to the unauthorized
 * page instead of showing a retryable error.
 */
export const getProfile = cache(
  async (userId: string): Promise<Profile | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === NO_ROWS) return null;
      throw new Error(`Failed to load admin profile: ${error.message}`);
    }

    return (data as Profile) ?? null;
  }
);

/**
 * Returns the admin user + profile, or null when the visitor is logged out or
 * is authenticated but not an administrator. Server Actions use this because
 * they cannot redirect to show an error — they check for null instead.
 */
export async function getAdminContext(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== "admin") return null;

  return { user, profile };
}

/**
 * Page/route-group guard. Redirects unauthenticated visitors to the admin
 * login page, and authenticated NON-admins to /admin/unauthorized. Returns
 * the admin user + profile for the page that needs it.
 *
 * This is the authoritative server-side check: a student cannot reach admin
 * functionality by typing /admin, because the dashboard layout runs this
 * before rendering anything.
 */
export async function requireAdminContext(): Promise<{
  user: User;
  profile: Profile;
}> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== "admin") redirect("/admin/unauthorized");

  return { user, profile };
}
