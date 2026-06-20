import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

// Product identity in one place so auth, sidebar and top bar stay consistent.
export const BRAND_NAME = "MedLegal Intake";

// Square logo tile. `size` controls the tile; the icon scales with it.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md bg-primary text-primary-foreground",
        className ?? "h-7 w-7",
      )}
    >
      <Scale className="h-4 w-4" />
    </div>
  );
}

// Logo + wordmark lockup.
export function BrandMark({
  className,
  nameClassName,
}: {
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrandLogo />
      <span
        className={cn(
          "text-sm font-semibold tracking-tight text-foreground",
          nameClassName,
        )}
      >
        {BRAND_NAME}
      </span>
    </div>
  );
}
