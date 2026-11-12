import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Building2, CalendarDays, ClipboardList, LayoutDashboard, LifeBuoy, TableProperties } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import { TODAY, USERS } from "@/lib/seed";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Spaces",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Find a Room", url: "/rooms", icon: Building2 },
      { title: "Class Schedules", url: "/schedules", icon: TableProperties },
    ],
  },
  {
    label: "Requests",
    items: [
      { title: "Reservations", url: "/reservations", icon: ClipboardList },
      { title: "Reports", url: "/reports", icon: LifeBuoy },
    ],
  },
  {
    label: "Campus",
    items: [
      { title: "Calendar & News", url: "/calendar", icon: CalendarDays },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
] as const;

/** Logo mark: a 2x2 room grid with one slot taken. Reads as "a room, booked". */
function Mark() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden>
      <rect width="36" height="36" rx="10" fill="oklch(0.47 0.13 250)" />
      <rect x="8" y="8" width="8.5" height="8.5" rx="2" fill="oklch(0.99 0.005 230 / 0.9)" />
      <rect x="19.5" y="8" width="8.5" height="8.5" rx="2" fill="oklch(0.99 0.005 230 / 0.9)" />
      <rect x="8" y="19.5" width="8.5" height="8.5" rx="2" fill="oklch(0.99 0.005 230 / 0.9)" />
      <rect x="19.5" y="19.5" width="8.5" height="8.5" rx="2" fill="oklch(0.68 0.13 170)" />
    </svg>
  );
}

function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 rounded-lg px-1 py-2" aria-label="CISC SpaceSync home">
          <Mark />
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <div className="font-display text-base font-semibold text-sidebar-foreground">CISC SpaceSync</div>
            <div className="text-xs text-sidebar-foreground/70">Rooms & faculty scheduling</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((n) => (
                  <SidebarMenuItem key={n.url}>
                    <SidebarMenuButton asChild isActive={path === n.url} tooltip={n.title} className="data-[active=true]:bg-sidebar-primary/20 data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--sidebar-primary)]">
                      <Link to={n.url}>
                        <n.icon className="h-4 w-4" />
                        <span>{n.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

const dateLabel = new Date(TODAY + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, notifications, me } = useStore();
  const unread = notifications.filter((n) => !n.read && (n.to === me || n.to === "all")).length;
  return (
    <SidebarProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground">
        Skip to content
      </a>
      <div className="flex min-h-screen w-full bg-background bg-page">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-3 backdrop-blur sm:px-4">
            <SidebarTrigger />
            <div className="hidden text-sm text-muted-foreground lg:block">{dateLabel}</div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">Viewing as</span>
                <div className="flex rounded-full border border-border bg-muted p-0.5 text-xs font-medium" role="radiogroup" aria-label="Demo role">
                  {(["student", "faculty", "admin"] as Role[]).map((r) => (
                    <button key={r} role="radio" aria-checked={role === r} onClick={() => setRole(r)} className={cn("rounded-full px-2.5 py-1.5 capitalize transition-colors sm:px-3", role === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted" aria-label={`Notifications, ${unread} unread`}>
                <Bell className="h-4 w-4" />
                {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">{unread}</span>}
              </Link>
              <div className="hidden items-center gap-2.5 border-l border-border pl-3 md:flex">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-bold text-primary-foreground">{me.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                <div className="leading-tight">
                  <div className="text-sm font-medium">{me}</div>
                  <div className="text-xs text-muted-foreground">{USERS[role].detail}</div>
                </div>
              </div>
            </div>
          </header>
          <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
