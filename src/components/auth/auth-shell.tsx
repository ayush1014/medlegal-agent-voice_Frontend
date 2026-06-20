"use client";

import { GradientBackground } from "@/components/ui/gradient-background";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

// Shared full-page frame for auth screens: gradient backdrop, brand, theme toggle,
// and a centered column for the form.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen w-screen flex-col">
      <div className="fixed left-4 top-4 z-20 md:left-1/2 md:-translate-x-1/2">
        <BrandMark />
      </div>
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-card">
        <div className="absolute inset-0 z-0">
          <GradientBackground />
        </div>
        <div className="relative z-10 mx-auto w-[340px] p-4">{children}</div>
      </div>
    </div>
  );
}
