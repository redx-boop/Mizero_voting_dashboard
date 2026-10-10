import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  hint?: string;
  /** Accent color for the icon chip. */
  tone?: "primary" | "gold" | "success";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold-soft text-[#8a6a14]",
  success: "bg-success-soft text-success",
};

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
      {hint ? <p className="mt-3 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
