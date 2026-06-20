"use client";

import { useRouter } from "next/navigation";
import { LogOut, PanelLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand";
import { useAuth } from "@/components/auth/auth-provider";

// Floating top controls. Left: sidebar toggle (opens the drawer on mobile,
// collapses the sidebar on desktop) + mobile brand. Right: theme toggle and a
// mobile-only sign out.
export function TopBar({
  onToggleMobile,
  onToggleDesktop,
}: {
  onToggleMobile: () => void;
  onToggleDesktop: () => void;
}) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-3 pt-3">
      {/* Left: toggle + mobile brand */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <button
          onClick={onToggleMobile}
          aria-label="Open menu"
          className="glass-control inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onToggleDesktop}
          aria-label="Toggle sidebar"
          className="glass-control hidden h-9 w-9 items-center justify-center rounded-full text-foreground lg:inline-flex"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <BrandMark className="lg:hidden" />
      </div>

      <div className="flex flex-1 justify-center" />

      {/* Right: theme + mobile sign out */}
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="glass-control inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
