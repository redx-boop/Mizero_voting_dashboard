"use client";

import { useMemo, useState } from "react";
import type { ResultsData } from "@/lib/admin-data";
import { formatDateTime, getInitials } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export function ResultsView({ results }: { results: ResultsData }) {
  const [selected, setSelected] = useState<string>("all");

  const visible = useMemo(
    () =>
      selected === "all"
        ? results.categories
        : results.categories.filter((c) => c.categoryId === selected),
    [results.categories, selected]
  );

  const hasVotes = results.totalVotes > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Results"
        description="Live vote totals for every category, ranked by popularity."
      />

      {/* Summary tiles */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="Total votes" value={results.totalVotes} />
        <Tile label="Voters" value={results.totalVoters} />
        <Tile label="Categories" value={results.categories.length} />
        <Tile
          label="Cast at"
          value={formatDateTime(results.generatedAt, "—")}
          small
        />
      </div>

      {!hasVotes ? (
        <EmptyState
          title="No votes yet"
          message="Results will populate as soon as students start voting."
        />
      ) : (
        <>
          <div className="mb-4">
            <label
              htmlFor="category-filter"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Category
            </label>
            <select
              id="category-filter"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All categories</option>
              {results.categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {visible.map((category) => {
              const leader = category.candidates[0];
              const max = leader?.votes ?? 0;

              return (
                <section
                  key={category.categoryId}
                  className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                      {category.icon ? <span>{category.icon}</span> : null}
                      {category.name}
                    </h2>
                    <span className="text-sm text-muted">
                      {category.totalVotes} votes
                    </span>
                  </div>

                  {category.candidates.length === 0 ? (
                    <p className="mt-4 text-sm text-muted">
                      No candidates in this category yet.
                    </p>
                  ) : (
                    <ol className="mt-4 space-y-3">
                      {category.candidates.map((candidate, index) => {
                        const share =
                          category.totalVotes > 0
                            ? Math.round(
                                (candidate.votes / category.totalVotes) * 100
                              )
                            : 0;
                        const width =
                          max > 0 ? Math.round((candidate.votes / max) * 100) : 0;

                        return (
                          <li
                            key={candidate.candidateId}
                            className="rounded-xl bg-canvas p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 shrink-0 text-sm font-semibold text-muted">
                                {index + 1}
                              </span>
                              {candidate.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={candidate.photoUrl}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                  {getInitials(candidate.name) || "CA"}
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="truncate font-medium text-ink">
                                    {candidate.name}
                                    {index === 0 && candidate.votes > 0 ? (
                                      <span className="ml-2 rounded-md bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a6a14]">
                                        Leading
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="shrink-0 text-sm font-semibold text-ink">
                                    {candidate.votes}{" "}
                                    <span className="font-normal text-muted">
                                      ({share}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${width}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  small,
}: {
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`mt-2 font-semibold tracking-tight text-ink ${
          small ? "text-base" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
