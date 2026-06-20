import { getLeads } from "@/lib/api";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Every intake lead with qualification, score and pipeline status.
        </p>
      </header>

      <LeadsTable leads={leads} />
    </div>
  );
}
