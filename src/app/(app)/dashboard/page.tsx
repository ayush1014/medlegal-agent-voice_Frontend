import {
  Users,
  UserPlus,
  BadgeCheck,
  Flame,
  FileClock,
  Send,
  FileSignature,
  TrendingUp,
} from "lucide-react";
import { getLeads } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function DashboardPage() {
  const leads = await getLeads();

  // Derive the top-line metrics the firm watches each morning.
  const total = leads.length;
  const qualified = leads.filter((l) => l.qualificationStatus === "Qualified").length;
  const hot = leads.filter((l) => l.leadTemperature === "Hot").length;
  const pendingDocs = leads.filter((l) => (l.missingDocuments ?? 0) > 0).length;
  const retainersSent = leads.filter((l) =>
    ["Sent", "Viewed"].includes(l.retainerStatus),
  ).length;
  const signed = leads.filter((l) => l.retainerStatus === "Signed").length;
  const conversion = total ? Math.round((signed / total) * 100) : 0;

  const stats = [
    { label: "Total leads", value: String(total), icon: Users, sub: "All time" },
    { label: "New today", value: "2", icon: UserPlus, sub: "Last 24 hours" },
    { label: "Qualified", value: String(qualified), icon: BadgeCheck, sub: "Ready to advance" },
    { label: "Hot leads", value: String(hot), icon: Flame, sub: "Score 80+" },
    { label: "Pending docs", value: String(pendingDocs), icon: FileClock, sub: "Awaiting upload" },
    { label: "Retainers sent", value: String(retainersSent), icon: Send, sub: "Awaiting signature" },
    { label: "Signed", value: String(signed), icon: FileSignature, sub: "Converted clients" },
    { label: "Conversion", value: `${conversion}%`, icon: TrendingUp, sub: "Lead → signed" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Personal injury intake overview and live lead pipeline.
        </p>
      </header>

      {/* Metric cards — 2-up on mobile, scaling to 4-up on desktop. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            sub={s.sub}
            icon={s.icon}
          />
        ))}
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
