"use client";

import { useEffect } from "react";
import { AlertIcon, TrophyIcon } from "@/components/admin/Icons";

/**
 * Error boundary for the whole /admin segment.
 *
 * The (dashboard) group has its own error boundary for the overview page, but
 * that one cannot catch a failure thrown by its OWN layout (the admin guard /
 * Supabase lookup). This boundary sits one level up and covers that case, so a
 * database outage shows a readable message with a retry instead of Next.js's
 * blank error screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin area error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-soft text-error">
          <AlertIcon width={28} height={28} />
        </span>
        <div className="mt-4 flex items-center justify-center gap-2 text-primary">
          <TrophyIcon width={18} height={18} />
          <span className="text-sm font-semibold">Mizero Awards</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Unable to load the admin dashboard.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Something went wrong while talking to Supabase. Check your connection
          and try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
