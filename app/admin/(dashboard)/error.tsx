"use client";

import { useEffect } from "react";
import { AlertIcon } from "@/components/admin/Icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the browser console for debugging; the UI keeps a
    // readable message either way.
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-soft text-error">
        <AlertIcon width={26} height={26} />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-ink">
        Unable to load dashboard data.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Something went wrong while reading the election data from Supabase.
        Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Try Again
      </button>
    </div>
  );
}
