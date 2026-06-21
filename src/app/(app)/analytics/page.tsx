"use client";

import { useEffect, useState } from "react";
import {
  Users, BadgeCheck, Flame, FileSignature, Gauge, DollarSign, Wallet, TrendingUp, Loader2,
} from "lucide-react";
import { getAnalytics } from "@/lib/api";
import type { Analytics } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard, BarList, Funnel, Donut, WeeklyBars } from "@/components/analytics/charts";
import { fmtCurrency } from "@/lib/format";

const compactUsd = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : fmtCurrency(n);

const weekLabel = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AnalyticsPage() {
  const [a, setA] = useState<Analytics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAnalytics().then(setA).catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">Couldn&apos;t load analytics.</p>
      </div>
    );
  }
  if (!a) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const stats = [
    { label: "Total leads", value: String(a.totals.leads), icon: Users, sub: "All time" },
    { label: "Qualified", value: String(a.totals.qualified), icon: BadgeCheck, sub: "Viable cases" },
    { label: "Hot leads", value: String(a.totals.hot), icon: Flame, sub: "Top priority" },
    { label: "Signed", value: String(a.totals.signed), icon: FileSignature, sub: "Converted" },
    { label: "Avg score", value: String(a.totals.avg_score), icon: Gauge, sub: "Across firm" },
    { label: "Pipeline value", value: compactUsd(a.settlement.pipeline_value), icon: DollarSign, sub: "Est. settlements" },
    { label: "Avg qualified", value: compactUsd(a.settlement.avg_qualified), icon: Wallet, sub: "Per qualified lead" },
    { label: "Signed value", value: compactUsd(a.settlement.signed_value), icon: TrendingUp, sub: "Retained cases" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Intake funnel, lead quality, and pipeline value across the firm.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} />)}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Conversion funnel">
          <Funnel data={a.funnel.map((f) => ({ label: f.stage, value: f.count }))} />
        </ChartCard>
        <ChartCard title="Weekly lead volume">
          <WeeklyBars data={a.over_time.map((o) => ({ label: weekLabel(o.week), value: o.count }))} />
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Qualification mix">
          <Donut data={a.by_qualification.map((q) => ({ label: q.key, value: q.count }))} />
        </ChartCard>
        <ChartCard title="Lead temperature">
          <Donut data={a.by_temperature.map((t) => ({ label: t.key, value: t.count }))} />
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Pipeline stages">
          <BarList data={a.by_pipeline.map((p) => ({ label: p.key, value: p.count }))} />
        </ChartCard>
        <ChartCard title="Case types by volume">
          <BarList data={a.by_case_type.map((c) => ({ label: c.key, value: c.count }))} />
        </ChartCard>
      </div>

      <ChartCard title="Pipeline value by case type">
        <BarList data={a.by_case_type.filter((c) => c.value > 0).map((c) => ({ label: c.key, value: c.value }))} fmt={compactUsd} />
      </ChartCard>
    </div>
  );
}
