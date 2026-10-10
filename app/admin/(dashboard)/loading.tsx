export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-line" />
        <div className="mt-3 h-4 w-80 rounded-md bg-line" />

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="h-4 w-20 rounded bg-line" />
              <div className="mt-3 h-8 w-16 rounded bg-line" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <div className="h-5 w-40 rounded bg-line" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="h-16 rounded-xl bg-canvas" />
            <div className="h-16 rounded-xl bg-canvas" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Loading dashboard…
      </p>
    </div>
  );
}
