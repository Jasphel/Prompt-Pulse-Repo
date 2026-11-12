import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ClipboardList } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CapacityBar, EmptyState, PageHeader, Segmented, StatusBadge } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { blockReason, bumpedByFaculty, fmtTime, remainingCapacity, reminderTimes } from "@/lib/rules";
import type { Reservation } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations · CISC SpaceSync" },
      { name: "description", content: "Track room requests, or review and approve them with capacity and faculty-priority checks." },
      { property: "og:title", content: "Reservations · CISC SpaceSync" },
      { property: "og:description", content: "Track and approve CISC room requests." },
    ],
  }),
  component: ReservationsPage,
});

type Confirm = { title: string; body: string; run: () => void };

function ReservationsPage() {
  const s = useStore();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const isAdmin = s.role === "admin";
  const pendingCount = s.reservations.filter((r) => r.status === "pending").length;
  const list = (isAdmin ? s.reservations.filter((r) => tab === "all" || r.status === "pending") : s.reservations.filter((r) => r.requester === s.me)).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const active = list.filter((r) => r.status === "pending" || r.status === "approved");
  const closed = list.filter((r) => r.status === "rejected" || r.status === "cancelled");

  const approve = (r: Reservation) => {
    const bumped = r.role === "faculty" ? bumpedByFaculty(r, s.reservations) : [];
    if (bumped.length) setConfirm({ title: "Approve faculty reservation?", body: `This will cancel ${bumped.length} approved student reservation${bumped.length === 1 ? "" : "s"}: ${bumped.map((b) => `${b.requester} (${fmtTime(b.start)}–${fmtTime(b.end)})`).join(", ")}. They'll be notified with alternative rooms.`, run: () => s.decideReservation(r.id, true) });
    else s.decideReservation(r.id, true);
  };

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Room requests" : "My reservations"}
        subtitle={isAdmin ? "Approve only when capacity allows. Faculty bookings take priority over student bookings." : "Requests need admin approval, so submit early to leave time for review."}
        action={!isAdmin && <Button asChild><Link to="/rooms">New request</Link></Button>}
      />
      {isAdmin && (
        <div className="mb-5">
          <Segmented label="Show requests" value={tab} onChange={setTab} options={[{ value: "pending", label: `Needs review (${pendingCount})` }, { value: "all", label: "All requests" }]} />
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-5 w-5" />} title={isAdmin ? "No requests waiting for review" : "No reservations yet"}>
          {isAdmin ? "New student and faculty requests show up here." : "Find a room that fits your group and send a request."}
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section aria-label={isAdmin ? "Requests" : "Active reservations"}>
              {!isAdmin && <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Active</h2>}
              <ul className="grid gap-4 md:grid-cols-2">{active.map((r) => <ReservationCard key={r.id} r={r} onApprove={approve} onConfirm={setConfirm} />)}</ul>
            </section>
          )}
          {closed.length > 0 && (
            <section aria-label="Closed reservations">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Rejected or cancelled</h2>
              <ul className="grid gap-4 md:grid-cols-2">{closed.map((r) => <ReservationCard key={r.id} r={r} onApprove={approve} onConfirm={setConfirm} />)}</ul>
            </section>
          )}
        </div>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{confirm?.title}</AlertDialogTitle><AlertDialogDescription>{confirm?.body}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Go back</AlertDialogCancel><AlertDialogAction onClick={() => { confirm?.run(); setConfirm(null); }}>Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReservationCard({ r, onApprove, onConfirm }: { r: Reservation; onApprove: (r: Reservation) => void; onConfirm: (c: Confirm) => void }) {
  const s = useStore();
  const isAdmin = s.role === "admin";
  const room = s.rooms.find((x) => x.id === r.roomId)!;
  const left = remainingCapacity(room, r.date, r.start, r.end, s.reservations, r.id);
  const block = blockReason(r.roomId, r.date, r.start, r.end, s.schedules, s.events);
  const fits = r.role === "faculty" || r.people <= left;
  const [m1, m2] = reminderTimes(r.end);
  const d = new Date(r.date + "T00:00");
  const closed = r.status === "rejected" || r.status === "cancelled";

  return (
    <li className={cn("rounded-xl border border-border bg-card p-4 shadow-card", closed && "bg-muted/40")}>
      <div className="flex items-start gap-3">
        <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-lg text-center", closed ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")} aria-hidden>
          <div>
            <div className="text-[10px] font-medium leading-none">{d.toLocaleString("en", { month: "short" })}</div>
            <div className="mt-0.5 font-display text-xl font-bold leading-none">{d.getDate()}</div>
            <div className="mt-0.5 text-[10px] leading-none opacity-80">{d.toLocaleString("en", { weekday: "short" })}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-semibold leading-snug">{room.name} · {r.purpose}</h3>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{fmtTime(r.start)}–{fmtTime(r.end)} · {r.people} {r.people === 1 ? "person" : "people"}</p>
          <p className="mt-1 text-xs">
            <span className={r.role === "faculty" ? "font-semibold text-primary" : "font-medium"}>{r.requester}</span>
            <span className="text-muted-foreground"> · {r.role}{r.role === "faculty" && " (priority)"}</span>
          </p>
        </div>
      </div>

      {r.note && <p className="mt-3 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">{r.note}</p>}
      {r.status === "approved" && <p className="mt-3 rounded-lg bg-accent p-2.5 text-xs text-accent-foreground">You'll get reminders at {fmtTime(m1)} and {fmtTime(m2)}. Clean as you go (CLAYGO) and leave on time, since overstays are reported to the Registrar.</p>}

      {isAdmin && r.status === "pending" && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {r.role === "student" && (
            <div className="text-xs">
              <div className="mb-1.5 flex justify-between gap-2"><span className="font-medium">Capacity check</span><span className={fits ? "text-success" : "text-destructive"}>{fits ? "Fits" : "Over capacity"} · {left} of {room.capacity} seats free</span></div>
              <CapacityBar used={room.capacity - left + r.people} total={room.capacity} />
            </div>
          )}
          {block && <p className="flex items-start gap-1.5 text-xs text-destructive"><AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />Conflicts with {block}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={!fits || !!block} onClick={() => onApprove(r)}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => s.decideReservation(r.id, false)}>Reject</Button>
          </div>
        </div>
      )}
      {!isAdmin && (r.status === "pending" || r.status === "approved") && (
        <Button size="sm" variant="outline" className="mt-4" onClick={() => onConfirm({ title: "Cancel this reservation?", body: `${room.name} on ${r.date}, ${fmtTime(r.start)}–${fmtTime(r.end)}. This can't be undone.`, run: () => s.cancelReservation(r.id) })}>Cancel request</Button>
      )}
    </li>
  );
}
