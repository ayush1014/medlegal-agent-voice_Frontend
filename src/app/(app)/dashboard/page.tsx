"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BadgeCheck,
  Flame,
  FileClock,
  Send,
  FileSignature,
  TrendingUp,
  Gauge,
  Loader2,
} from "lucide-react";
import { getLeads } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsTable } from "@/components/leads/leads-table";
import type { LeadSummary } from "@/types/lead";

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLeads().then(setLeads).catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          Couldn&apos;t load leads. Is the API running?
        </p>
      </div>
    );
  }

  if (leads === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const qualified = leads.filter((l) => l.qualificationStatus === "Qualified").length;
  const hot = leads.filter((l) => l.leadTemperature === "Hot").length;
  const pendingDocs = leads.filter((l) => (l.missingDocuments ?? 0) > 0).length;
  const retainersSent = leads.filter((l) => ["Sent", "Viewed"].includes(l.retainerStatus)).length;
  const signed = leads.filter((l) => l.retainerStatus === "Signed").length;
  const conversion = leads.length ? Math.round((signed / leads.length) * 100) : 0;

  const stats = [
    { label: "Total leads", value: String(leads.length), icon: Users, sub: "All time" },
    { label: "Qualified", value: String(qualified), icon: BadgeCheck, sub: "Ready to advance" },
    { label: "Hot leads", value: String(hot), icon: Flame, sub: "Score 80+" },
    { label: "Avg score", value: leads.length ? String(Math.round(leads.reduce((a, l) => a + l.leadScore, 0) / leads.length)) : "—", icon: Gauge, sub: "Across firm" },
    { label: "Pending docs", value: String(pendingDocs), icon: FileClock, sub: "Awaiting upload" },
    { label: "Retainers sent", value: String(retainersSent), icon: Send, sub: "Awaiting signature" },
    { label: "Signed", value: String(signed), icon: FileSignature, sub: "Converted clients" },
    { label: "Conversion", value: `${conversion}%`, icon: TrendingUp, sub: "Lead → signed" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Personal injury intake overview and live lead pipeline.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} />
        ))}
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
