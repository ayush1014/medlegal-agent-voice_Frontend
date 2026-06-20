import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, CalendarDays } from "lucide-react";
import { getLead } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/format";
import {
  QualificationBadge,
  TemperatureBadge,
  PipelineBadge,
  RetainerBadge,
  ScoreChip,
} from "@/components/leads/lead-badges";

// Reusable glass section wrapper for the detail layout.
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Link
        href="/leads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {/* Header */}
      <header className="glass-card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {lead.fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lead.caseType} · {fmtDate(lead.incidentDate)} · {lead.incidentLocation ?? "—"}
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
        <Section title="AI case summary">
          <p className="leading-relaxed text-foreground/90">{lead.aiSummary}</p>
        </Section>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Contact information">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Phone"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {lead.phone}
                </span>
              }
            />
            <Field
              label="Email"
              value={
                lead.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {lead.email}
                  </span>
                ) : undefined
              }
            />
            <Field label="Preferred contact" value={lead.preferredContactMethod} />
            <Field label="Best time" value={lead.bestTimeToContact} />
          </div>
        </Section>

        <Section title="Incident details">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Date"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {fmtDate(lead.incidentDate)}
                </span>
              }
            />
            <Field
              label="Location"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {lead.incidentLocation}
                </span>
              }
            />
            <Field label="Police report" value={lead.policeReportAvailable ? "Available" : "No"} />
            <Field label="Insurance" value={lead.insuranceAvailable ? "Available" : "No"} />
          </div>
          <p className="mt-4 leading-relaxed text-foreground/90">
            {lead.incidentDescription}
          </p>
        </Section>

        <Section title="Injury details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pain level" value={lead.painLevel != null ? `${lead.painLevel}/10` : undefined} />
            <Field label="Medical treatment" value={lead.medicalTreatmentReceived ? "Received" : "None"} />
            <Field label="Missed work" value={lead.missedWork ? "Yes" : "No"} />
            <Field
              label="Lost wages"
              value={lead.lostWagesEstimate ? fmtCurrency(lead.lostWagesEstimate) : undefined}
            />
          </div>
          {lead.injurySummary ? (
            <p className="mt-4 leading-relaxed text-foreground/90">{lead.injurySummary}</p>
          ) : null}
        </Section>

        <Section title="Settlement estimate">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-foreground/[0.03] p-3">
              <div className="text-xs text-muted-foreground">Low</div>
              <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                {fmtCurrency(lead.settlementLow)}
              </div>
            </div>
            <div className="rounded-xl bg-foreground/[0.05] p-3">
              <div className="text-xs text-muted-foreground">Expected</div>
              <div className="mt-1 font-mono text-base font-semibold tabular-nums text-foreground">
                {fmtCurrency(lead.settlementExpected)}
              </div>
            </div>
            <div className="rounded-xl bg-foreground/[0.03] p-3">
              <div className="text-xs text-muted-foreground">High</div>
              <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                {fmtCurrency(lead.settlementHigh)}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Confidence: {lead.settlementConfidence ?? "—"}. This is an AI-generated
            preliminary estimate for intake prioritization only — not legal advice and
            not a guarantee of any outcome.
          </p>
        </Section>
      </div>

      {lead.scoreReasoning?.length ? (
        <Section title="Why this score">
          <ul className="list-inside list-disc space-y-1">
            {lead.scoreReasoning.map((r, i) => (
              <li key={i} className="text-foreground/90">
                {r}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
