import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flag, PackageCheck, Search, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState, Field, inputCls, PageHeader, Panel, Segmented, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { FACILITY_FLOW, FOUND_FLOW, LOST_FLOW } from "@/lib/seed";
import type { Report } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · CISC SpaceSync" },
      { name: "description", content: "Report a facility problem, or post and claim lost and found items in CISC rooms." },
      { property: "og:title", content: "Reports · CISC SpaceSync" },
      { property: "og:description", content: "Facility issues and lost and found for CISC rooms." },
    ],
  }),
  component: ReportsPage,
});

const KIND_META: Record<Report["kind"], { label: string; icon: typeof Wrench; flow: string[] }> = {
  facility: { label: "Facility issue", icon: Wrench, flow: FACILITY_FLOW },
  lost: { label: "Lost item", icon: Search, flow: LOST_FLOW },
  found: { label: "Found item", icon: PackageCheck, flow: FOUND_FLOW },
};
const CLOSED = ["Resolved", "Returned / Closed"];

function ReportsPage() {
  const s = useStore();
  const isAdmin = s.role === "admin";
  const [filter, setFilter] = useState<"all" | Report["kind"]>("all");
  // People see their own reports plus every lost-and-found post, so items can be found and claimed.
  const visible = s.reports.filter((r) => isAdmin || r.reporter === s.me || r.kind !== "facility").filter((r) => filter === "all" || r.kind === filter);
  const open = visible.filter((r) => !CLOSED.includes(r.status));
  const closed = visible.filter((r) => CLOSED.includes(r.status));

  return (
    <div>
      <PageHeader title="Reports" subtitle={isAdmin ? "Track facility problems and lost-and-found items, and move each one to its next step." : "Report a problem in a room, or post something you lost or found. The Registrar follows up on every report."} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <NewReport />
        <div className="min-w-0">
          <div className="mb-4">
            <Segmented
              label="Filter reports"
              value={filter}
              onChange={setFilter}
              options={[{ value: "all", label: "All" }, { value: "facility", label: "Facility" }, { value: "lost", label: "Lost" }, { value: "found", label: "Found" }]}
            />
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={<Flag className="h-5 w-5" />} title="No reports here">Use the form to report a problem or post a lost or found item.</EmptyState>
          ) : (
            <div className="space-y-8">
              {open.length > 0 && (
                <section aria-label="Open reports">
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Open ({open.length})</h2>
                  <ul className="grid gap-4">{open.map((r) => <ReportCard key={r.id} r={r} />)}</ul>
                </section>
              )}
              {closed.length > 0 && (
                <section aria-label="Closed reports">
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Closed ({closed.length})</h2>
                  <ul className="grid gap-4">{closed.map((r) => <ReportCard key={r.id} r={r} />)}</ul>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewReport() {
  const s = useStore();
  const [kind, setKind] = useState<Report["kind"]>("facility");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [roomId, setRoomId] = useState(s.rooms[0]?.id ?? "");
  const [anonymous, setAnonymous] = useState(false);
  const valid = title.trim() && details.trim() && roomId;
  const copy = {
    facility: { title: "What's wrong?", ph: "e.g. Projector won't turn on", details: "Tell us what you saw and where in the room." },
    lost: { title: "What did you lose?", ph: "e.g. Black USB drive", details: "Add colour, brand, labels or anything that helps identify it." },
    found: { title: "What did you find?", ph: "e.g. Blue water bottle", details: "Say where you found it. Leave out details only the owner would know." },
  }[kind];

  return (
    <Panel title="New report" icon={<Flag className="h-4 w-4" />} className="h-fit lg:sticky lg:top-24">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          s.addReport({ kind, title: title.trim(), details: details.trim(), roomId, reporter: s.me }, anonymous);
          setTitle("");
          setDetails("");
        }}
      >
        <div className="grid gap-2">
          <span className="text-sm font-medium">Type</span>
          <Segmented label="Report type" value={kind} onChange={setKind} options={(Object.keys(KIND_META) as Report["kind"][]).map((k) => ({ value: k, label: KIND_META[k].label }))} />
        </div>
        <Field label="Room">
          <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)}>{s.rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        </Field>
        <Field label={copy.title}><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={copy.ph} /></Field>
        <Field label="Details" hint={copy.details}><textarea className={inputCls + " h-24 resize-y py-2"} value={details} onChange={(e) => setDetails(e.target.value)} /></Field>
        <div className="flex items-start justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
          <div className="text-sm">
            <label htmlFor="anon" className="font-medium">Report anonymously</label>
            <p className="text-xs text-muted-foreground">Your name is hidden, and the report won't appear in your own list.</p>
          </div>
          <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
        </div>
        <Button type="submit" disabled={!valid}>Submit report</Button>
      </form>
    </Panel>
  );
}

function ReportCard({ r }: { r: Report }) {
  const s = useStore();
  const meta = KIND_META[r.kind];
  const Icon = meta.icon;
  const isAdmin = s.role === "admin";
  const step = Math.max(0, meta.flow.indexOf(r.status));
  const done = CLOSED.includes(r.status);
  const canClaim = !isAdmin && r.kind === "found" && r.status === "Unclaimed";

  return (
    <li className={cn("rounded-xl border border-border bg-card p-4 shadow-card", done && "bg-muted/40")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", done ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")}><Icon className="h-5 w-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{r.title}</h3>
            <StatusBadge status={r.status} />
          </div>
          <p className="text-xs text-muted-foreground">{meta.label} · {s.roomName(r.roomId)} · {r.date} · {r.reporter}</p>
          <p className="mt-2 text-sm">{r.details}</p>
        </div>
      </div>

      <ol className="mt-4 flex items-start" aria-label="Progress">
        {meta.flow.map((label, i) => {
          const reached = i <= step;
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === step ? "step" : undefined}>
              {i > 0 && <span className={cn("absolute right-1/2 top-2.5 h-0.5 w-full", reached ? "bg-primary" : "bg-border")} aria-hidden />}
              <span className={cn("relative z-[1] grid h-5 w-5 place-items-center rounded-full border-2 bg-card", reached ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                {reached && <Check className="h-3 w-3" aria-hidden />}
              </span>
              <span className={cn("mt-1.5 px-0.5 text-[11px] leading-tight", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
            </li>
          );
        })}
      </ol>

      {(isAdmin || canClaim) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          {isAdmin && (
            <label className="flex items-center gap-2 text-xs font-medium">
              Update status
              <select className={inputCls + " h-9 w-auto min-w-40"} value={r.status} onChange={(e) => s.setReportStatus(r.id, e.target.value)}>
                {meta.flow.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
          )}
          {canClaim && <Button size="sm" onClick={() => s.setReportStatus(r.id, "Claim Submitted")}>This is mine</Button>}
        </div>
      )}
    </li>
  );
}
