// ============================================================================
// Form state shapes shared between the auth Server Actions and the client
// forms.
//
// These live OUTSIDE app/actions/auth.ts on purpose: a module marked
// "use server" may only export async functions, so plain constants and types
// must stay in a normal module.
// ============================================================================

export interface LoginState {
  error: string | null;
}

export const initialLoginState: LoginState = { error: null };

export interface ResetState {
  error: string | null;
  message: string | null;
}

export const initialResetState: ResetState = { error: null, message: null };

// ---------------------------------------------------------------------------
// Admin CRUD inputs (plain types shared by the Server Actions and forms).
// ---------------------------------------------------------------------------

export interface CategoryInput {
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  voting_start: string | null;
  voting_end: string | null;
}

export interface CandidateInput {
  category_id: string;
  name: string;
  description: string | null;
  class_name: string | null;
  photo_url: string | null;
  is_active: boolean;
}

export interface SettingsInput {
  election_name: string;
  election_year: string;
  voting_start: string | null;
  voting_end: string | null;
  results_visibility: "hidden" | "visible" | "after_close";
  allow_registration: boolean;
}

/** Generic feedback returned by every admin mutation form. */
export interface AdminFormState {
  error: string | null;
  success: string | null;
}

export const initialAdminFormState: AdminFormState = {
  error: null,
  success: null,
};
