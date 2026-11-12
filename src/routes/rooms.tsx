import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Accessibility, Building2, SearchX, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CapacityBar, EmptyState, Field, inputCls, laneStyle, PageHeader, Panel, Segmented, Stepper, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { DAYS, fmtTime, parseTime, rankRooms, type RankedRoom } from "@/lib/rules";
import { TODAY } from "@/lib/seed";
import type { Room } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Find a Room · CISC SpaceSync" },
      { name: "description", content: "Filter and get ranked room recommendations by time, capacity, equipment and accessibility." },
      { property: "og:title", content: "Find a Room · CISC SpaceSync" },
      { property: "og:description", content: "Filter and get ranked room recommendations for CISC rooms." },
    ],
  }),
  component: RoomsPage,
});

const EQUIP = ["Projector", "TV Display", "Computers", "Aircon", "Whiteboard", "Sound System", "Video Conferencing"];
const TYPES = [
  { value: "", label: "Any" },
  { value: "Lecture", label: "Lecture" },
  { value: "Computer Lab", label: "Computer lab" },
  { value: "Conference", label: "Conference" },
  { value: "Studio", label: "Studio" },
];
const BUILDINGS = [
  { value: "", label: "Any" },
  { value: "Main Bldg", label: "Main Bldg" },
  { value: "Annex", label: "Annex" },
];

function RoomsPage() {
  const s = useStore();
  const [date, setDate] = useState(TODAY);
  const [start, setStart] = useState("13:00");
  const [end, setEnd] = useState("15:00");
  const [people, setPeople] = useState(5);
  const [type, setType] = useState("");
  const [building, setBuilding] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [open, setOpen] = useState<RankedRoom | null>(null);
  const sm = parseTime(start), em = parseTime(end);
  const invalid = em <= sm;
  const ranked = invalid ? [] : rankRooms(s.rooms, { date, start: sm, end: em, people, type, building, accessible, equipment }, s.schedules, s.events, s.reservations);
  const freeCount = ranked.filter((r) => r.available).length;
  const filtered = type !== "" || building !== "" || accessible || equipment.length > 0;
  const reset = () => { setType(""); setBuilding(""); setAccessible(false); setEquipment([]); };

  return (
    <div>
      <PageHeader title="Find a room" subtitle="Rooms are ranked by availability and best fit for your group. Suggestions don't reserve a room, so you still need approval." />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Panel title="Your needs" className="h-fit lg:sticky lg:top-24" action={filtered ? <button type="button" onClick={reset} className="text-xs font-medium text-primary hover:underline">Clear filters</button> : undefined}>
          <div className="grid gap-5">
            <Field label="Date"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From"><input type="time" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} aria-invalid={invalid} /></Field>
                <Field label="To"><input type="time" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={invalid} /></Field>
              </div>
              {invalid && <p role="alert" className="mt-2 text-xs text-destructive">End time must be after the start time.</p>}
            </div>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">Number of people</span>
              <Stepper label="Number of people" value={people} onChange={setPeople} />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Room type</span>
              <Segmented label="Room type" value={type} onChange={setType} options={TYPES} />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Building</span>
              <Segmented label="Building" value={building} onChange={setBuilding} options={BUILDINGS} />
            </div>
            <fieldset className="grid gap-2 text-sm">
              <legend className="mb-1 font-medium">Equipment</legend>
              <div className="flex flex-wrap gap-1.5">
                {EQUIP.map((e) => {
                  const on = equipment.includes(e);
                  return (
                    <button key={e} type="button" aria-pressed={on} onClick={() => setEquipment(on ? equipment.filter((x) => x !== e) : [...equipment, e])} className={cn("h-8 rounded-lg border px-3 text-xs font-medium transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
                      {on ? "✓ " : ""}{e}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
              <label htmlFor="accessible-only" className="flex items-center gap-2 text-sm"><Accessibility className="h-4 w-4 text-primary" />Wheelchair accessible only</label>
              <Switch id="accessible-only" checked={accessible} onCheckedChange={setAccessible} />
            </div>
          </div>
        </Panel>

        <div>
          {!invalid && (
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold text-foreground">{freeCount} of {ranked.length} rooms</span> can take {people} {people === 1 ? "person" : "people"} on {new Date(date + "T00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, {fmtTime(sm)} to {fmtTime(em)}.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ranked.map((r, i) => {
              const best = r.available && i === 0;
              return (
                <button
                  key={r.room.id}
                  onClick={() => setOpen(r)}
                  aria-label={`${r.room.name}, ${r.available ? "available" : "unavailable"}. View details`}
                  className={cn(
                    "group relative flex flex-col rounded-xl border bg-card p-4 pl-5 text-left shadow-card transition hover:border-primary/50 hover:shadow-md",
                    best ? "border-secondary ring-1 ring-secondary/50" : "border-border",
                    !r.available && "bg-muted/40",
                  )}
                >
                  <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", r.available ? "bg-success" : "bg-destructive/60")} aria-hidden />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {best && <div className="mb-0.5 text-xs font-semibold text-secondary">Best match</div>}
                      <h3 className="truncate text-lg font-semibold">{r.room.name}</h3>
                      <p className="text-xs text-muted-foreground">{r.room.building} · Floor {r.room.floor} · {r.room.type}</p>
                    </div>
                    {r.room.accessible && <Accessibility className="mt-1 h-4 w-4 shrink-0 text-primary" aria-label="Wheelchair accessible" />}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-4 w-4" /><span className="tabular-nums">{r.remaining} of {r.room.capacity}</span> seats free</span>
                    <StatusBadge status={r.available ? "approved" : "cancelled"} />
                  </div>
                  <div className="mt-2"><CapacityBar used={r.room.capacity - r.remaining} total={r.room.capacity} /></div>
                  <p className={cn("mt-3 text-xs", r.available ? "text-muted-foreground" : "font-medium text-destructive")}>{r.available ? "Available for your group" : r.reason ?? `Only ${r.remaining} seats left`}</p>
                  <div className="mt-3 flex flex-wrap gap-1">{r.room.equipment.map((e) => <span key={e} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{e}</span>)}</div>
                </button>
              );
            })}
          </div>
          {!invalid && ranked.length === 0 && (
            <EmptyState icon={<SearchX className="h-5 w-5" />} title="No rooms match these filters">
              Try removing some equipment or switching the building to Any.
            </EmptyState>
          )}
          {invalid && <EmptyState icon={<Building2 className="h-5 w-5" />} title="Set a valid time range">Pick an end time that is after the start time to see rooms.</EmptyState>}
        </div>
      </div>
      {open && <RoomDialog r={open} date={date} start={sm} end={em} people={people} onClose={() => setOpen(null)} />}
    </div>
  );
}

function RoomDialog({ r, date, start, end, people, onClose }: { r: RankedRoom; date: string; start: number; end: number; people: number; onClose: () => void }) {
  const s = useStore();
  const room: Room = r.room;
  const [purpose, setPurpose] = useState("");
  const [step, setStep] = useState<"view" | "review">("view");
  const classes = s.schedules.filter((c) => c.roomId === room.id && c.status === "official").sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start - b.start);
  const resv = s.reservations.filter((x) => x.roomId === room.id && x.date === date && x.status === "approved");
  const canRequest = s.role !== "admin" && (r.available || (s.role === "faculty" && !r.reason));
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{room.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[room.building, `Floor ${room.floor}`, room.type, `Seats ${room.capacity}`, room.accessible ? "Wheelchair accessible" : "Stairs only"].map((c) => (
            <span key={c} className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">{c}</span>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Weekly class schedule</h4>
            <ul className="space-y-1.5 text-xs">
              {classes.map((c) => (
                <li key={c.id} className="rounded-lg border-l-[3px] p-2" style={laneStyle(c.course)}>
                  <div className="font-semibold">{c.day} · {fmtTime(c.start)}–{fmtTime(c.end)}</div>
                  <div>{c.course} · {c.section}</div>
                  <div className="text-muted-foreground">{c.faculty}</div>
                </li>
              ))}
              {!classes.length && <li className="text-muted-foreground">No official classes in this room.</li>}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Approved reservations on {date}</h4>
            <ul className="space-y-1.5 text-xs">
              {resv.map((x) => <li key={x.id} className="rounded-lg bg-muted p-2">{fmtTime(x.start)}–{fmtTime(x.end)} · {x.people} people{x.role === "faculty" && " · faculty"}</li>)}
              {!resv.length && <li className="text-muted-foreground">None yet for this day.</li>}
            </ul>
            <h4 className="mb-2 mt-5 text-sm font-semibold">Room rules</h4>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">{room.rules.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
        {canRequest && (
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            {step === "view" ? (
              <div className="grid gap-3">
                <Field label="What will you use the room for?"><input className={inputCls} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Thesis group meeting" /></Field>
                <Button disabled={!purpose.trim()} onClick={() => setStep("review")}>Review request</Button>
              </div>
            ) : (
              <div className="grid gap-3 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-muted-foreground">Room</dt><dd className="font-medium">{room.name}</dd>
                  <dt className="text-muted-foreground">When</dt><dd className="font-medium">{date}, {fmtTime(start)}–{fmtTime(end)}</dd>
                  <dt className="text-muted-foreground">Group</dt><dd className="font-medium">{people} {people === 1 ? "person" : "people"}</dd>
                  <dt className="text-muted-foreground">Purpose</dt><dd className="font-medium">{purpose}</dd>
                </dl>
                {s.role === "faculty" && <p className="text-xs text-muted-foreground">Faculty priority: once approved, overlapping student reservations are cancelled and the students are notified.</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("view")}>Back</Button>
                  <Button onClick={() => { s.requestReservation({ roomId: room.id, date, start, end, people, purpose }); onClose(); }}>Submit request</Button>
                </div>
              </div>
            )}
          </div>
        )}
        {!canRequest && s.role !== "admin" && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">This room can't take your group at that time. Pick another time or room.</p>}
      </DialogContent>
    </Dialog>
  );
}
