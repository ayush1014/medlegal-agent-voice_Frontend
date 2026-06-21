"use client";

// Dependency-free charts in the liquid-glass style: horizontal bars, a donut,
// and a weekly bar series. Each takes simple {label, value} data.

import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500",
  "bg-red-500", "bg-cyan-500", "bg-fuchsia-500", "bg-lime-500",
  "bg-orange-500", "bg-indigo-500", "bg-teal-500",
];
const HEX = [
  "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
  "#06b6d4", "#d946ef", "#84cc16", "#f97316", "#6366f1", "#14b8a6",
];

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BarList({ data, fmt }: {
  data: { label: string; value: number }[]; fmt?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground">{d.label}</span>
            <span className="font-mono tabular-nums text-muted-foreground">{fmt ? fmt(d.value) : d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className={cn("h-full rounded-full", PALETTE[i % PALETTE.length])}
                 style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Funnel: bars that taper, showing step-to-step conversion.
export function Funnel({ data }: { data: { label: string; value: number }[] }) {
  const top = Math.max(1, data[0]?.value ?? 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const pctOfTop = Math.round((d.value / top) * 100);
        const prev = i > 0 ? data[i - 1].value : d.value;
        const conv = prev > 0 ? Math.round((d.value / prev) * 100) : 0;
        return (
          <div key={d.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{d.label}</span>
              <span className="text-muted-foreground">
                <span className="font-mono tabular-nums text-foreground">{d.value}</span>
                {i > 0 ? <span className="ml-2">{conv}% of prev</span> : null}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
              <div className={cn("h-full rounded-full", PALETTE[i % PALETTE.length])} style={{ width: `${pctOfTop}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Donut via conic-gradient. Legend lists shares.
export function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  let acc = 0;
  const stops = data.map((d, i) => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    return `${HEX[i % HEX.length]} ${start}deg ${end}deg`;
  });
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(",")})` }}>
        <div className="absolute inset-[18%] flex items-center justify-center rounded-full bg-background">
          <span className="font-mono text-lg font-semibold text-foreground">{total}</span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEX[i % HEX.length] }} />
            <span className="text-foreground">{d.label}</span>
            <span className="text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Weekly vertical bars (lead volume over time).
export function WeeklyBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-t-md bg-sky-500/80" style={{ height: `${(d.value / max) * 100}%` }} title={`${d.value}`} />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
