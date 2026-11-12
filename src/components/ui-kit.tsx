import type { CSSProperties, ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Layout ---------- */

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  icon,
  action,
  children,
  className,
  flush,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove inner padding (for tables / timelines that run edge to edge). */
  flush?: boolean;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-card", flush ? "p-0" : "p-5", className)}>
      {title && (
        <div className={cn("flex items-center justify-between gap-2", flush ? "border-b border-border px-5 py-4" : "mb-4")}>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {icon && <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-accent-foreground">{icon}</span>}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-1 rounded-xl border border-dashed border-border px-4 py-8 text-center">
      {icon && <div className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {children && <p className="max-w-sm text-xs text-muted-foreground">{children}</p>}
    </div>
  );
}

/* ---------- Status ---------- */

const tone: Record<string, string> = {
  approved: "bg-success/15 text-success border-success/30",
  published: "bg-success/15 text-success border-success/30",
  official: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  "returned / closed": "bg-success/15 text-success border-success/30",
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  proposed: "bg-warning/20 text-warning-foreground border-warning/40",
  "under review": "bg-warning/20 text-warning-foreground border-warning/40",
  "claim submitted": "bg-warning/20 text-warning-foreground border-warning/40",
  "in progress": "bg-primary/10 text-primary border-primary/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};
const icons: Record<string, string> = { approved: "✓", published: "✓", official: "✓", resolved: "✓", rejected: "✕", cancelled: "✕", pending: "●", proposed: "●" };

export function StatusBadge({ status }: { status: string }) {
  const k = status.toLowerCase();
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", tone[k] ?? "bg-muted text-muted-foreground border-border")}>
      <span aria-hidden>{icons[k] ?? "○"}</span>
      {status}
    </span>
  );
}

export function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuenow={used} aria-valuemax={total} aria-label="Occupancy">
      <div className={cn("h-full rounded-full transition-[width]", pct >= 100 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-green-brand")} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Form controls ---------- */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm transition-colors placeholder:text-muted-foreground/70 hover:border-ring/50 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring";

/** One-of-many choice as a row of pills. Replaces short <select>s where seeing every option helps. */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn("h-8 rounded-lg border px-3 text-xs font-medium transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 500, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const btn = "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-input bg-card transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-card";
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min} aria-label="Decrease">
        <Minus className="h-4 w-4" />
      </button>
      <input type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value) || min)} className={cn(inputCls, "text-center font-medium tabular-nums")} aria-label={label} />
      <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max} aria-label="Increase">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- Timetable colors ---------- */

const LANES = 6;

/** Stable 0..5 index for a key (e.g. a course name) so the same course is always the same color. */
export function laneIndex(key: string) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % LANES;
}

/** Tinted background + colored left edge. Dark text stays readable on the tint in light mode. */
export function laneStyle(key: string): CSSProperties {
  const c = `var(--lane-${laneIndex(key) + 1})`;
  return { background: `color-mix(in oklab, ${c} 14%, var(--card))`, borderLeftColor: c, "--lane": c } as CSSProperties;
}
