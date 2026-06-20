"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, CalendarDays, Loader2 } from "lucide-react";
import { getLead, ApiError } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/format";
import {
  QualificationBadge,
  TemperatureBadge,
  PipelineBadge,
  RetainerBadge,
  ScoreChip,
} from "@/components/leads/lead-badges";
import type { LeadSummary } from "@/types/lead";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<LeadSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "notfound" | "error" | "ok">("loading");

  useEffect(() => {
    getLead(id)
      .then((l) => {
        setLead(l);
        setStatus("ok");
      })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? "notfound" : "error"));
  }, [id]);

  if (status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Link
        href="/leads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {status !== "ok" || !lead ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          {status === "notfound" ? "Lead not found." : "Couldn't load this lead."}
        </p>
      ) : (
        <>
          <header className="glass-card rounded-2xl p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {lead.fullName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lead.caseType} · {fmtDate(lead.incidentDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ScoreChip score={lead.leadScore} />
                <TemperatureBadge temperature={lead.leadTemperature} />
                <QualificationBadge status={lead.qualificationStatus} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <PipelineBadge status={lead.pipelineStatus} />
              <RetainerBadge status={lead.retainerStatus} />
            </div>
          </header>

          {lead.aiSummary ? (
            <section className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground">AI case summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{lead.aiSummary}</p>
            </section>
          ) : null}

          <section className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Phone" value={<span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{lead.phone}</span>} />
              <Field label="Email" value={lead.email ? <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{lead.email}</span> : undefined} />
              <Field label="Incident date" value={<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{fmtDate(lead.incidentDate)}</span>} />
              <Field label="Settlement (est.)" value={fmtCurrency(lead.settlementExpected)} />
              <Field label="Missing documents" value={lead.missingDocuments || "—"} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Full case detail (incident, injuries, treatments, transcript) arrives with the
              case-management APIs.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
