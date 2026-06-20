"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getLeads } from "@/lib/api";
import { LeadsTable } from "@/components/leads/leads-table";
import type { LeadSummary } from "@/types/lead";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLeads().then(setLeads).catch(() => setError(true));
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Every intake lead with qualification, score and pipeline status.
        </p>
      </header>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          Couldn&apos;t load leads. Is the API running?
        </p>
      ) : leads === null ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
