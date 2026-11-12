import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck, CircleCheck, CircleX, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Segmented } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · CISC SpaceSync" },
      { name: "description", content: "Reservation decisions, reminders and CISC announcements." },
      { property: "og:title", content: "Notifications · CISC SpaceSync" },
      { property: "og:description", content: "Reservation decisions, reminders and CISC announcements." },
    ],
  }),
  component: NotificationsPage,
});

/** Pick an icon from the wording of the title: approvals, cancellations, announcements, everything else. */
function kindOf(n: Notification) {
  const t = n.title.toLowerCase();
  if (t.includes("approved")) return { Icon: CircleCheck, tone: "bg-success/15 text-success" };
  if (t.includes("cancelled") || t.includes("not approved")) return { Icon: CircleX, tone: "bg-destructive/10 text-destructive" };
  if (t.includes("announcement") || n.to === "all") return { Icon: Megaphone, tone: "bg-accent text-accent-foreground" };
  return { Icon: Bell, tone: "bg-primary/10 text-primary" };
}

function NotificationsPage() {
  const s = useStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const mine = s.notifications.filter((n) => n.to === s.me || n.to === "all");
  const unread = mine.filter((n) => !n.read).length;
  const shown = filter === "unread" ? mine.filter((n) => !n.read) : mine;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Reservation decisions, end-of-booking reminders and CISC announcements."
        action={<Button variant="outline" size="sm" disabled={unread === 0} onClick={s.markAllRead}><CheckCheck className="h-4 w-4" />Mark all as read</Button>}
      />
      <div className="mb-4">
        <Segmented label="Show notifications" value={filter} onChange={setFilter} options={[{ value: "all", label: `All (${mine.length})` }, { value: "unread", label: `Unread (${unread})` }]} />
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={<Bell className="h-5 w-5" />} title={filter === "unread" ? "You're all caught up" : "No notifications yet"}>
          {filter === "unread" ? "New updates will show up here." : "You'll see reservation updates and announcements here."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {shown.map((n) => {
            const { Icon, tone } = kindOf(n);
            return (
              <li key={n.id} className={cn("flex items-start gap-3 p-4 sm:px-5", !n.read && "bg-primary/5")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tone)}><Icon className="h-4.5 w-4.5" aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="font-sans text-sm font-semibold">
                      {n.title}
                      {!n.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" aria-hidden />}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </h2>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  {n.to === "all" && <p className="mt-1 text-xs text-muted-foreground">Sent to everyone</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
