import Link from "next/link";
import type { ElectionStatus, Settings } from "@/lib/types";
import { getStatusLabel, getStatusStyles } from "@/lib/status";
import { formatDateTime } from "@/lib/utils";
import { ClockIcon } from "./Icons";

export function ElectionStatusCard({
  settings,
  status,
}: {
  settings: Settings | null;
  status: ElectionStatus | "unknown";
}) {
  const styles = getStatusStyles(status);

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Election Status</h2>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${styles.pill}`}
        >
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {getStatusLabel(status)}
        </span>
      </div>

      {settings ? (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-canvas p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Starts
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {formatDateTime(settings.voting_start)}
              </p>
            </div>
            <div className="rounded-xl bg-canvas p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Ends
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {formatDateTime(settings.voting_end)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon width={14} height={14} />
              {settings.election_name} {settings.election_year}
            </span>
          </div>

          <div className="mt-6">
            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Manage Election
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-line bg-canvas p-6 text-center">
          <p className="text-sm font-medium text-ink">
            The election has not been configured yet.
          </p>
          <p className="mt-1 text-sm text-muted">
            Add a row to the settings table to define the voting window.
          </p>
        </div>
      )}
    </section>
  );
}
