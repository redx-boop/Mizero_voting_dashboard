// ============================================================================
// Supabase environment variables, read in ONE place.
//
// Supabase issues "publishable keys" (sb_publishable_…) instead of the older
// "anon" JWT keys (eyJ…). Both are PUBLIC keys that are safe to send to the
// browser — the data is protected by Row Level Security, not by hiding the key.
// We accept either format.
//
// NEVER put the service_role / secret key in this project: it bypasses RLS and
// would be shipped to the browser.
// ============================================================================

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";
