// Thin client for the MedLegal FastAPI backend. Centralizes the base URL and a
// typed fetch helper so feature code never hand-rolls URLs or error handling.
//
// While the backend is being built we fall back to seed data (see mock-data.ts);
// swap the function bodies for real calls once the endpoints exist.

import type { Lead } from "@/types/lead";
import { MOCK_LEADS } from "@/lib/mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Typed JSON fetch. Throws ApiError on non-2xx so callers can branch on status.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

// ---- Leads ---------------------------------------------------------------
// TODO: replace mock returns with apiFetch once the FastAPI endpoints land.

export async function getLeads(): Promise<Lead[]> {
  return MOCK_LEADS;
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return MOCK_LEADS.find((l) => l.id === id);
}
