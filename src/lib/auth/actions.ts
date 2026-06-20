"use client";

// Auth actions — placeholder while the FastAPI auth endpoints are built.
// The contract matches the auth form (returns { error } on failure) so swapping
// in real network calls later is a one-line change per function.
//
// Production target:
//   POST {API}/api/auth/login    { email, password }
//   POST {API}/api/auth/register { email, password }
//   POST {API}/api/auth/logout

type AuthResult = { error?: string };

// Simulated latency so loading/success states render realistically in the UI.
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function signInCredentials(
  email: string,
  password: string,
): Promise<AuthResult> {
  await delay(700);
  if (!email || !password) return { error: "Email and password are required." };
  // TODO: call FastAPI /api/auth/login and persist the session token.
  return {};
}

export async function signUpCredentials(
  email: string,
  password: string,
): Promise<AuthResult> {
  await delay(700);
  if (!email || !password) return { error: "Email and password are required." };
  // TODO: call FastAPI /api/auth/register.
  return {};
}

export async function signOut(): Promise<void> {
  // TODO: call FastAPI /api/auth/logout and clear the session.
  await delay(150);
}
