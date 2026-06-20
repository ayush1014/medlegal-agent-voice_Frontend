"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileText, Loader2 } from "lucide-react";
import { getLeads } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { PipelineBadge, RetainerBadge } from "@/components/leads/lead-badges";
import type { LeadSummary } from "@/types/lead";

// The client portal shows only the client's own case (RLS returns exactly one lead).
export default function PortalPage() {
  const [lead, setLead] = useState<LeadSummary | null | undefined>(undefined);

  useEffect(() => {
    getLeads()
      .then((leads) => setLead(leads[0] ?? null))
      .catch(() => setLead(null));
  }, []);

  if (lead === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (lead === null) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
        We couldn&apos;t find your case yet. Please check back shortly.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hi {lead.fullName.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s the status of your case.</p>
      </header>

      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Case type</div>
            <div className="text-base font-medium text-foreground">{lead.caseType}</div>
          </div>
          <PipelineBadge status={lead.pipelineStatus} />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Incident date: <span className="text-foreground">{fmtDate(lead.incidentDate)}</span>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4" /> Documents
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {lead.missingDocuments
            ? `${lead.missingDocuments} document${lead.missingDocuments > 1 ? "s" : ""} still needed. We'll text you a secure upload link.`
            : "All requested documents received."}
        </p>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4" /> Representation
        </h2>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          Status: <RetainerBadge status={lead.retainerStatus} />
        </div>
      </section>
    </div>
  );
}
