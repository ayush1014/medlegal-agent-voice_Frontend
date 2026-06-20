"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { useAuth } from "@/components/auth/auth-provider";
import { login } from "@/lib/auth/client";

// Firm / staff sign-in: email + password only (no OTP). Clients use /client.
export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login(email, password);
      await refresh();
      router.push(res.subject_type === "client" ? "/portal" : "/dashboard");
    } catch {
      setError("Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Firm sign in
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            For attorneys, paralegals and staff.
          </p>
        </div>

        {error ? (
          <p className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <form onSubmit={submit} className="w-full space-y-4">
          <GlassInput
            type="email"
            autoFocus
            placeholder="Work email"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <GlassInput
            type="password"
            placeholder="Password"
            icon={<Lock className="h-5 w-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-center pt-2">
            <GlassButton type="submit" disabled={busy} className="w-full [&>button]:w-full">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
            </GlassButton>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Injured and seeking help?{" "}
          <Link href="/client" className="font-medium text-foreground underline-offset-4 hover:underline">
            I&apos;m a client
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
