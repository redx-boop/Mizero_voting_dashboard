// ============================================================================
// Election status logic.
//
// The status is derived from the settings row's voting window — it is NEVER
// hardcoded in the UI:
//   • no start / before start  → "scheduled"  (Scheduled)
//   • inside the voting window → "open"       (Open)
//   • after the end date       → "closed"     (Closed)
//
// The window comes straight from public.settings — there is no separate
// "paused" flag in the database, so the status is derived from time alone.
// ============================================================================

import type { ElectionStatus, Settings } from "@/lib/types";

export function getElectionStatus(
  settings: Settings | null,
  now: Date = new Date()
): ElectionStatus | "unknown" {
  if (!settings) return "unknown";

  const start = settings.voting_start ? new Date(settings.voting_start) : null;
  const end = settings.voting_end ? new Date(settings.voting_end) : null;

  if (end && now > end) return "closed";
  if (start && now < start) return "scheduled";
  return "open";
}

export function getStatusLabel(status: ElectionStatus | "unknown"): string {
  switch (status) {
    case "scheduled":
      return "Voting is scheduled";
    case "open":
      return "Voting is Open";
    case "closed":
      return "Voting is Closed";
    default:
      return "Election not configured";
  }
}

/** Tailwind class groups for the status pill (background / text / border). */
export function getStatusStyles(status: ElectionStatus | "unknown") {
  switch (status) {
    case "open":
      return {
        dot: "bg-success",
        pill: "bg-success-soft text-success border-success/30",
      };
    case "scheduled":
      return {
        dot: "bg-gold",
        pill: "bg-gold-soft text-[#8a6a14] border-gold/40",
      };
    case "closed":
      return {
        dot: "bg-error",
        pill: "bg-error-soft text-error border-error/30",
      };
    default:
      return {
        dot: "bg-muted",
        pill: "bg-canvas text-muted border-line",
      };
  }
}
