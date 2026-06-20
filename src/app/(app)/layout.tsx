"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";

// Admin console guard: only authenticated staff (subject_type "user") get the
// shell. Unauthenticated → login; clients → their portal.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.subject_type === "client") router.replace("/portal");
  }, [user, loading, router]);

  if (loading || !user || user.subject_type === "client") {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AppShell userLabel={user.role ?? "admin"}>{children}</AppShell>;
}
