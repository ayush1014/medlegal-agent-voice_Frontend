"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { GradientBackground } from "@/components/ui/gradient-background";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

// Public landing: a plain-language "which door are you?" chooser.
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.subject_type === "client" ? "/portal" : "/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-dvh w-screen flex-col">
      <div className="fixed left-4 top-4 z-20">
        <BrandMark />
      </div>
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-card px-4">
        <div className="absolute inset-0 z-0">
          <GradientBackground />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium text-muted-foreground">
              Choose the option that describes you to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChooserCard
              href="/client"
              icon={<HeartPulse className="h-6 w-6" />}
              title="I'm a Client"
              subtitle="Injured and seeking help."
            />
            <ChooserCard
              href="/login"
              icon={<Building2 className="h-6 w-6" />}
              title="I'm with a Law Firm"
              subtitle="Attorney, paralegal or staff."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChooserCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card glass-card-hover group flex flex-col items-start gap-4 rounded-3xl p-6 transition active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 text-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 transition group-hover:gap-2 group-hover:text-foreground">
        Continue <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
