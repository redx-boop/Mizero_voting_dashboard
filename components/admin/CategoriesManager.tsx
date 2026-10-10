"use client";

import { useState, useTransition } from "react";
import type { CategoryWithCounts } from "@/lib/admin-data";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions/admin";
import {
  initialAdminFormState,
  type AdminFormState,
  type CategoryInput,
} from "@/lib/form-state";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
import { FormAlert } from "./FormAlert";
import { EmptyState } from "./EmptyState";
import { AlertIcon, EditIcon, PlusIcon, TrashIcon } from "./Icons";

const emptyInput: CategoryInput = {
  name: "",
  description: null,
  icon: null,
  is_active: true,
  voting_start: null,
  voting_end: null,
};

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time (no timezone).
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CategoriesManager({
  categories,
}: {
  categories: CategoryWithCounts[];
}) {
  const [editing, setEditing] = useState<CategoryWithCounts | null>(null);
  const [creating, setCreating] = useState(false);
  const [input, setInput] = useState<CategoryInput>(emptyInput);
  const [state, setState] = useState<AdminFormState>(initialAdminFormState);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setInput(emptyInput);
    setState(initialAdminFormState);
    setCreating(true);
  }

  function openEdit(category: CategoryWithCounts) {
    setCreating(false);
    setEditing(category);
    setState(initialAdminFormState);
    setInput({
      name: category.name,
      description: category.description,
      icon: category.icon,
      is_active: category.is_active,
      voting_start: category.voting_start,
      voting_end: category.voting_end,
    });
  }

  function close() {
    setCreating(false);
    setEditing(null);
    setState(initialAdminFormState);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.name.trim()) {
      setState({ error: "Category name is required.", success: null });
      return;
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updateCategoryAction(editing.id, input);
          setState({ error: null, success: "Category updated." });
        } else {
          await createCategoryAction(input);
          setState({ error: null, success: "Category created." });
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
        await deleteCategoryAction(id);
        setState({ error: null, success: "Category deleted." });
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
        title="Categories"
        description="Create and manage the award categories students can vote in."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <PlusIcon width={18} height={18} />
            New category
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
            {editing ? "Edit category" : "New category"}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Name
              </span>
              <input
                value={input.name}
                onChange={(e) =>
                  setInput({ ...input, name: e.target.value })
                }
                required
                placeholder="e.g. Fashion Icon of the Term"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Icon (emoji)
              </span>
              <input
                value={input.icon ?? ""}
                onChange={(e) => setInput({ ...input, icon: e.target.value })}
                placeholder="🏆"
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
              Active (visible for voting)
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

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Voting opens
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(input.voting_start)}
                onChange={(e) =>
                  setInput({
                    ...input,
                    voting_start: e.target.value || null,
                  })
                }
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">
                Voting closes
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(input.voting_end)}
                onChange={(e) =>
                  setInput({ ...input, voting_end: e.target.value || null })
                }
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
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create category"}
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
      ) : null}

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          message="Create your first award category to start building the ballot."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Candidates</th>
                <th className="px-4 py-3 font-medium">Voting window</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((category) => (
                <tr key={category.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {category.icon ? (
                        <span className="text-xl">{category.icon}</span>
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {category.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {category.candidateCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {formatDate(category.voting_start, "—")} →{" "}
                    {formatDate(category.voting_end, "—")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        category.is_active
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-line bg-canvas text-muted"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          category.is_active ? "bg-success" : "bg-muted"
                        }`}
                      />
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label={`Edit ${category.name}`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(category.id)}
                        disabled={deletingId === category.id}
                        className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-error hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${category.name}`}
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

      {state.error && !formOpen ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-error">
          <AlertIcon width={16} height={16} />
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
