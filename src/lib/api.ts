// Data access for the dashboard. Talks to the FastAPI backend (RLS-scoped to the
// authenticated identity), replacing the earlier mock layer.

import { apiFetch } from "@/lib/api/client";
import type { LeadSummary } from "@/types/lead";

export { ApiError } from "@/lib/api/client";

export function getLeads(): Promise<LeadSummary[]> {
  return apiFetch<LeadSummary[]>("/api/leads");
}

export function getLead(id: string): Promise<LeadSummary> {
  return apiFetch<LeadSummary>(`/api/leads/${id}`);
}
