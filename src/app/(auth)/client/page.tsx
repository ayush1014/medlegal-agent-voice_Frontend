"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, KeyRound, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GlassInput } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { useAuth } from "@/components/auth/auth-provider";
import { clientSignup, requestOtp, verifyOtp } from "@/lib/auth/client";
import { CASE_TYPES } from "@/lib/constants";

type Step = "phone" | "code" | "details";

// One phone-first flow for clients: enter phone → OTP. If the number already has
// a case, that's a login; if not, they continue to a short signup.
export default function ClientAccessPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New-client details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [caseType, setCaseType] = useState<string>(CASE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [injuryArea, setInjuryArea] = useState("");
  const [location, setLocation] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestOtp(phone);
      setStep("code");
    } catch {
      setError("Couldn't send a code. Please check the number.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await verifyOtp(phone, code);
      if (res.authenticated) {
        await refresh(); // existing case → straight in
        router.push("/portal");
      } else if (res.signup_token) {
        setToken(res.signup_token); // new number → finish signup
        setStep("details");
      }
    } catch {
      setError("That code didn't match. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await clientSignup({
        signup_token: token,
        email,
        password,
        full_name: fullName,
        case_type: caseType,
        incident_description: description || undefined,
        injury_area: injuryArea || undefined,
        incident_location: location || undefined,
      });
      await refresh();
      router.push("/portal");
    } catch {
      setError("Couldn't complete signup. The code may have expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-7">
        <div className="text-center">
          <p className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            {step === "details" ? "A few details" : "Let's get started"}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {step === "phone" && "Enter your phone number — we'll text you a code."}
            {step === "code" && `Enter the code we texted to ${phone}.`}
            {step === "details" && "This helps the legal team review your case."}
          </p>
        </div>

        {error ? (
          <p className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {step === "phone" && (
          <form onSubmit={sendCode} className="w-full space-y-4">
            <GlassInput type="tel" autoFocus placeholder="Phone number"
              icon={<Phone className="h-5 w-5" />} value={phone}
              onChange={(e) => setPhone(e.target.value)} required />
            <div className="flex justify-center pt-2">
              <GlassButton type="submit" disabled={busy} className="w-full [&>button]:w-full">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Text me a code"}
              </GlassButton>
            </div>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verify} className="w-full space-y-4">
            <GlassInput type="text" inputMode="numeric" autoFocus placeholder="6-digit code"
              icon={<KeyRound className="h-5 w-5" />} value={code}
              onChange={(e) => setCode(e.target.value)} required />
            <div className="flex justify-center pt-2">
              <GlassButton type="submit" disabled={busy} className="w-full [&>button]:w-full">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
              </GlassButton>
            </div>
            <button type="button" onClick={() => { setStep("phone"); setError(null); }}
              className="mx-auto flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Use a different number
            </button>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={finish} className="w-full space-y-3">
            <GlassInput placeholder="Full name" icon={<User className="h-5 w-5" />}
              value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <GlassInput type="email" placeholder="Email" icon={<Mail className="h-5 w-5" />}
              value={email} onChange={(e) => setEmail(e.target.value)} required />
            <GlassInput type="password" placeholder="Create a password (8+ chars)"
              icon={<Lock className="h-5 w-5" />} value={password}
              onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            <select value={caseType} onChange={(e) => setCaseType(e.target.value)}
              className="glass-control h-11 w-full rounded-full bg-transparent px-4 text-sm text-foreground focus:outline-none">
              {CASE_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <GlassInput placeholder="What happened? (short description)"
              value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-3">
              <GlassInput placeholder="Injury area" value={injuryArea}
                onChange={(e) => setInjuryArea(e.target.value)} />
              <GlassInput placeholder="City / ZIP" value={location}
                onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex justify-center pt-2">
              <GlassButton type="submit" disabled={busy} className="w-full [&>button]:w-full">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create my account"}
              </GlassButton>
            </div>
          </form>
        )}

        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Back
        </Link>
      </div>
    </AuthShell>
  );
}
