"use client";

import { useEffect, useState } from "react";
import { Phone, Bot, CheckCircle2, XCircle, Loader2, Save } from "lucide-react";
import { getOrgSettings, patchOrgSettings, ApiError } from "@/lib/api";
import type { OrgSettings } from "@/lib/api";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-xs">
        {detail ? <span className="font-mono text-muted-foreground">{detail}</span> : null}
        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-zinc-400" />}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState<OrgSettings | null>(null);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [intake, setIntake] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    getOrgSettings()
      .then((res) => { setS(res); setName(res.profile.name ?? ""); setIntake(res.profile.intake_phone ?? ""); })
      .catch(() => setError(true));
  }, []);

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      await patchOrgSettings({ name, intake_phone: intake });
      setFlash("Saved.");
    } catch (e) {
      setFlash(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <div className="mx-auto w-full max-w-3xl"><p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">Couldn&apos;t load settings.</p></div>;
  }
  if (!s) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your firm&apos;s profile and review integrations.</p>
      </header>

      {/* Firm profile (editable) */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground">Firm profile</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Firm name</label>
            <GlassInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Firm name" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Intake phone number</label>
            <GlassInput value={intake} onChange={(e) => setIntake(e.target.value)} placeholder="+1…" icon={<Phone className="h-4 w-4" />} />
          </div>
          <p className="text-xs text-muted-foreground">Firm slug: <span className="font-mono">{s.profile.slug}</span></p>
          <div className="flex items-center gap-3 pt-1">
            <GlassButton size="sm" disabled={saving} onClick={save}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
            </GlassButton>
            {flash ? <span className="text-xs text-muted-foreground">{flash}</span> : null}
          </div>
        </div>
      </section>

      {/* Provisioned numbers */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Phone className="h-4 w-4 text-muted-foreground" /> Provisioned numbers</h2>
        {s.phone_numbers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No numbers provisioned.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {s.phone_numbers.map((n) => (
              <li key={n.e164} className="flex items-center justify-between text-sm">
                <span className="font-mono text-foreground">{n.e164}</span>
                {n.is_primary ? <span className="text-xs text-emerald-600 dark:text-emerald-400">Primary</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Integration status (read-only) */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Bot className="h-4 w-4 text-muted-foreground" /> Integrations &amp; AI</h2>
        <div className="mt-3 divide-y divide-border/40">
          <StatusRow label="Twilio (telephony)" ok={s.integrations.twilio_configured} />
          <StatusRow label="WhatsApp sender" ok={s.integrations.whatsapp_sender_configured} />
          <StatusRow label="Voice agent bridge (LiveKit SIP)" ok={s.integrations.voice_bridge_configured} />
          <StatusRow label="Realtime model" ok detail={s.integrations.realtime_model} />
          <StatusRow label="Extraction model" ok detail={s.integrations.extraction_model} />
          <StatusRow label="Embeddings" ok detail={s.integrations.embedding_model} />
        </div>
      </section>
    </div>
  );
}
