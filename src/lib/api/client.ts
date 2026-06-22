// Thin fetch client for the FastAPI backend.
// - sends cookies (credentials: "include") so the session rides along
// - adds the firm slug (X-Org-Slug) so the API resolves the org
// - echoes the CSRF token on mutations (double-submit; token kept in memory)

import { getOrgSlug } from "@/lib/org";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Absolute backend URL for resources the browser loads directly (e.g. an <img>/<iframe>
// src that can't go through apiFetch). Uses the SAME base as apiFetch so the request's
// cookies match the backend origin — NEXT_PUBLIC_API_BASE_URL in local dev, or relative
// (the Next /api proxy) in production.
export const apiUrl = (path: string): string => `${BASE}${path}`;

// In-memory CSRF token. Recovered after a reload via GET /api/auth/csrf.
let csrfToken: string | null = null;
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = { method?: string; body?: unknown };

export async function apiFetch<T>(path: string, opts: Options = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const slug = getOrgSlug();
  if (slug) headers["X-Org-Slug"] = slug;
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : null) ?? res.statusText;
    throw new ApiError(res.status, detail, data);
  }
  return data as T;
}

// Multipart upload (FormData). The browser sets the multipart Content-Type +
// boundary, so we must NOT set Content-Type ourselves.
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const slug = getOrgSlug();
  if (slug) headers["X-Org-Slug"] = slug;
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: form,
  });
  const text = await res.text();
  let data: unknown = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : res.statusText;
    throw new ApiError(res.status, detail, data);
  }
  return data as T;
}
