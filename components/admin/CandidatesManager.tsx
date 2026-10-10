"use client";

import { useMemo, useState, useTransition } from "react";
import type { CategoryWithCounts } from "@/lib/admin-data";
import type { CandidateWithCategory } from "@/lib/admin-data";
import {
  createCandidateAction,
  deleteCandidateAction,
  updateCandidateAction,
} from "@/app/actions/admin";
import {
  initialAdminFormState,
  type AdminFormState,
  type CandidateInput,
} from "@/lib/form-state";
import { cn } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
import { FormAlert } from "./FormAlert";
import { EmptyState } from "./EmptyState";
import { EditIcon, PlusIcon, TrashIcon } from "./Icons";

const emptyInput: CandidateInput = {
  category_id: "",
  name: "",
  description: null,
  class_name: null,
  photo_url: null,
  is_active: true,
};

export function CandidatesManager({
  candidates,
  categories,
}: {
  candidates: CandidateWithCategory[];
  categories: CategoryWithCounts[];
}) {
  const [editing, setEditing] = useState<CandidateWithCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [input, setInput] = useState<CandidateInput>(emptyInput);
  const [state, setState] = useState<AdminFormState>(initialAdminFormState);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesFilter = filter === "all" || c.category_id === filter;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.class_name?.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [candidates, filter, query]);

  function openCreate() {
    setEditing(null);
    setInput({
      ...emptyInput,
      category_id: categories[0]?.id ?? "",
    });
    setState(initialAdminFormState);
    setCreating(true);
  }

  function openEdit(candidate: CandidateWithCategory) {
    setCreating(false);
    setEditing(candidate);
    setState(initialAdminFormState);
    setInput({
      category_id: candidate.category_id,
      name: candidate.name,
      description: candidate.description,
      class_name: candidate.class_name,
      photo_url: candidate.photo_url,
      is_active: candidate.is_active,
    });
  }

  function close() {
    setCreating(false);
    setEditing(null);
    setState(initialAdminFormState);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.name.trim() || !input.category_id) {
      setState({
        error: "Name and category are required.",
        success: null,
      });
      return;
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updateCandidateAction(editing.id, input);
          setState({ error: null, success: "Candidate updated." });
        } else {
          await createCandidateAction(input);
          setState({ error: null, success: "Candidate added." });
        }
        setCreating(false);
        setEditing(null);
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : "Something went wrong.",
          success: null,
        });
      }
    });
  }

  function remove(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteCandidateAction(id);
        setState({ error: null, success: "Candidate deleted." });
      } catch (err) {
        setState({
          error: err instanceof Error ? err.message : "Something went wrong.",
          success: null,
        });
      } finally {
        setDeletingId(null);
      }
    });
  }

  const formOpen = creating || editing !== null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Candidates"
        description="Add and organise the nominees across every award category."
        action={
          <button
            type="button"
            onClick={openCreate}
            disabled={categories.length === 0}
            title={
              categories.length === 0
                ? "Create a category first."
                : "Add a candidate"
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusIcon width={18} height={18} />
            New candidate
          </button>
        }
      />

      <FormAlert error={state.error} success={state.success} />

      {formOpen ? (
        <form
          onSubmit={submit}
          className="mb-6 rounded-2xl border border-line bg-surface p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-ink">
            {editing ? "Edit candidate" : "New candidate"}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </span>
              <input
                value={input.name}
                onChange={(e) => setInput({ ...input, name: e.target.value })}
                required
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Category
              </span>
              <select
                value={input.category_id}
                onChange={(e) =>
                  setInput({ ...input, category_id: e.target.value })
                }
                required
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Class
              </span>
              <input
                value={input.class_name ?? ""}
                onChange={(e) =>
                  setInput({ ...input, class_name: e.target.value })
                }
                placeholder="e.g. L5SWD"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={input.is_active}
                onChange={(e) =>
                  setInput({ ...input, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
              />
              Active (listed for voting)
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Photo URL
              </span>
              <input
                value={input.photo_url ?? ""}
                onChange={(e) =>
                  setInput({ ...input, photo_url: e.target.value })
                }
                placeholder="https://…"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Description
              </span>
              <textarea
                value={input.description ?? ""}
                onChange={(e) =>
                  setInput({ ...input, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Add candidate"}
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null }

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, class or category…"
          className="w-full max-w-xs rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">
          {filtered.length} of {candidates.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={candidates.length === 0 ? "No candidates yet" : "No matches"}
          message={
            candidates.length === 0
              ? "Add nominees to the categories you created."
              : "Try a different search or category filter."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((candidate) => (
                <tr key={candidate.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {candidate.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={candidate.photo_url}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium text-ink">
                        {candidate.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {candidate.categoryName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {candidate.class_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        candidate.is_active
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-line bg-canvas text-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          candidate.is_active ? "bg-success" : "bg-muted"
                        )}
                      />
                      {candidate.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(candidate)}
                        className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label={`Edit ${candidate.name}`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(candidate.id)}
                        disabled={deletingId === candidate.id}
                        className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-error hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${candidate.name}`}
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
