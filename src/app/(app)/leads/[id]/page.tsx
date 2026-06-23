"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, CalendarDays, Loader2, RefreshCw, FileText, FileSignature,
  Stethoscope, ShieldCheck, Users, Gavel, Scale, MessageSquare, Activity, ClipboardList, X,
} from "lucide-react";
import { ApiError, getLeadDetail, rescoreLead, requestDocuments, sendRetainer } from "@/lib/api";
import { apiUrl } from "@/lib/api/client";
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

// Recipient an action reported sending to (email or phone), from the API response.
const sentTo = (r: unknown) => (r as { sent_to?: string } | null)?.sent_to;

// --- Document card helpers ---
const prettyCat = (c?: string) =>
  c ? c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "Unclassified";
const isImage = (mime?: string) => !!mime && mime.startsWith("image/");

function docStatusLabel(s?: string): string {
  return s === "matched" ? "Matched" : s === "needs_review" ? "Needs review"
    : s === "unmatched" ? "No matching ask" : s === "processing" ? "Processing…"
    : s === "failed" ? "Failed" : (s ?? "");
}
function docStatusClass(s?: string): string {
  if (s === "matched") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (s === "processing") return "bg-sky-500/15 text-sky-600 dark:text-sky-400";
  if (s === "needs_review" || s === "unmatched") return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}
function extractedChips(ex: Record<string, unknown>) {
  const fields: [string, string][] = [
    ["provider", "Provider"], ["billed_amount", "Billed"], ["carrier", "Carrier"],
    ["coverage_limit", "Limit"], ["policy_kind", "Policy"], ["claim_number", "Claim #"],
    ["report_number", "Report #"],
  ];
  return fields
    .filter(([k]) => ex[k] != null && ex[k] !== "")
    .map(([k, label]) => {
      let v = String(ex[k]);
      if ((k === "billed_amount" || k === "coverage_limit") && !Number.isNaN(Number(v)))
        v = "$" + Number(v).toLocaleString();
      return <span key={k}><span className="text-foreground/60">{label}:</span> {v}</span>;
    });
}

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
  const [viewerDoc, setViewerDoc] = useState<Row | null>(null);

  const load = useCallback(() => {
    getLeadDetail(id)
      .then((res) => { setD(res); setStatus("ok"); })
      .catch((e) => setStatus(e instanceof ApiError && e.status === 404 ? "notfound" : "error"));
  }, [id]);

  useEffect(load, [load]);

  async function act(name: string, fn: () => Promise<unknown>, ok: string | ((r: unknown) => string)) {
    setBusy(name);
    setFlash(null);
    try {
      const result = await fn();
      const msg = typeof ok === "function" ? ok(result) : ok;
      if (msg) setFlash(msg);
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
              <GlassButton size="sm" disabled={!!busy} onClick={() => act("docs", () => requestDocuments(id), (r) => sentTo(r) ? `The documents have been sent to ${sentTo(r)}.` : "No new documents to request.")}>
                {busy === "docs" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Request documents
              </GlassButton>
              <GlassButton size="sm" disabled={!!busy} onClick={() => act("retainer", () => sendRetainer(id), (r) => sentTo(r) ? `The retainer has been sent to ${sentTo(r)}.` : "Retainer isn't ready to send.")}>
                {busy === "retainer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />} Send retainer
              </GlassButton>
              {flash ? <span className="text-xs text-muted-foreground">{flash}</span> : null}
            </div>
          </header>

          {S(lead, "ai_summary") ? (
            <Section icon={FileText} title="AI case summary">
              <p className="break-words text-sm leading-relaxed text-foreground/90">{S(lead, "ai_summary")}</p>
            </Section>
          ) : S(lead, "pipeline_status") === "Intake Started" ? (
            <Section icon={FileText} title="AI case summary">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-500" />
                The AI is processing this intake — the summary, attorney brief, and case details
                will appear here shortly. Refresh in a moment to see them.
              </p>
            </Section>
          ) : null}

          {/* Attorney brief (internal — richer, sectioned synthesis) */}
          {lead && typeof lead["case_brief"] === "object" && lead["case_brief"] ? (() => {
            const b = lead["case_brief"] as Record<string, string>;
            const rows: [string, string][] = [
              ["Liability", "liability"],
              ["Injuries & prognosis", "injuries"],
              ["Damages & value", "damages"],
              ["Representation", "representation"],
              ["Recommended next step", "next_step"],
            ];
            const shown = rows.filter(([, k]) => b[k]);
            if (!b.headline && shown.length === 0) return null;
            return (
              <Section icon={ClipboardList} title="Attorney brief">
                {b.headline ? <p className="break-words text-sm font-medium text-foreground">{b.headline}</p> : null}
                <div className="mt-3 grid gap-3">
                  {shown.map(([label, k]) => (
                    <div key={k}>
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <p className="break-words text-sm text-foreground/90">{b[k]}</p>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })() : null}

          {/* Client & employment */}
          <Section icon={Users} title="Client & employment">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Date of birth" value={S(lead, "date_of_birth") ? fmtDate(S(lead, "date_of_birth")) : undefined} />
              <Field label="Email" value={S(lead, "email")} />
              <Field label="Phone" value={S(lead, "phone")} />
              <Field label="Occupation" value={S(lead, "occupation")} />
              <Field label="Employer" value={S(lead, "employer")} />
              <Field label="Employment" value={S(lead, "employment_status")} />
              <Field label="Annual income" value={N(lead, "annual_income") != null ? fmtCurrency(N(lead, "annual_income")) : undefined} />
              <Field label="Preferred contact" value={S(lead, "preferred_contact_method")} />
              <Field label="Best time to reach" value={S(lead, "best_time_to_contact")} />
              <div className="col-span-2 sm:col-span-3"><Field label="Address" value={S(lead, "address")} /></div>
            </div>
          </Section>

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
                    <p className="mb-2 text-xs text-muted-foreground">Submitted documents</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {d.documents.map((doc, i) => {
                        const docId = S(doc, "id");
                        const mime = S(doc, "mime_type");
                        const href = docId ? apiUrl(`/api/leads/${id}/documents/${docId}/file`) : undefined;
                        const conf = N(doc, "classification_confidence");
                        const ms = S(doc, "match_status");
                        const ex = doc["extracted"] && typeof doc["extracted"] === "object"
                          ? (doc["extracted"] as Record<string, unknown>) : null;
                        const chips = ex ? extractedChips(ex) : [];
                        return (
                          <button key={i} type="button" disabled={!href}
                            onClick={() => href && setViewerDoc(doc)}
                            className="flex gap-3 rounded-xl border border-border/60 p-2.5 text-left transition-colors hover:bg-muted/40 disabled:cursor-default">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                              {isImage(mime) && href
                                ? <img src={href} alt="" className="h-full w-full object-cover" />
                                : <FileText className="h-6 w-6 text-muted-foreground" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-medium text-foreground">{prettyCat(S(doc, "doc_category"))}</span>
                                {ms ? <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${docStatusClass(ms)}`}>{docStatusLabel(ms)}</span> : null}
                                {conf != null && conf > 0 ? <span className="text-[10px] text-muted-foreground">{Math.round(conf * 100)}%</span> : null}
                              </div>
                              {S(doc, "doc_summary") ? <p className="mt-0.5 line-clamp-2 break-words text-xs text-foreground/80">{S(doc, "doc_summary")}</p> : null}
                              {chips.length ? <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">{chips}</div> : null}
                              <div className="mt-1 truncate text-[11px] text-muted-foreground">{S(doc, "file_name")} · {fmtRelative(S(doc, "created_at"))}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
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

          {/* Full call transcript */}
          {d.transcript?.full_text ? (
            <Section icon={MessageSquare} title="Call transcript">
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90">
                {d.transcript.full_text}
              </pre>
            </Section>
          ) : null}
        </>
      )}

      {/* In-UI document viewer */}
      {viewerDoc ? (() => {
        const docId = S(viewerDoc, "id");
        const mime = S(viewerDoc, "mime_type");
        const href = docId ? apiUrl(`/api/leads/${id}/documents/${docId}/file`) : "";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setViewerDoc(null)}>
            <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-background shadow-xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
                <span className="min-w-0 truncate text-sm font-medium text-foreground">
                  {S(viewerDoc, "file_name") ?? prettyCat(S(viewerDoc, "doc_category"))}
                </span>
                <button type="button" onClick={() => setViewerDoc(null)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-muted/30">
                {isImage(mime)
                  ? <img src={href} alt="" className="mx-auto max-h-[80vh] w-auto" />
                  : <iframe src={href} title="document" className="h-[80vh] w-full" />}
              </div>
            </div>
          </div>
        );
      })() : null}
    </div>
  );
}
