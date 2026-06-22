// Data access for the dashboard. Talks to the FastAPI backend (RLS-scoped to the
// authenticated identity), replacing the earlier mock layer.

import { apiFetch, apiUpload } from "@/lib/api/client";
import type { LeadSummary } from "@/types/lead";

export { ApiError } from "@/lib/api/client";

// --- Lead list / summary (camelCase, matches LeadOut) ---------------------

export function getLeads(params?: {
  q?: string;
  pipeline_status?: string;
  qualification_status?: string;
  temperature?: string;
  sort?: string;
}): Promise<LeadSummary[]> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) qs.set(k, v);
  const s = qs.toString();
  return apiFetch<LeadSummary[]>(`/api/leads${s ? `?${s}` : ""}`);
}

export function getLead(id: string): Promise<LeadSummary> {
  return apiFetch<LeadSummary>(`/api/leads/${id}`);
}

// --- Full case file (snake_case aggregate from /detail) -------------------

export interface ScoreRow {
  score: number;
  temperature: string | null;
  qualification_status: string | null;
  qualification_reason: string | null;
  reasoning: string[] | null;
  model: string | null;
  created_at: string;
}
export interface SettlementRow {
  low: number | null;
  expected: number | null;
  high: number | null;
  confidence: string | null;
  pain_multiplier: number | null;
  reasoning: string | null;
  created_at: string;
}
export interface LeadDetail {
  lead: Record<string, unknown>;
  incidents: Record<string, unknown>[];
  injuries: Record<string, unknown>[];
  treatments: Record<string, unknown>[];
  insurance_policies: Record<string, unknown>[];
  parties: Record<string, unknown>[];
  damages: Record<string, unknown>[];
  score: ScoreRow | null;
  settlement: SettlementRow | null;
  document_requests: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  retainer: Record<string, unknown> | null;
  tasks: Record<string, unknown>[];
  messages: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  transcript: { full_text?: string; status?: string; created_at?: string } | null;
}

export function getLeadDetail(id: string): Promise<LeadDetail> {
  return apiFetch<LeadDetail>(`/api/leads/${id}/detail`);
}

// --- Funnel actions (staff) ----------------------------------------------

export function patchLead(
  id: string,
  patch: Partial<{
    pipeline_status: string;
    qualification_status: string;
    lead_temperature: string;
    assigned_user_id: string;
  }>,
): Promise<LeadSummary> {
  return apiFetch<LeadSummary>(`/api/leads/${id}`, { method: "PATCH", body: patch });
}

export function rescoreLead(id: string): Promise<unknown> {
  return apiFetch(`/api/leads/${id}/rescore`, { method: "POST" });
}

export function requestDocuments(leadId: string, documentTypes?: string[]): Promise<unknown> {
  return apiFetch(`/api/documents/request`, {
    method: "POST",
    body: { lead_id: leadId, document_types: documentTypes ?? null },
  });
}

export function sendRetainer(leadId: string): Promise<unknown> {
  return apiFetch(`/api/retainers/send`, { method: "POST", body: { lead_id: leadId } });
}

export function runFollowups(): Promise<{
  docs_requested: number;
  retainers_sent: number;
  doc_nudges: number;
  retainer_nudges: number;
}> {
  return apiFetch(`/api/followups/run`, { method: "POST" });
}

// --- Client portal --------------------------------------------------------

export interface PortalCase {
  lead: Record<string, unknown> | null;
  incident: Record<string, unknown> | null;
  injuries: Record<string, unknown>[];
  document_requests: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  retainer: Record<string, unknown> | null;
}

export function getMyCase(): Promise<PortalCase> {
  return apiFetch<PortalCase>(`/api/portal/case`);
}

export function uploadMyDocument(file: File): Promise<{ document_id: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload(`/api/portal/documents/upload`, form);
}

export function signMyRetainer(): Promise<unknown> {
  return apiFetch(`/api/portal/retainer/sign`, { method: "POST" });
}

// --- LOR e-sign (public magic-link flow) ----------------------------------

export interface SignDoc {
  firm: string;
  client_name: string;
  case_type: string;
  lor_text: string;
  status: string;
  signed: boolean;
  signer_name: string | null;
}

export function getSignDoc(code: string): Promise<SignDoc> {
  return apiFetch<SignDoc>(`/api/sign/${code}`);
}

export function signDoc(code: string, signedName: string): Promise<{ status: string; already?: boolean }> {
  return apiFetch(`/api/sign/${code}`, { method: "POST", body: { signed_name: signedName } });
}

// --- Analytics ------------------------------------------------------------

export interface Analytics {
  totals: { leads: number; qualified: number; hot: number; signed: number; avg_score: number };
  settlement: { pipeline_value: number; avg_qualified: number; signed_value: number };
  by_pipeline: { key: string; count: number }[];
  by_qualification: { key: string; count: number }[];
  by_temperature: { key: string; count: number }[];
  by_case_type: { key: string; count: number; value: number }[];
  funnel: { stage: string; count: number }[];
  over_time: { week: string; count: number }[];
}

export function getAnalytics(): Promise<Analytics> {
  return apiFetch<Analytics>(`/api/analytics/overview`);
}

// --- Org settings ---------------------------------------------------------

export interface OrgSettings {
  profile: { name: string | null; slug: string | null; intake_phone: string | null };
  phone_numbers: { e164: string; is_primary: boolean }[];
  integrations: {
    whatsapp_sender_configured: boolean;
    voice_bridge_configured: boolean;
    twilio_configured: boolean;
    realtime_model: string;
    extraction_model: string;
    embedding_model: string;
  };
}

export function getOrgSettings(): Promise<OrgSettings> {
  return apiFetch<OrgSettings>(`/api/org/settings`);
}

export function patchOrgSettings(patch: { name?: string; intake_phone?: string }): Promise<unknown> {
  return apiFetch(`/api/org/settings`, { method: "PATCH", body: patch });
}
