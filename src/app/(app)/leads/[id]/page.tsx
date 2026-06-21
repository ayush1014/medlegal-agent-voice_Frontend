"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, CalendarDays, Loader2, RefreshCw, FileText, FileSignature,
  Stethoscope, ShieldCheck, Users, Gavel, Scale, MessageSquare, Activity,
} from "lucide-react";
import { ApiError, getLeadDetail, rescoreLead, requestDocuments, sendRetainer } from "@/lib/api";
import type { LeadDetail } from "@/lib/api";
import { fmtCurrency, fmtCurrencyRange, fmtDate, fmtRelative } from "@/lib/format";
import { GlassButton } from "@/components/ui/glass-button";
import {
  QualificationBadge, TemperatureBadge, PipelineBadge, RetainerBadge, ScoreChip,
} from "@/components/leads/lead-badges";
import type {
  QualificationStatus, LeadTemperature, PipelineStatus, RetainerStatus,
} from "@/types/lead";

type Row = Record<string, unknown>;
const S = (o: Row | null | undefined, k: string) => (o && o[k] != null ? String(o[k]) : undefined);
const N = (o: Row | null | undefined, k: string) => (o && o[k] != null ? Number(o[k]) : undefined);
const B = (o: Row | null | undefined, k: string) => Boolean(o && o[k]);

function Section({ icon: Icon, title, count, children }: {
  icon: React.ComponentType<{ className?: string }>; title: string; count?: number; children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        {count != null ? <span className="text-xs font-normal text-muted-foreground">({count})</span> : null}
      </h2>
      <div className="mt-3">{children}</div>
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

const empty = "text-sm text-muted-foreground";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<LeadDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "notfound" | "error" | "ok">("loading");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    getLeadDetail(id)
      .then((res) => { setD(res); setStatus("ok"); })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? "notfound" : "error"));
  }, [id]);

  useEffect(load, [load]);

  async function act(name: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(name);
    setFlash(null);
    try {
      await fn();
      setFlash(ok);
      load();
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (status === "loading") {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const lead = d?.lead;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {status !== "ok" || !d || !lead ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          {status === "notfound" ? "Lead not found." : "Couldn't load this lead."}
        </p>
      ) : (
        <>
          <header className="glass-card rounded-2xl p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{S(lead, "full_name")}</h1>
                <p className="text-sm text-muted-foreground">{S(lead, "case_type")} · {fmtDate(S(lead, "incident_date"))}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ScoreChip score={N(lead, "lead_score") ?? 0} />
                <TemperatureBadge temperature={(S(lead, "lead_temperature") as LeadTemperature) ?? "Low"} />
                <QualificationBadge status={(S(lead, "qualification_status") as QualificationStatus) ?? "Needs Review"} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <PipelineBadge status={(S(lead, "pipeline_status") as PipelineStatus) ?? "New Lead"} />
              <RetainerBadge status={(S(lead, "retainer_status") as RetainerStatus) ?? "Not Ready"} />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" />{S(lead, "phone")}</span>
              {S(lead, "email") ? <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" />{S(lead, "email")}</span> : null}
            </div>

            {/* Funnel actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <GlassButton size="sm" disabled={!!busy} onClick={() => act("rescore", () => rescoreLead(id), "Re-scored.")}>
                {busy === "rescore" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Re-score
              </GlassButton>
              <GlassButton size="sm" disabled={!!busy} onClick={() => act("docs", () => requestDocuments(id), "Documents requested over WhatsApp.")}>
                {busy === "docs" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Request documents
              </GlassButton>
              <GlassButton size="sm" disabled={!!busy} onClick={() => act("retainer", () => sendRetainer(id), "Retainer sent over WhatsApp.")}>
                {busy === "retainer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />} Send retainer
              </GlassButton>
              {flash ? <span className="text-xs text-muted-foreground">{flash}</span> : null}
            </div>
          </header>

          {S(lead, "ai_summary") ? (
            <Section icon={FileText} title="AI case summary">
              <p className="break-words text-sm leading-relaxed text-foreground/90">{S(lead, "ai_summary")}</p>
            </Section>
          ) : null}

          {/* Intelligence */}
          <Section icon={Scale} title="Lead intelligence">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2">
                  <ScoreChip score={N(lead, "lead_score") ?? 0} />
                  <QualificationBadge status={(S(lead, "qualification_status") as QualificationStatus) ?? "Needs Review"} />
                </div>
                {d.score?.qualification_reason ? <p className="mt-2 break-words text-sm text-foreground/90">{d.score.qualification_reason}</p> : null}
                {d.score?.reasoning?.length ? (
                  <ul className="mt-3 space-y-1">
                    {d.score.reasoning.map((r, i) => <li key={i} className="break-words text-xs text-muted-foreground">• {r}</li>)}
                  </ul>
                ) : null}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Estimated settlement</span>
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {d.settlement ? fmtCurrencyRange(d.settlement.low ?? undefined, d.settlement.high ?? undefined) : "—"}
                </p>
                {d.settlement?.expected ? <p className="text-sm text-muted-foreground">Expected {fmtCurrency(d.settlement.expected)} · confidence {d.settlement.confidence}</p> : null}
                {d.settlement?.reasoning ? <p className="mt-2 break-words text-xs text-muted-foreground">{d.settlement.reasoning}</p> : null}
              </div>
            </div>
          </Section>

          {/* Incident */}
          <Section icon={Gavel} title="Incident & liability" count={d.incidents.length}>
            {d.incidents.length === 0 ? <p className={empty}>No incident details extracted.</p> : d.incidents.map((inc, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Date" value={<span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{fmtDate(S(inc, "incident_date"))}</span>} />
                <Field label="Location" value={S(inc, "location_text")} />
                <Field label="Police report" value={B(inc, "police_report_available") ? "Yes" : "—"} />
                <Field label="Comparative fault" value={N(inc, "comparative_negligence_pct") != null ? `${N(inc, "comparative_negligence_pct")}%` : undefined} />
                <div className="col-span-2 sm:col-span-3"><Field label="What happened" value={S(inc, "description")} /></div>
                {S(inc, "fault_narrative") ? <div className="col-span-2 sm:col-span-3"><Field label="Fault" value={S(inc, "fault_narrative")} /></div> : null}
              </div>
            ))}
          </Section>

          {/* Injuries */}
          <Section icon={Activity} title="Injuries" count={d.injuries.length}>
            {d.injuries.length === 0 ? <p className={empty}>None recorded.</p> : (
              <ul className="space-y-2">
                {d.injuries.map((inj, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-x-2 text-sm text-foreground">
                    <span className="font-medium">{S(inj, "body_part") ?? "Injury"}</span>
                    {S(inj, "severity") ? <span className="text-xs text-muted-foreground">· {S(inj, "severity")}</span> : null}
                    {B(inj, "is_permanent") ? <span className="text-xs text-red-600 dark:text-red-400">· permanent</span> : null}
                    {B(inj, "requires_surgery") ? <span className="text-xs text-amber-600 dark:text-amber-400">· surgery</span> : null}
                    {S(inj, "description") ? <span className="w-full text-xs text-muted-foreground">{S(inj, "description")}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Treatment */}
          <Section icon={Stethoscope} title="Medical treatment" count={d.treatments.length}>
            {d.treatments.length === 0 ? <p className={empty}>No treatment on record.</p> : (
              <ul className="space-y-2">
                {d.treatments.map((t, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">{S(t, "provider_name") ?? "Provider"}{S(t, "treatment_type") ? <span className="text-xs text-muted-foreground"> · {S(t, "treatment_type")}</span> : null}{B(t, "is_ongoing") ? <span className="text-xs text-sky-600 dark:text-sky-400"> · ongoing</span> : null}</span>
                    <span className="font-mono text-xs text-muted-foreground">{fmtCurrency(N(t, "billed_amount"))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Insurance */}
          <Section icon={ShieldCheck} title="Insurance" count={d.insurance_policies.length}>
            {d.insurance_policies.length === 0 ? <p className={empty}>No policies identified.</p> : (
              <ul className="space-y-2">
                {d.insurance_policies.map((p, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">{S(p, "carrier_name") ?? "Carrier"}<span className="text-xs text-muted-foreground"> · {S(p, "party_role")} · {S(p, "policy_kind")}</span></span>
                    <span className="font-mono text-xs text-muted-foreground">{fmtCurrency(N(p, "coverage_limit"))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Parties + Damages side by side */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Section icon={Users} title="Other parties" count={d.parties.length}>
              {d.parties.length === 0 ? <p className={empty}>None.</p> : (
                <ul className="space-y-1.5">
                  {d.parties.map((p, i) => <li key={i} className="text-sm text-foreground">{S(p, "full_name") ?? "Party"} <span className="text-xs text-muted-foreground">· {S(p, "role")}</span></li>)}
                </ul>
              )}
            </Section>
            <Section icon={Scale} title="Damages" count={d.damages.length}>
              {d.damages.length === 0 ? <p className={empty}>None itemized.</p> : (
                <ul className="space-y-1.5">
                  {d.damages.map((dm, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{S(dm, "category")}</span>
                      <span className="font-mono text-xs text-muted-foreground">{fmtCurrency(N(dm, "amount"))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          {/* Documents */}
          <Section icon={FileText} title="Documents">
            {d.document_requests.length === 0 && d.documents.length === 0 ? (
              <p className={empty}>No documents requested yet. Use “Request documents” above.</p>
            ) : (
              <div className="space-y-3">
                {d.document_requests.length ? (
                  <ul className="space-y-1.5">
                    {d.document_requests.map((r, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{S(r, "document_type")}</span>
                        <span className="text-xs text-muted-foreground">{S(r, "status")}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {d.documents.length ? (
                  <div className="border-t border-border/60 pt-3">
                    <p className="mb-1.5 text-xs text-muted-foreground">Uploaded</p>
                    <ul className="space-y-1.5">
                      {d.documents.map((doc, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate text-foreground">{S(doc, "file_name")}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{S(doc, "uploaded_by")} · {fmtRelative(S(doc, "created_at"))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          {/* Communications */}
          <Section icon={MessageSquare} title="Communications" count={d.messages.length}>
            {d.messages.length === 0 ? <p className={empty}>No messages yet.</p> : (
              <ul className="space-y-2">
                {d.messages.slice(0, 12).map((m, i) => (
                  <li key={i} className="min-w-0 text-sm">
                    <span className="text-xs text-muted-foreground">{S(m, "channel")} · {S(m, "direction")} · {fmtRelative(S(m, "created_at"))}</span>
                    {S(m, "body") ? <p className="break-words text-foreground/90">{S(m, "body")}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Timeline */}
          <Section icon={Activity} title="Activity timeline" count={d.timeline.length}>
            {d.timeline.length === 0 ? <p className={empty}>No activity recorded.</p> : (
              <ul className="space-y-1.5">
                {d.timeline.slice(0, 20).map((t, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-foreground/90">{S(t, "name") ?? S(t, "event_type")}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtRelative(S(t, "created_at"))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
