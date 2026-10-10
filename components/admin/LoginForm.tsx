"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/app/actions/auth";
import { initialLoginState, type LoginState } from "@/lib/form-state";
import { AlertIcon, TrophyIcon } from "./Icons";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    signInAction,
    initialLoginState
  );

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-primary-dark shadow-sm">
          <TrophyIcon width={28} height={28} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
          Mizero Awards
        </h1>
        <p className="text-sm font-medium text-primary">Admin Portal</p>
        <p className="mt-2 text-sm text-muted">
          Sign in with your administrator account to continue.
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

        <div className="space-y-4">
          <div>
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
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Login"}
        </button>

        <div className="mt-4 text-center">
          <Link
            href="/admin/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password
          </Link>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Access is restricted to authorized administrators only.
      </p>
    </div>
  );
}
