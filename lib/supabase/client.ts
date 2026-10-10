"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client for the BROWSER (Client Components).
 *
 * It uses the public publishable key, which is safe to ship to the browser.
 * Every query it makes is restricted by Row Level Security — hiding the key
 * is not what protects the data; RLS is.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
