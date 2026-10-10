"use server";

// ============================================================================
// Admin authentication Server Actions.
//
// These run on the server and use the EXISTING Supabase Auth system — there is
// no custom or fake authentication here. The admin role is read from the real
// public.profiles.role column, and a non-admin session is signed out
// immediately so it can never be used against admin pages.
//
// NOTE: a "use server" module may only export async functions, so the shared
// state types/constants live in @/lib/form-state.
// ============================================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginState, ResetState } from "@/lib/form-state";

export async function signInAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // status 0 / AuthRetryableFetchError means the request never reached
    // Supabase (offline or an outage) — say so instead of blaming the password.
    const unreachable =
      error?.status === 0 || error?.name === "AuthRetryableFetchError";
    if (unreachable) {
      return {
        error: "Unable to reach the authentication service. Please try again.",
      };
    }
    // Otherwise deliberately generic — never reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  // Verify administrator privileges using the SAME client (its session lives in
  // memory for this request, so we don't depend on the just-written cookie).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Sign the non-admin back out so no privileged session is left dangling.
    await supabase.auth.signOut();
    return {
      error: "This account does not have administrator access.",
    };
  }

  redirect("/admin");
}

export async function requestPasswordResetAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Please enter your email address.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: error.message, message: null };
  }

  return {
    error: null,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

/**
 * Signs the admin out of Supabase, WAITS for sign-out to finish, then
 * redirects. We `await` signOut() before navigating so the session cookie is
 * cleared before the login page loads.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } finally {
    // Redirect only after sign-out has settled, so the session cookie is
    // cleared before the login page loads — even if the call errored.
    redirect("/admin/login");
  }
}
