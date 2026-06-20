"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandMark } from "@/components/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

// Nav + account/sign-out — shared by the desktop sidebar and the mobile drawer.
function SidebarBody({
  userLabel,
  onNavigate,
}: {
  userLabel: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const initials = (userLabel.slice(0, 2) || "ME").toUpperCase();

  const handleSignOut = async () => {
    onNavigate?.();
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <SidebarNav className="mt-6" onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
            {initials}
          </div>
          <span className="truncate text-xs capitalize text-muted-foreground">{userLabel}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

// Floating glass shell. Sidebar collapses on desktop (≥ lg) and becomes a
// slide-in drawer on phones/tablets. Only the right content panel scrolls.
export function AppShell({
  userLabel,
  children,
}: {
  userLabel: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false); // desktop
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile drawer backdrop — OUTSIDE the layout row so it can't affect it */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-50 flex w-64 flex-col rounded-3xl glass-panel p-4 shadow-2xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-[-130%]",
        )}
      >
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarBody userLabel={userLabel} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Layout row: desktop sidebar + content (only in-flow items) */}
      <div className="flex h-dvh w-full">
        {/* Desktop sidebar — collapsible (≥ lg only) */}
        <aside
          className={cn(
            "my-3 hidden shrink-0 flex-col rounded-3xl glass-panel transition-all duration-300 lg:flex",
            collapsed ? "ml-0 w-0 overflow-hidden p-0 opacity-0" : "ml-3 w-60 p-4",
          )}
        >
          <BrandMark />
          <SidebarBody userLabel={userLabel} />
        </aside>

        {/* Right content panel — full width on mobile; only this scrolls */}
        <div className="relative min-w-0 flex-1">
          <main className="h-full overflow-y-auto px-4 pb-4 pt-[4.25rem] lg:pl-3 lg:pr-4">
            {children}
          </main>

          <TopBar
            onToggleMobile={() => setMobileOpen(true)}
            onToggleDesktop={() => setCollapsed((c) => !c)}
          />
        </div>
      </div>
    </div>
  );
}
