import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client for the SERVER (Server Components, Server Actions, Route
 * Handlers).
 *
 * The user's session lives in a cookie; this client reads it so
 * `supabase.auth.getUser()` knows who is making the request. Every query is
 * still constrained by Row Level Security, exactly like the student app.
 *
 * `setAll` is a no-op inside Server Components (cookies cannot be written
 * during render) — that is fine because `proxy.ts` refreshes the session
 * cookie on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — ignore, proxy.ts handles it.
        }
      },
    },
  });
}
