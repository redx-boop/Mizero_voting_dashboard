"use client";

import { useMemo, useState } from "react";
import type { VoteWithRelations } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export function VotesView({
  votes,
  total,
}: {
  votes: VoteWithRelations[];
  total: number;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return votes;
    return votes.filter(
      (v) =>
        v.studentName.toLowerCase().includes(q) ||
        v.candidateName.toLowerCase().includes(q) ||
        v.categoryName.toLowerCase().includes(q)
    );
  }, [votes, query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Votes"
        description="A live feed of every ballot cast in this election."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student, candidate or category…"
          className="w-full max-w-xs rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-sm text-muted">
          Showing {votes.length}
          {total > votes.length ? ` most recent of ${total}` : ` of ${total}`}{" "}
          votes
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={total === 0 ? "No votes yet" : "No matches"}
          message={
            total === 0
              ? "Ballots will appear here in real time as students vote."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Cast at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((vote) => (
                <tr key={vote.id} className="align-middle">
                  <td className="px-4 py-3 font-medium text-ink">
                    {vote.studentName}
                  </td>
                  <td className="px-4 py-3 text-ink">{vote.candidateName}</td>
                  <td className="px-4 py-3 text-muted">{vote.categoryName}</td>
                  <td className="px-4 py-3 text-muted">
                    {formatDateTime(vote.created_at)}
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
