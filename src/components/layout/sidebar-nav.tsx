"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  PhoneCall,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

type NavItem = { href: string; label: string; icon: LucideIcon };

// Internal console navigation, focused on the PI intake workflow.
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/intake", label: "Intake", icon: PhoneCall },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Sidebar nav. The ACTIVE tab (by URL) renders as a liquid-glass button; the
// rest are plain links. onNavigate fires after a click (closes the mobile drawer).
export function SidebarNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      {NAV.map((item) => {
        const Icon = item.icon;
        // Highlight the section, including nested routes (e.g. /leads/ld_1001).
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (active) {
          return (
            <GlassButton
              key={item.href}
              size="sm"
              onClick={() => {
                router.push(item.href);
                onNavigate?.();
              }}
              className="w-full [&>button]:w-full"
              contentClassName="flex w-full items-center gap-3 !justify-start !px-4 text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </GlassButton>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
