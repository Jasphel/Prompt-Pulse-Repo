import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CalendarX, Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Field, inputCls, laneStyle, PageHeader, Panel, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { DAYS, dayOf, fmtTime, scheduleConflicts, suggestSlots, type Suggestion } from "@/lib/rules";
import { TODAY } from "@/lib/seed";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/types";

export const Route = createFileRoute("/schedules")({
  head: () => ({
    meta: [
      { title: "Class Schedules · CISC SpaceSync" },
      { name: "description", content: "Official CISC class schedules by room, with conflict checks and a scheduling assistant for the Registrar." },
      { property: "og:title", content: "Class Schedules · CISC SpaceSync" },
      { property: "og:description", content: "Official CISC class schedules by room." },
    ],
  }),
  component: SchedulesPage,
});

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i);
const START = 7 * 60, PX = 1;
const NOW = 10 * 60 + 30;

function SchedulesPage() {
  const s = useStore();
  const [room, setRoom] = useState("");
  const list = s.schedules.filter((c) => !room || c.roomId === room);
  const official = list.filter((c) => c.status === "official");
  const proposed = s.schedules.filter((c) => c.status === "proposed");
  const conflicts = scheduleConflicts(s.schedules, s.rooms);
  const todayDay = dayOf(TODAY);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Class schedules"
        subtitle={s.role === "admin" ? "Manage official schedules. Assistant suggestions are only proposals until you approve them." : "Official schedules are view-only. Each class shows its room and faculty."}
        action={
          <select className={inputCls + " w-full sm:w-52"} value={room} onChange={(e) => setRoom(e.target.value)} aria-label="Filter by room">
            <option value="">All rooms</option>{s.rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        }
      />
      <Panel flush>
        {official.length === 0 ? (
          <div className="p-5"><EmptyState icon={<CalendarX className="h-5 w-5" />} title="No official classes in this room">Choose All rooms to see the full weekly schedule.</EmptyState></div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[800px] grid-cols-[56px_repeat(6,1fr)]">
              <div className="sticky left-0 z-10 border-b border-border bg-card" />
              {DAYS.map((d) => {
                const isToday = d === todayDay;
                return (
                  <div key={d} className={cn("border-b border-l border-border py-2.5 text-center text-sm font-semibold", isToday && "bg-primary/5 text-primary")}>
                    {d}{isToday && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 align-middle text-[10px] font-medium text-primary-foreground">Today</span>}
                  </div>
                );
              })}
              <div className="sticky left-0 z-10 bg-card" style={{ height: 12 * 60 * PX }}>
                <div className="relative h-full">
                  {HOURS.map((h) => <div key={h} className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground" style={{ top: (h * 60 - START) * PX }}>{fmtTime(h * 60).replace(":00 ", " ")}</div>)}
                </div>
              </div>
              {DAYS.map((d) => {
                const isToday = d === todayDay;
                return (
                  <div key={d} className={cn("relative border-l border-border", isToday && "bg-primary/5")} style={{ height: 12 * 60 * PX }}>
                    {HOURS.map((h) => <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: (h * 60 - START) * PX }} aria-hidden />)}
                    {official.filter((c) => c.day === d).map((c) => (
                      <div
                        key={c.id}
                        tabIndex={0}
                        title={`${c.course} · ${c.section}\n${s.roomName(c.roomId)} · ${c.faculty}\n${fmtTime(c.start)} to ${fmtTime(c.end)}`}
                        className="absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] p-1.5 text-[11px] leading-tight text-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:z-10"
                        style={{ top: (c.start - START) * PX + 1, height: (c.end - c.start) * PX - 2, ...laneStyle(c.course) }}
                      >
                        <div className="font-semibold">{c.course}</div>
                        <div className="text-muted-foreground">{s.roomName(c.roomId)} · {c.section}</div>
                        <div className="truncate text-muted-foreground">{c.faculty}</div>
                      </div>
                    ))}
                    {isToday && (
                      <div className="pointer-events-none absolute inset-x-0 z-[2] h-px bg-destructive" style={{ top: (NOW - START) * PX }} aria-hidden>
                        <span className="absolute -left-0.5 -top-[3px] h-1.5 w-1.5 rounded-full bg-destructive" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Panel>

      {s.role === "admin" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Assistant rooms={s.rooms} />
          <div className="space-y-6">
            <Panel title={`Conflicts (${conflicts.length})`} icon={<AlertTriangle className="h-4 w-4" />}>
              <ul className="space-y-2 text-sm">
                {conflicts.map((c, i) => <li key={i} className="rounded-lg bg-destructive/10 p-3"><b className="capitalize">{c.kind}:</b> {c.message}</li>)}
                {!conflicts.length && <li className="text-muted-foreground">No double-bookings, overlaps or capacity issues.</li>}
              </ul>
            </Panel>
            <Panel title="Proposed schedules awaiting approval" icon={<Check className="h-4 w-4" />}>
              <ul className="space-y-2 text-sm">
                {proposed.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-3">
                    <div><b>{c.course}</b> · {c.section}<div className="text-xs text-muted-foreground">{s.roomName(c.roomId)} · {c.day} {fmtTime(c.start)}–{fmtTime(c.end)} · {c.faculty}</div></div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => s.updateSchedule(c.id, { status: "official" })}><Check className="h-4 w-4" /> Make official</Button>
                      <Button size="sm" variant="outline" onClick={() => s.removeSchedule(c.id)}><X className="h-4 w-4" /> Discard</Button>
                    </div>
                  </li>
                ))}
                {!proposed.length && <li className="text-muted-foreground">Nothing pending.</li>}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      <Panel title="All official classes" flush>
        {(() => {
          const rows = [...official].sort((x, y) => DAYS.indexOf(x.day) - DAYS.indexOf(y.day) || x.start - y.start);
          if (!rows.length) return <div className="p-5"><EmptyState title="Nothing to list" /></div>;
          return (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                    <tr>{["Day & time", "Course", "Section", "Faculty", "Room", "Status"].map((h, i) => <th key={h} scope="col" className={cn("py-2.5 font-medium", i === 0 ? "pl-5" : "", i === 5 ? "pr-5" : "")}>{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-muted/40">
                        <td className="whitespace-nowrap py-3 pl-5 tabular-nums">{c.day} {fmtTime(c.start)}–{fmtTime(c.end)}</td>
                        <td className="font-medium">{c.course}</td><td>{c.section}</td><td>{c.faculty}</td><td>{s.roomName(c.roomId)}</td>
                        <td className="pr-5"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-border md:hidden">
                {rows.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">{c.course} · {c.section}</div>
                      <div className="text-xs text-muted-foreground">{c.faculty}</div>
                      <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">{c.day} {fmtTime(c.start)}–{fmtTime(c.end)} · {s.roomName(c.roomId)}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            </>
          );
        })()}
      </Panel>
    </div>
  );
}

function Assistant({ rooms }: { rooms: Room[] }) {
  const s = useStore();
  const [f, setF] = useState({ course: "", section: "", faculty: "", classSize: 30, duration: 90, roomType: "" as "" | Room["type"] });
  const [result, setResult] = useState<Suggestion[] | { missing: string[] } | null>(null);
  const faculty = Array.from(new Set(s.schedules.map((c) => c.faculty)));
  const run = () => setResult(suggestSlots({ ...f, roomType: f.roomType || undefined }, rooms, s.schedules));
  return (
    <Panel title="Scheduling assistant" icon={<Sparkles className="h-4 w-4" />} className="h-fit">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Course / subject"><input className={inputCls} value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })} placeholder="CS 341 AI" /></Field>
        <Field label="Section"><input className={inputCls} value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })} placeholder="BSCS 3-A" /></Field>
        <Field label="Faculty">
          <select className={inputCls} value={f.faculty} onChange={(e) => setF({ ...f, faculty: e.target.value })}><option value="">Select…</option>{faculty.map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <Field label="Room type">
          <select className={inputCls} value={f.roomType} onChange={(e) => setF({ ...f, roomType: e.target.value as Room["type"] })}><option value="">Any</option>{["Lecture", "Computer Lab", "Conference", "Studio"].map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Class size"><input type="number" min={1} className={inputCls} value={f.classSize} onChange={(e) => setF({ ...f, classSize: +e.target.value })} /></Field>
        <Field label="Duration (minutes)">
          <select className={inputCls} value={f.duration} onChange={(e) => setF({ ...f, duration: +e.target.value })}><option value={90}>90</option><option value={180}>180</option></select>
        </Field>
      </div>
      <Button className="mt-4 w-full" onClick={run}><Sparkles className="h-4 w-4" /> Suggest slots</Button>
      {result && "missing" in result && <p className="mt-3 rounded-lg bg-warning/20 p-3 text-sm">Missing information: {result.missing.join(", ")}. The assistant won't guess, so fill these in and try again.</p>}
      {result && Array.isArray(result) && (
        <ul className="mt-4 space-y-3">
          {result.length === 0 && <li className="text-sm text-muted-foreground">No conflict-free slot found. Try a different room type or smaller class.</li>}
          {result.map((g, i) => (
            <li key={i} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <b>{s.roomName(g.schedule.roomId)} · {g.schedule.day} {fmtTime(g.schedule.start)}–{fmtTime(g.schedule.end)}</b>
                <Button size="sm" variant="secondary" onClick={() => { s.addSchedules([g.schedule]); setResult(result.filter((_, j) => j !== i)); }}>Add as proposal</Button>
              </div>
              <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">{g.explanation.map((x) => <li key={x}>{x}</li>)}</ul>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
