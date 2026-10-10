"use client";

import { useState, useTransition } from "react";
import type { Settings } from "@/lib/types";
import { updateSettingsAction } from "@/app/actions/admin";
import {
  initialAdminFormState,
  type AdminFormState,
  type SettingsInput,
} from "@/lib/form-state";
import { PageHeader } from "./PageHeader";
import { FormAlert } from "./FormAlert";

function toLocalValue(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toInput(settings: Settings | null): SettingsInput {
  return {
    election_name: settings?.election_name ?? "",
    election_year: settings?.election_year ?? "",
    voting_start: settings?.voting_start ?? null,
    voting_end: settings?.voting_end ?? null,
    results_visibility: settings?.results_visibility ?? "after_close",
    allow_registration: settings?.allow_registration ?? true,
  };
}

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [input, setInput] = useState<SettingsInput>(() => toInput(settings));
  const [state, setState] = useState<AdminFormState>(initialAdminFormState);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.election_name.trim() || !input.election_year.trim()) {
      setState({
        error: "Election name and year are required.",
        success: null,
      });
      return;
    }
    startTransition(async () => {
      try {
        await updateSettingsAction(input);
        setState({ error: null, success: "Settings saved." });
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : "Something went wrong.",
          success: null,
        });
      }
    });
  }

  const field =
    "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Election Settings"
        description="Control the election identity, voting window, and visibility rules."
      />

      <FormAlert error={state.error} success={state.success} />

      {!settings ? (
        <div className="mb-6 rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
          <p className="text-sm font-medium text-ink">
            The election has not been configured yet.
          </p>
          <p className="mt-1 text-sm text-muted">
            Save the form below to create the settings row.
          </p>
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Election name
            </span>
            <input
              value={input.election_name}
              onChange={(e) =>
                setInput({ ...input, election_name: e.target.value })
              }
              required
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Election year
            </span>
            <input
              value={input.election_year}
              onChange={(e) =>
                setInput({ ...input, election_year: e.target.value })
              }
              required
              placeholder="2025-2026"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Voting opens
            </span>
            <input
              type="datetime-local"
              value={toLocalValue(input.voting_start)}
              onChange={(e) =>
                setInput({ ...input, voting_start: e.target.value || null })
              }
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Voting closes
            </span>
            <input
              type="datetime-local"
              value={toLocalValue(input.voting_end)}
              onChange={(e) =>
                setInput({ ...input, voting_end: e.target.value || null })
              }
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Results visibility
            </span>
            <select
              value={input.results_visibility}
              onChange={(e) =>
                setInput({
                  ...input,
                  results_visibility: e.target.value as SettingsInput["results_visibility"],
                })
              }
              className={field}
            >
              <option value="hidden">Hidden — never shown</option>
              <option value="after_close">After voting closes</option>
              <option value="visible">Always visible</option>
            </select>
          </label>

          <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={input.allow_registration}
              onChange={(e) =>
                setInput({ ...input, allow_registration: e.target.checked })
              }
              className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
            />
            Allow new student registration
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
          {state.success ? (
            <span className="text-sm text-muted">
              Last updated {settings ? new Date(settings.updated_at).toLocaleString() : "just now"}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
