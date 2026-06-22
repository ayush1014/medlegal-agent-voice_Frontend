"use client";

import { use, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { ApiError, getSignDoc, signDoc, type SignDoc } from "@/lib/api";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

// Public Letter-of-Representation e-sign page (the emailed magic-link). No login — the
// {code} in the URL authorizes this one signing session.
export default function SignPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [doc, setDoc] = useState<SignDoc | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getSignDoc(code)
      .then((d) => {
        setDoc(d);
        if (d.signed) {
          setDone(true);
          setName(d.signer_name ?? "");
        }
      })
      .catch(() => setDoc(null));
  }, [code]);

  async function onSign() {
    if (name.trim().length < 2) {
      setErr("Please type your full legal name to sign.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await signDoc(code, name.trim());
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Couldn't sign — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const firstName = name.trim().split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <BrandMark />
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {doc === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : doc === null ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <h1 className="mt-3 text-lg font-semibold text-foreground">This link is invalid or expired</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Please contact the firm for a new signing link.
            </p>
          </div>
        ) : done ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h1 className="mt-3 text-xl font-semibold text-foreground">
              You&apos;re all set{firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your Letter of Representation with {doc.firm} is signed. A copy has been emailed to you
              for your records.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <FileSignature className="mx-auto h-8 w-8 text-foreground" />
              <h1 className="mt-2 text-xl font-semibold text-foreground">Review &amp; sign your agreement</h1>
              <p className="text-sm text-muted-foreground">{doc.firm} · {doc.case_type}</p>
            </div>
            <div className="glass-card max-h-[48vh] overflow-auto rounded-2xl p-5">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
                {doc.lor_text.split("Client signature:")[0].trim()}
              </pre>
            </div>
            <div className="glass-card space-y-3 rounded-2xl p-5">
              <label className="block text-sm font-medium text-foreground">
                Type your full legal name to sign
              </label>
              <GlassInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full legal name"
              />
              <p className="text-xs text-muted-foreground">
                By typing your name and clicking Sign, you agree this is your electronic signature
                (U.S. ESIGN Act / UETA).
              </p>
              {err ? <p className="text-sm text-red-500">{err}</p> : null}
              <div className="flex">
                <GlassButton size="sm" disabled={busy} onClick={onSign}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />}
                  Sign agreement
                </GlassButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
