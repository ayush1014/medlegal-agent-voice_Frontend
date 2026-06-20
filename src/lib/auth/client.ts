// Auth API calls. Each response that rotates the CSRF token stores it in memory
// (see api/client.ts) so subsequent mutations carry the X-CSRF-Token header.

import { apiFetch, setCsrfToken } from "@/lib/api/client";

export type SubjectType = "user" | "client";

export interface Me {
  organization_id: string;
  subject_type: SubjectType;
  subject_id: string;
  role: string | null;
}

interface SessionResult {
  subject_type?: SubjectType;
  role?: string | null;
  csrf_token?: string;
}

interface OtpVerifyResult extends SessionResult {
  authenticated: boolean;
  signup_token?: string;
}

function keepCsrf<T extends { csrf_token?: string }>(r: T): T {
  if (r.csrf_token) setCsrfToken(r.csrf_token);
  return r;
}

// Recover the CSRF token after a page load (it lives in a cookie on the API origin).
export async function bootstrapCsrf(): Promise<void> {
  keepCsrf(await apiFetch<{ csrf_token?: string }>("/api/auth/csrf"));
}

export function me(): Promise<Me> {
  return apiFetch<Me>("/api/auth/me");
}

export async function login(email: string, password: string): Promise<SessionResult> {
  return keepCsrf(
    await apiFetch<SessionResult>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  );
}

export function requestOtp(phone: string): Promise<unknown> {
  return apiFetch("/api/auth/otp/request", { method: "POST", body: { phone } });
}

export async function verifyOtp(phone: string, code: string): Promise<OtpVerifyResult> {
  return keepCsrf(
    await apiFetch<OtpVerifyResult>("/api/auth/otp/verify", {
      method: "POST",
      body: { phone, code },
    }),
  );
}

export interface ClientSignupInput {
  signup_token: string;
  email: string;
  password: string;
  full_name: string;
  case_type: string;
  incident_description?: string;
  injury_area?: string;
  incident_location?: string;
}

export async function clientSignup(input: ClientSignupInput): Promise<SessionResult> {
  return keepCsrf(
    await apiFetch<SessionResult>("/api/auth/client/signup", {
      method: "POST",
      body: input,
    }),
  );
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore — clearing local state below is what matters to the UI
  }
  setCsrfToken(null);
}
