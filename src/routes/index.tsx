import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, Building2, CalendarDays, ClipboardList, LifeBuoy, Sparkles, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CapacityBar, EmptyState, laneStyle, Panel, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { dayOf, fmtTime, rankRooms, remainingCapacity, scheduleConflicts } from "@/lib/rules";
import { TODAY } from "@/lib/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CISC SpaceSync" },
      { name: "description", content: "Today's classes, room availability, reservations and announcements for CISC." },
      { property: "og:title", content: "Dashboard · CISC SpaceSync" },
      { property: "og:description", content: "Today's classes, room availability, reservations and announcements for CISC." },
    ],
  }),
  component: Dashboard,
});

const NOW = 10 * 60 + 30;

function Dashboard() {
  const s = useStore();
  const today = dayOf(TODAY);
  const isAdmin = s.role === "admin";
  const official = s.schedules.filter((c) => c.status === "official" && c.day === today);
  const classesToday = official.filter((c) => (s.role !== "faculty" || c.faculty === s.me) && (s.role !== "student" || c.section === "BSCS 3-A")).sort((a, b) => a.start - b.start);
  const shownClasses = isAdmin ? [...official].sort((a, b) => a.start - b.start) : classesToday;
  const mine = s.reservations.filter((r) => r.requester === s.me);
  const pending = s.reservations.filter((r) => r.status === "pending");
  const upcoming = s.events.filter((e) => e.status === "published").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const recs = rankRooms(s.rooms, { date: TODAY, start: NOW, end: NOW + 60, people: 5 }, s.schedules, s.events, s.reservations).slice(0, 3);
  const conflicts = scheduleConflicts(s.schedules, s.rooms);
  const bumped = s.reservations.filter((r) => r.note?.startsWith("Replaced by faculty"));
  const openReports = s.reports.filter((r) => !["Resolved", "Returned / Closed"].includes(r.status));
  const myReports = s.reports.filter((r) => r.reporter === s.me);
  const notes = s.notifications.filter((n) => n.to === s.me || n.to === "all").slice(0, 3);
  const name = s.role === "student" ? s.me.split(" ")[0] : s.me;
  const next = shownClasses.find((c) => c.end > NOW);

  return (
    <div className="space-y-6">
      {/* Greeting + primary actions */}
      <section className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold md:text-4xl">Good morning, {name}</h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {isAdmin
              ? `${pending.length} room request${pending.length === 1 ? "" : "s"} waiting for review, ${conflicts.length} schedule issue${conflicts.length === 1 ? "" : "s"} flagged.`
              : next
                ? `Next up: ${next.course} in ${s.roomName(next.roomId)} at ${fmtTime(next.start)}.`
                : "No more classes today. Find a room if you need a place to work."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <Button asChild><Link to="/reservations">Review requests</Link></Button>
              <Button asChild variant="outline"><Link to="/schedules">Scheduling assistant</Link></Button>
              <Button asChild variant="outline"><Link to="/calendar">Publish an event</Link></Button>
            </>
          ) : (
            <>
              <Button asChild><Link to="/rooms">Find a room</Link></Button>
              <Button asChild variant="outline"><Link to="/reservations">My requests</Link></Button>
              <Button asChild variant="outline"><Link to="/reports">Report an issue</Link></Button>
            </>
          )}
        </div>
      </section>

      {isAdmin && (
        <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card md:grid-cols-4 md:divide-x">
          <Stat icon={<Building2 className="h-4 w-4" />} label="Rooms" value={s.rooms.length} />
          <Stat icon={<ClipboardList className="h-4 w-4" />} label="Pending requests" value={pending.length} alert={pending.length > 0} />
          <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Schedule conflicts" value={conflicts.length} alert={conflicts.length > 0} />
          <Stat icon={<LifeBuoy className="h-4 w-4" />} label="Open reports" value={openReports.length} />
        </dl>
      )}

      <DayTimeline />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title={s.role === "faculty" ? "Today's teaching" : isAdmin ? "Classes today" : "Today's classes"} icon={<TableProperties className="h-4 w-4" />}>
            {shownClasses.length === 0 ? (
              <EmptyState icon={<TableProperties className="h-5 w-5" />} title="No classes today">Enjoy the free time, or book a room for a group session.</EmptyState>
            ) : (
              <ul className="divide-y divide-border">
                {shownClasses.map((c) => {
                  const done = c.end <= NOW;
                  const live = c.start <= NOW && NOW < c.end;
                  return (
                    <li key={c.id} className={cn("flex items-stretch gap-3 py-3", done && "opacity-55")}>
                      <div className="w-1 shrink-0 rounded-full" style={{ background: laneStyle(c.course).borderLeftColor as string }} aria-hidden />
                      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="truncate">{c.course}</span>
                            {live && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">In session</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.section} · {c.faculty}</div>
                        </div>
                        <div className="text-sm sm:text-right">
                          <div className="font-medium text-primary">{s.roomName(c.roomId)}</div>
                          <div className="text-xs tabular-nums text-muted-foreground">{fmtTime(c.start)} – {fmtTime(c.end)}</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {isAdmin ? (
            <Panel title="Pending room requests" icon={<ClipboardList className="h-4 w-4" />} action={<Link to="/reservations" className="text-sm font-medium text-primary hover:underline">Review all</Link>}>
              <ResList list={pending} empty="No requests waiting for review." />
            </Panel>
          ) : (
            <Panel title="My room requests" icon={<ClipboardList className="h-4 w-4" />} action={<Link to="/reservations" className="text-sm font-medium text-primary hover:underline">View all</Link>}>
              <ResList list={mine} empty="You haven't requested a room yet. Find a room to get started." />
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Seats left right now" icon={<Building2 className="h-4 w-4" />}>
            <ul className="space-y-3.5">
              {s.rooms.slice(0, 5).map((r) => {
                const left = remainingCapacity(r, TODAY, NOW, NOW + 30, s.reservations);
                return (
                  <li key={r.id}>
                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{r.name}</span><span className="tabular-nums text-muted-foreground">{left} of {r.capacity}</span></div>
                    <CapacityBar used={r.capacity - left} total={r.capacity} />
                  </li>
                );
              })}
            </ul>
          </Panel>

          {s.role === "student" ? (
            <Panel title="Good fits for your group" icon={<Sparkles className="h-4 w-4" />}>
              <ul className="space-y-2">
                {recs.map((r) => (
                  <li key={r.room.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3 text-sm">
                    <div className="min-w-0"><div className="font-medium">{r.room.name}</div><div className="text-xs text-muted-foreground">{r.room.type} · {r.remaining} seats left</div></div>
                    {r.available ? <StatusBadge status="approved" /> : <span className="text-right text-xs text-muted-foreground">{r.reason}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Suggestions don't reserve a room. Requests still need approval.</p>
            </Panel>
          ) : isAdmin ? (
            <Panel title="Needs attention" icon={<AlertTriangle className="h-4 w-4" />}>
              <ul className="space-y-2 text-sm">
                {conflicts.slice(0, 3).map((c, i) => <li key={i} className="rounded-lg bg-destructive/10 p-3 text-destructive">{c.message}</li>)}
                {bumped.length > 0 && <li className="rounded-lg bg-warning/20 p-3">{bumped.length} student reservation{bumped.length === 1 ? "" : "s"} replaced by faculty bookings.</li>}
                {conflicts.length === 0 && bumped.length === 0 && <li className="text-muted-foreground">All clear. Nothing needs your attention.</li>}
              </ul>
            </Panel>
          ) : null}

          <Panel title="Upcoming events" icon={<CalendarDays className="h-4 w-4" />} action={<Link to="/calendar" className="text-sm font-medium text-primary hover:underline">Calendar</Link>}>
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-accent text-center text-accent-foreground">
                    <div>
                      <div className="text-[10px] font-medium leading-none">{new Date(e.date + "T00:00").toLocaleString("en", { month: "short" })}</div>
                      <div className="mt-0.5 font-display text-lg font-bold leading-none">{e.date.slice(8)}</div>
                    </div>
                  </div>
                  <div className="min-w-0 text-sm"><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{e.scope === "all" ? "All CISC rooms closed" : e.roomIds.map(s.roomName).join(", ")}</div></div>
                </li>
              ))}
              {upcoming.length === 0 && <li className="text-sm text-muted-foreground">No events announced yet.</li>}
            </ul>
          </Panel>

          {s.role !== "faculty" && (
            <Panel title={isAdmin ? "Reports to handle" : "My reports"} icon={<LifeBuoy className="h-4 w-4" />}>
              <ReportList list={isAdmin ? openReports : myReports} />
            </Panel>
          )}

          <Panel title="Notifications" icon={<Bell className="h-4 w-4" />} action={<Link to="/notifications" className="text-sm font-medium text-primary hover:underline">See all</Link>}>
            <ul className="space-y-3 text-sm">
              {notes.map((n) => <li key={n.id}><div className="font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div></li>)}
              {notes.length === 0 && <li className="text-muted-foreground">You're all caught up.</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------- Today across CISC: rooms × hours ---------- */

const T0 = 7 * 60;
const T1 = 19 * 60;
const SPAN = T1 - T0;
const HOUR_MARKS = Array.from({ length: 13 }, (_, i) => 7 + i);
const LANE_H = 30;
const pct = (m: number) => `${((Math.min(Math.max(m, T0), T1) - T0) / SPAN) * 100}%`;

interface Block { id: string; start: number; end: number; label: string; title: string; kind: "class" | "reserved" | "event"; key: string; lane: number }

function DayTimeline() {
  const s = useStore();
  const today = dayOf(TODAY);

  const rows = s.rooms.map((room) => {
    const raw: Omit<Block, "lane">[] = [
      ...s.schedules
        .filter((c) => c.status === "official" && c.roomId === room.id && c.day === today)
        .map((c) => ({ id: c.id, start: c.start, end: c.end, label: c.course, title: `${c.course} · ${c.section} · ${c.faculty}, ${fmtTime(c.start)} to ${fmtTime(c.end)}`, kind: "class" as const, key: c.course })),
      ...s.reservations
        .filter((r) => r.status === "approved" && r.roomId === room.id && r.date === TODAY)
        .map((r) => ({ id: r.id, start: r.start, end: r.end, label: r.purpose, title: `Reserved: ${r.purpose} · ${r.requester}, ${fmtTime(r.start)} to ${fmtTime(r.end)}`, kind: "reserved" as const, key: r.purpose })),
      ...s.events
        .filter((e) => e.status === "published" && e.date === TODAY && (e.scope === "all" || e.roomIds.includes(room.id)))
        .map((e) => ({ id: e.id, start: e.start, end: e.end, label: e.title, title: `${e.title}, ${fmtTime(e.start)} to ${fmtTime(e.end)}`, kind: "event" as const, key: e.title })),
    ].sort((a, b) => a.start - b.start);

    // Greedy lane packing so overlapping reservations sit on separate lines.
    const laneEnds: number[] = [];
    const blocks: Block[] = raw.map((b) => {
      let lane = laneEnds.findIndex((end) => end <= b.start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = b.end;
      return { ...b, lane };
    });
    return { room, blocks, height: Math.max(1, laneEnds.length) * LANE_H + 10 };
  });

  return (
    <Panel title="Today across CISC" icon={<Building2 className="h-4 w-4" />} flush action={<Legend />}>
      <div className="overflow-x-auto">
        <div className="flex min-w-[820px]">
          {/* Room labels stay put when the timeline scrolls sideways on small screens. */}
          <div className="sticky left-0 z-10 w-28 shrink-0 bg-card">
            <div className="h-8" />
            {rows.map(({ room, height }) => (
              <div key={room.id} className="flex flex-col justify-center border-t border-border pl-5 pr-2" style={{ height }}>
                <div className="truncate text-sm font-medium">{room.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">{room.type}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 pr-5">
           <div className="relative">
            {HOUR_MARKS.map((h) => (
              <div key={h} className="absolute inset-y-0 border-l border-border/70" style={{ left: pct(h * 60) }}>
                <span className="absolute left-1 top-2 text-[10px] tabular-nums text-muted-foreground">{fmtTime(h * 60).replace(":00 ", " ")}</span>
              </div>
            ))}
            <div className="h-8" />
            {rows.map(({ room, blocks, height }) => (
              <div key={room.id} className="relative border-t border-border" style={{ height }}>
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    title={b.title}
                    role="img"
                    aria-label={b.title}
                    className={cn(
                      "absolute overflow-hidden whitespace-nowrap rounded-md px-1.5 text-[11px] font-medium leading-[26px]",
                      b.kind === "class" && "border-l-[3px] text-foreground",
                      b.kind === "reserved" && "hatch border border-dashed border-primary/50 bg-card text-primary",
                      b.kind === "event" && "hatch border border-warning/60 bg-warning/20 text-warning-foreground",
                    )}
                    style={{ left: pct(b.start), width: `${((Math.min(b.end, T1) - Math.max(b.start, T0)) / SPAN) * 100}%`, top: 5 + b.lane * LANE_H, height: LANE_H - 4, ...(b.kind === "class" ? laneStyle(b.key) : {}) }}
                  >
                    {b.label}
                  </div>
                ))}
              </div>
            ))}
            {/* Current time */}
            <div className="pointer-events-none absolute inset-y-0 z-[2] w-px bg-destructive" style={{ left: pct(NOW) }} aria-hidden>
              <span className="absolute left-1/2 top-0.5 -translate-x-1/2 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-destructive-foreground">{fmtTime(NOW).replace(" ", "")}</span>
            </div>
           </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-l-[3px] border-primary bg-primary/15" />Class</span>
      <span className="flex items-center gap-1.5"><span className="hatch h-3 w-3 rounded-sm border border-dashed border-primary/50 text-primary" />Reserved</span>
      <span className="flex items-center gap-1.5"><span className="hatch h-3 w-3 rounded-sm border border-warning/60 bg-warning/20 text-warning-foreground" />Event</span>
    </div>
  );
}

/* ---------- Small pieces ---------- */

function Stat({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: number; alert?: boolean }) {
  return (
    <div className="p-4 md:px-6">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground"><span className="text-primary">{icon}</span>{label}</dt>
      <dd className={cn("mt-1 font-display text-3xl font-semibold tabular-nums", alert && "text-destructive")}>{value}</dd>
    </div>
  );
}

function ResList({ list, empty }: { list: ReturnType<typeof useStore>["reservations"]; empty: string }) {
  const s = useStore();
  if (!list.length) return <EmptyState icon={<ClipboardList className="h-5 w-5" />} title={empty} />;
  return (
    <ul className="divide-y divide-border">
      {list.slice(0, 5).map((r) => (
        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <div className="min-w-0"><div className="font-medium">{s.roomName(r.roomId)} · {r.purpose}</div><div className="text-xs text-muted-foreground">{r.date} · {fmtTime(r.start)}–{fmtTime(r.end)} · {r.people} people · {r.requester}</div></div>
          <StatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}

function ReportList({ list }: { list: ReturnType<typeof useStore>["reports"] }) {
  if (!list.length) return <p className="text-sm text-muted-foreground">No reports to show.</p>;
  return (
    <ul className="space-y-2.5 text-sm">
      {list.slice(0, 4).map((r) => <li key={r.id} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate">{r.title}</span><StatusBadge status={r.status} /></li>)}
    </ul>
  );
}
