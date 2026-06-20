"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

// Client portal guard: only an authenticated client. Staff → console; nobody → login.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.subject_type === "user") router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.subject_type === "user") {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-4 py-3">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="glass-control inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-2">{children}</main>
    </div>
  );
}
