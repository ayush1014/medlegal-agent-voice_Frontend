"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Liquid-glass pill input (shares the .glass-input system in glass.css).
type Props = React.ComponentProps<"input"> & { icon?: React.ReactNode };

export const GlassInput = React.forwardRef<HTMLInputElement, Props>(
  ({ icon, className, ...props }, ref) => (
    <div className="glass-input-wrap w-full">
      <div className="glass-input">
        <span className="glass-input-text-area" />
        {icon ? (
          <div className="relative z-10 flex w-10 shrink-0 items-center justify-center pl-2 text-foreground/80">
            {icon}
          </div>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "relative z-10 h-full w-0 grow bg-transparent py-2.5 text-foreground placeholder:text-foreground/60 focus:outline-none",
            icon ? "pr-4" : "px-4",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  ),
);
GlassInput.displayName = "GlassInput";
