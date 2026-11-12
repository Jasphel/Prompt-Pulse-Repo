import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Field, inputCls, PageHeader, Panel, Segmented, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { fmtTime, hitByEvent, parseTime } from "@/lib/rules";
import { TODAY } from "@/lib/seed";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar & News · CISC SpaceSync" },
      { name: "description", content: "CISC academic calendar, events, holidays and room closures." },
      { property: "og:title", content: "Calendar & News · CISC SpaceSync" },
      { property: "og:description", content: "CISC academic calendar, events, holidays and room closures." },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Chip look per event type: solid blue = every room closed, green tint = some rooms, dashed = not published yet. */
function chipCls(e: CalendarEvent) {
  if (e.status === "proposed") return "border border-dashed border-warning bg-warning/15 text-warning-foreground";
  if (e.scope === "all") return "bg-primary text-primary-foreground";
  return "border border-secondary/40 bg-accent text-accent-foreground";
}

function CalendarPage() {
  const s = useStore();
  const isAdmin = s.role === "admin";
  const visible = s.events.filter((e) => e.status === "published" || isAdmin || e.proposedBy === s.me);
  const days = Array.from({ length: 30 }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`);
  const lead = new Date("2026-11-01T00:00").getDay();
  const sorted = [...visible].sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar & news" subtitle="Holidays and CISC-wide events close every room. Room events close only the rooms listed." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="November 2026" icon={<CalendarDays className="h-4 w-4" />}>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground" aria-hidden>{WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}</div>
          <ol className="grid grid-cols-7 gap-1" aria-label="Days of November 2026">
            {Array.from({ length: lead }).map((_, i) => <li key={i} aria-hidden />)}
            {days.map((d) => {
              const ev = visible.filter((e) => e.date === d);
              const isToday = d === TODAY;
              return (
                <li key={d} className={cn("min-h-14 rounded-lg border p-1 text-left text-xs sm:min-h-24", isToday ? "border-primary bg-primary/5" : "border-border bg-card")}>
                  <div className={cn("mb-0.5 grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold", isToday && "bg-primary text-primary-foreground")}>{+d.slice(8)}</div>
                  {ev.map((e) => (
                    <div key={e.id} title={e.title}>
                      <div className={cn("mt-0.5 hidden truncate rounded px-1 py-0.5 text-[10px] font-medium sm:block", chipCls(e))}>{e.title}</div>
                      <span className={cn("mt-0.5 block h-1.5 w-1.5 rounded-full sm:hidden", e.scope === "all" ? "bg-primary" : "bg-secondary")}><span className="sr-only">{e.title}</span></span>
                    </div>
                  ))}
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-primary" /> All rooms closed</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-secondary/40 bg-accent" /> Specific rooms</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-dashed border-warning bg-warning/15" /> Proposed, not official yet</span>
          </div>
        </Panel>
        <ProposeForm />
      </div>
      <Panel title="Announcements" icon={<Megaphone className="h-4 w-4" />}>
        {sorted.length === 0 ? (
          <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No announcements yet">Published events and holidays appear here.</EmptyState>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">{sorted.map((e) => <EventCard key={e.id} e={e} />)}</ul>
        )}
      </Panel>
    </div>
  );
}

function EventCard({ e }: { e: CalendarEvent }) {
  const s = useStore();
  const hits = hitByEvent(e, s.reservations);
  const d = new Date(e.date + "T00:00");
  return (
    <li className={cn("rounded-xl border p-4", e.status === "proposed" ? "border-dashed border-warning/70 bg-warning/5" : "border-border")}>
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent text-center text-accent-foreground" aria-hidden>
          <div>
            <div className="text-[10px] font-medium leading-none">{d.toLocaleString("en", { month: "short" })}</div>
            <div className="mt-0.5 font-display text-lg font-bold leading-none">{d.getDate()}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{e.title}</h3>
            <StatusBadge status={e.status} />
          </div>
          <p className="text-xs capitalize text-muted-foreground">{e.kind} · {e.end - e.start >= 1440 ? "Whole day" : `${fmtTime(e.start)}–${fmtTime(e.end)}`}</p>
        </div>
      </div>
      <p className="mt-3 text-sm">{e.description}</p>
      <p className="mt-2 text-xs font-medium text-primary">{e.scope === "all" ? "All CISC rooms unavailable" : `Unavailable: ${e.roomIds.map(s.roomName).join(", ")}`}</p>
      {e.status === "proposed" && <p className="mt-1 text-xs text-muted-foreground">Proposed by {e.proposedBy}. It isn't official until an administrator publishes it.</p>}
      {s.role === "admin" && e.status === "proposed" && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {hits.length > 0 && <p className="text-xs text-destructive">Publishing will cancel {hits.length} reservation{hits.length === 1 ? "" : "s"} and notify the requesters.</p>}
          <div className="flex gap-2"><Button size="sm" onClick={() => s.publishEvent(e.id)}>Publish</Button><Button size="sm" variant="outline" onClick={() => s.removeEvent(e.id)}>Decline</Button></div>
        </div>
      )}
    </li>
  );
}

const KINDS: { value: CalendarEvent["kind"]; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "holiday", label: "Holiday" },
  { value: "closure", label: "Closure" },
];
const SCOPES: { value: CalendarEvent["scope"]; label: string }[] = [
  { value: "rooms", label: "Selected rooms" },
  { value: "all", label: "All rooms" },
];

function ProposeForm() {
  const s = useStore();
  const [f, setF] = useState({ title: "", description: "", date: "2026-11-20", start: "08:00", end: "12:00", kind: "event" as CalendarEvent["kind"], scope: "rooms" as CalendarEvent["scope"], roomIds: [] as string[] });
  const timeInvalid = parseTime(f.end) <= parseTime(f.start);
  const needsRooms = f.scope === "rooms" && f.roomIds.length === 0;
  const valid = f.title.trim() && !timeInvalid && !needsRooms;
  return (
    <Panel title={s.role === "admin" ? "New announcement" : "Propose an event"} className="h-fit">
      <div className="grid gap-4">
        <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Hackathon briefing" /></Field>
        <Field label="Description and instructions"><textarea className={inputCls + " h-20 resize-y py-2"} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Date"><input type="date" className={inputCls + " px-2"} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <Field label="From"><input type="time" className={inputCls + " px-2"} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
            <Field label="To"><input type="time" className={inputCls + " px-2"} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field>
          </div>
          {timeInvalid && <p role="alert" className="mt-2 text-xs text-destructive">End time must be after the start time.</p>}
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Type</span>
          <Segmented label="Type" value={f.kind} onChange={(kind) => setF({ ...f, kind, scope: kind === "event" ? f.scope : "all" })} options={KINDS} />
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Affects</span>
          <Segmented label="Affects" value={f.scope} onChange={(scope) => f.kind === "event" && setF({ ...f, scope })} options={SCOPES} />
          {f.kind !== "event" && <p className="text-xs text-muted-foreground">Holidays and closures always apply to every room.</p>}
        </div>
        {f.scope === "rooms" && (
          <div>
            <div className="flex flex-wrap gap-1.5">{s.rooms.map((r) => { const on = f.roomIds.includes(r.id); return <button type="button" key={r.id} aria-pressed={on} onClick={() => setF({ ...f, roomIds: on ? f.roomIds.filter((x) => x !== r.id) : [...f.roomIds, r.id] })} className={cn("h-8 rounded-lg border px-3 text-xs font-medium transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>{on ? "✓ " : ""}{r.name}</button>; })}</div>
            {needsRooms && <p className="mt-2 text-xs text-muted-foreground">Pick at least one room.</p>}
          </div>
        )}
        <Button disabled={!valid} onClick={() => { s.proposeEvent({ ...f, start: parseTime(f.start), end: parseTime(f.end), roomIds: f.scope === "all" ? [] : f.roomIds }); setF({ ...f, title: "", description: "", roomIds: [] }); }}>{s.role === "admin" ? "Save draft" : "Send proposal"}</Button>
        <p className="text-xs text-muted-foreground">An administrator reviews and publishes every event.</p>
      </div>
    </Panel>
  );
}
