// Thin fetch client for the FastAPI backend.
// - sends cookies (credentials: "include") so the session rides along
// - adds the firm slug (X-Org-Slug) so the API resolves the org
// - echoes the CSRF token on mutations (double-submit; token kept in memory)
// - on a 401, transparently renews the short-lived access token via the 30-day
//   refresh cookie (POST /api/auth/refresh) and retries the request once, so the
//   session lasts the full refresh-token lifetime instead of dying at 15 minutes.

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

// Endpoints where a 401/403 means "bad credentials" or "not signed in", NOT an
// expired access token — refreshing there is pointless (and /refresh itself must
// never recurse), so they opt out of the auto-refresh retry.
const NO_REFRESH = new Set([
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/csrf",
  "/api/auth/otp/request",
  "/api/auth/otp/verify",
  "/api/auth/client/signup",
]);

// Single-flight refresh: if several requests 401 at once they all await the one
// /refresh call rather than stampeding it. Returns whether the session was renewed.
let refreshing: Promise<boolean> | null = null;
function attemptRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const slug = getOrgSlug();
        if (slug) headers["X-Org-Slug"] = slug;
        if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
        const res = await fetch(`${BASE}/api/auth/refresh`, {
          method: "POST",
          headers,
          credentials: "include",
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (data && typeof data === "object" && "csrf_token" in data) {
          setCsrfToken(String((data as { csrf_token: unknown }).csrf_token));
        }
        return true;
      } catch {
        return false;
      }
    })();
    void refreshing.finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toError(res: Response, data: unknown): ApiError {
  const detail =
    (data && typeof data === "object" && "detail" in data
      ? String((data as { detail: unknown }).detail)
      : null) ?? res.statusText;
  return new ApiError(res.status, detail, data);
}

type Options = { method?: string; body?: unknown };

export async function apiFetch<T>(path: string, opts: Options = {}): Promise<T> {
  const method = opts.method ?? "GET";
  // Re-read csrfToken on each send so a retry after refresh uses the renewed token.
  const send = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const slug = getOrgSlug();
    if (slug) headers["X-Org-Slug"] = slug;
    if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;
    return fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: "include",
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  };

  let res = await send();
  if (res.status === 401 && !NO_REFRESH.has(path) && (await attemptRefresh())) {
    res = await send(); // session renewed → retry once
  }

  const data = parseBody(await res.text());
  if (!res.ok) throw toError(res, data);
  return data as T;
}

// Multipart upload (FormData). The browser sets the multipart Content-Type +
// boundary, so we must NOT set Content-Type ourselves.
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const send = () => {
    const headers: Record<string, string> = {};
    const slug = getOrgSlug();
    if (slug) headers["X-Org-Slug"] = slug;
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
    return fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: form,
    });
  };

  let res = await send();
  if (res.status === 401 && !NO_REFRESH.has(path) && (await attemptRefresh())) {
    res = await send();
  }

  const data = parseBody(await res.text());
  if (!res.ok) throw toError(res, data);
  return data as T;
}
