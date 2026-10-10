"use client";

import { useMemo, useState } from "react";
import type { StudentRow } from "@/lib/admin-data";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export function StudentsView({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.student_id?.toLowerCase().includes(q) ||
        s.class_name?.toLowerCase().includes(q)
    );
  }, [students, query]);

  const votedCount = students.filter((s) => s.hasVoted).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Students"
        description="Registered student accounts and whether they have voted."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, ID or class…"
          className="w-full max-w-xs rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-sm text-muted">
          {filtered.length} of {students.length} · {votedCount} have voted
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={students.length === 0 ? "No students yet" : "No matches"}
          message={
            students.length === 0
              ? "Student accounts appear here once they register."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Voted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((student) => (
                <tr key={student.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(student.full_name) || "ST"}
                      </span>
                      <span className="font-medium text-ink">
                        {student.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {student.student_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {student.class_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(student.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        student.hasVoted
                          ? "border-success/30 bg-success-soft text-success"
                          : "border-line bg-canvas text-muted"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          student.hasVoted ? "bg-success" : "bg-muted"
                        }`}
                      />
                      {student.hasVoted ? "Yes" : "No"}
                    </span>
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
