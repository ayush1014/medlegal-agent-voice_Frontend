import { cn } from "@/lib/utils";
import type {
  QualificationStatus,
  LeadTemperature,
  PipelineStatus,
  RetainerStatus,
} from "@/types/lead";

// Shared pill base. Uses ring-inset so badges read cleanly on the glass surface.
const PILL =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

const QUALIFICATION: Record<QualificationStatus, string> = {
  Qualified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  "Possibly Qualified": "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20",
  "Needs Review": "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  Unqualified: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
};

export function QualificationBadge({ status }: { status: QualificationStatus }) {
  return <span className={cn(PILL, QUALIFICATION[status])}>{status}</span>;
}

const TEMPERATURE: Record<LeadTemperature, { cls: string; dot: string }> = {
  Hot: { cls: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20", dot: "bg-red-500" },
  Warm: { cls: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20", dot: "bg-amber-500" },
  Low: { cls: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20", dot: "bg-sky-500" },
  "Poor Fit": { cls: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20", dot: "bg-zinc-400" },
};

export function TemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  const t = TEMPERATURE[temperature];
  return (
    <span className={cn(PILL, t.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {temperature}
    </span>
  );
}

// Pipeline stages grouped by intent: active = neutral, won = green, lost = red.
const PIPELINE: Record<PipelineStatus, string> = {
  "New Lead": "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-400/20",
  "Intake Started": "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-400/20",
  "Intake Complete": "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-400/20",
  Qualified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  "Needs Review": "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
  "Docs Requested": "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20",
  "Docs Received": "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20",
  "Retainer Ready": "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20",
  "Retainer Sent": "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20",
  Signed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  Rejected: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
  Closed: "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
};

export function PipelineBadge({ status }: { status: PipelineStatus }) {
  return <span className={cn(PILL, PIPELINE[status])}>{status}</span>;
}

const RETAINER: Record<RetainerStatus, string> = {
  "Not Ready": "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
  Ready: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-400/20",
  Sent: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20",
  Viewed: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20",
  Signed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  Declined: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
  Expired: "bg-zinc-100 text-zinc-500 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
};

export function RetainerBadge({ status }: { status: RetainerStatus }) {
  return <span className={cn(PILL, RETAINER[status])}>{status}</span>;
}

// Score chip: a compact 0–100 number tinted by temperature band.
export function ScoreChip({ score }: { score: number }) {
  const cls =
    score >= 80
      ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20"
      : score >= 60
        ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20"
        : score >= 40
          ? "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20"
          : "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20";
  return (
    <span className={cn(PILL, "font-mono tabular-nums", cls)}>{score}</span>
  );
}
