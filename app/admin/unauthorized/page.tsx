import type { Metadata } from "next";
import { signOutAction } from "@/app/actions/auth";
import { AlertIcon, TrophyIcon } from "@/components/admin/Icons";

export const metadata: Metadata = {
  title: "Not Authorized",
};

/**
 * Shown to a user who is authenticated but whose profiles.role is not 'admin'.
 * The server guard sends them here instead of the dashboard, so a student
 * cannot reach admin functionality by typing /admin.
 */
export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-soft text-error">
          <AlertIcon width={28} height={28} />
        </span>
        <div className="mt-4 flex items-center justify-center gap-2 text-primary">
          <TrophyIcon width={18} height={18} />
          <span className="text-sm font-semibold">Mizero Awards</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-muted">
          Your account is signed in but does not have administrator access to
          the Mizero Awards dashboard. If you believe this is a mistake, contact
          an election administrator.
        </p>

        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
