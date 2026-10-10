"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { initialResetState, type ResetState } from "@/lib/form-state";
import { AlertIcon, TrophyIcon } from "./Icons";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    requestPasswordResetAction,
    initialResetState
  );

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-primary-dark shadow-sm">
          <TrophyIcon width={28} height={28} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your administrator email and we&apos;ll send a reset link.
        </p>
      </div>

      <form
        action={formAction}
        className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        {state.error ? (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error-soft px-3 py-2.5 text-sm text-error"
          >
            <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        ) : null}

        {state.message ? (
          <div
            role="status"
            className="mb-4 rounded-xl border border-success/30 bg-success-soft px-3 py-2.5 text-sm text-success"
          >
            {state.message}
          </div>
        ) : null}

        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@mizeroawards.rw"
          className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/admin/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
