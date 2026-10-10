import type { DashboardData } from "@/lib/dashboard";
import { formatDateTime } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { ElectionStatusCard } from "./ElectionStatusCard";
import {
  CandidatesIcon,
  CategoriesIcon,
  StudentsIcon,
  VotesIcon,
  TrophyIcon,
} from "./Icons";

export function DashboardOverview({
  data,
  adminName,
  adminEmail,
}: {
  data: DashboardData;
  adminName: string;
  adminEmail: string;
}) {
  const { stats } = data;
  const hasAnyRecords =
    stats.students + stats.categories + stats.candidates + stats.totalVotes > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Welcome header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Welcome back, Admin
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">
          Manage the Mizero Awards election from one place.
        </p>
        <p className="mt-3 text-xs text-muted">
          Signed in as{" "}
          <span className="font-medium text-ink">{adminName}</span>
          {adminEmail ? ` · ${adminEmail}` : ""}
        </p>
      </header>

      {!hasAnyRecords ? (
        <div className="mb-6 rounded-2xl border border-dashed border-line bg-surface p-6">
          <p className="text-sm font-medium text-ink">
            No election data yet.
          </p>
          <p className="mt-1 text-sm text-muted">
            There are no students, categories, candidates or votes in the
            database. Once the election is set up, live figures will appear here.
          </p>
        </div>
      ) : null}

      {/* Statistics */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Election statistics
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Students"
            value={stats.students}
            tone="primary"
            icon={<StudentsIcon width={20} height={20} />}
            hint="Registered student accounts"
          />
          <StatCard
            label="Categories"
            value={stats.categories}
            tone="primary"
            icon={<CategoriesIcon width={20} height={20} />}
            hint="Award categories"
          />
          <StatCard
            label="Candidates"
            value={stats.candidates}
            tone="primary"
            icon={<CandidatesIcon width={20} height={20} />}
            hint="Nominees across categories"
          />
          <StatCard
            label="Total Votes"
            value={stats.totalVotes}
            tone="gold"
            icon={<VotesIcon width={20} height={20} />}
            hint="Votes cast in this election"
          />
          <StatCard
            label="Participation"
            value={`${stats.participationRate}%`}
            tone="success"
            icon={<TrophyIcon width={20} height={20} />}
            hint={`${stats.voters} of ${stats.students} students voted`}
          />
        </div>
      </section>

      {/* Election status */}
      <div className="mt-6">
        <ElectionStatusCard
          settings={data.settings}
          status={data.electionStatus}
        />
      </div>

      {/* Summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        <h2
          id="summary-heading"
          className="text-base font-semibold text-ink"
        >
          Election Overview
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryItem label="Categories" value={stats.categories} />
          <SummaryItem label="Candidates" value={stats.candidates} />
          <SummaryItem label="Votes" value={stats.totalVotes} />
          <SummaryItem label="Students" value={stats.students} />
        </dl>
        <p className="mt-4 text-xs text-muted">
          Last updated {formatDateTime(data.generatedAt)}
        </p>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-canvas p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}
