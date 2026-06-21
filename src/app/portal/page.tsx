"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, FileText, Loader2, Upload, FileSignature } from "lucide-react";
import { getMyCase, uploadMyDocument, signMyRetainer, ApiError } from "@/lib/api";
import type { PortalCase } from "@/lib/api";
import { fmtDate, fmtRelative } from "@/lib/format";
import { GlassButton } from "@/components/ui/glass-button";
import { PipelineBadge, RetainerBadge } from "@/components/leads/lead-badges";
import type { PipelineStatus, RetainerStatus } from "@/types/lead";

type Row = Record<string, unknown>;
const S = (o: Row | null | undefined, k: string) => (o && o[k] != null ? String(o[k]) : undefined);

export default function PortalPage() {
  const [data, setData] = useState<PortalCase | null | undefined>(undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    getMyCase().then(setData).catch(() => setData(null));
  }, []);
  useEffect(load, [load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("upload");
    setFlash(null);
    try {
      await uploadMyDocument(file);
      setFlash("Uploaded — thank you!");
      load();
    } catch (err) {
      setFlash(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSign() {
    setBusy("sign");
    setFlash(null);
    try {
      await signMyRetainer();
      setFlash("Signed — welcome aboard!");
      load();
    } catch (err) {
      setFlash(err instanceof ApiError ? err.message : "Could not sign");
    } finally {
      setBusy(null);
    }
  }

  if (data === undefined) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (data === null || !data.lead) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
        We couldn&apos;t find your case yet. Please check back shortly.
      </div>
    );
  }

  const lead = data.lead;
  const firstName = (S(lead, "full_name") ?? "there").split(" ")[0];
  const retainerStatus = (S(lead, "retainer_status") as RetainerStatus) ?? "Not Ready";
  const canSign = data.retainer && ["Sent", "Viewed"].includes(S(data.retainer, "status") ?? "");
  const pending = data.document_requests.filter((r) => !["Received", "Waived"].includes(S(r, "status") ?? ""));

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hi {firstName}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s the status of your case.</p>
      </header>

      {flash ? <p className="glass-card rounded-2xl px-4 py-2 text-sm text-foreground">{flash}</p> : null}

      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Case type</div>
            <div className="text-base font-medium text-foreground">{S(lead, "case_type")}</div>
          </div>
          <PipelineBadge status={(S(lead, "pipeline_status") as PipelineStatus) ?? "New Lead"} />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated <span className="text-foreground">{fmtRelative(S(lead, "updated_at"))}</span>
        </div>
      </section>

      {/* Documents */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4" /> Documents
        </h2>
        {data.document_requests.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No documents requested yet. We&apos;ll let you know if we need anything.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {data.document_requests.map((r, i) => {
              const received = ["Received", "Waived"].includes(S(r, "status") ?? "");
              return (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    {received ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    {S(r, "document_type")}
                  </span>
                  <span className="text-xs text-muted-foreground">{received ? "Received" : "Needed"}</span>
                </li>
              );
            })}
          </ul>
        )}

        {data.documents.length ? (
          <div className="mt-3 border-t border-border/60 pt-3">
            <p className="mb-1.5 text-xs text-muted-foreground">You&apos;ve uploaded</p>
            <ul className="space-y-1">
              {data.documents.map((d, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{S(d, "file_name")}</span>
                  <span className="text-xs text-muted-foreground">{fmtRelative(S(d, "created_at"))}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4">
          <input ref={fileRef} type="file" className="hidden" onChange={onUpload}
                 accept="image/*,application/pdf" />
          <GlassButton size="sm" disabled={!!busy} onClick={() => fileRef.current?.click()}>
            {busy === "upload" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {pending.length ? `Upload a document (${pending.length} needed)` : "Upload a document"}
          </GlassButton>
        </div>
      </section>

      {/* Representation */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4" /> Representation
        </h2>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          Status: <RetainerBadge status={retainerStatus} />
        </div>
        {canSign ? (
          <div className="mt-4">
            <GlassButton size="sm" disabled={!!busy} onClick={onSign}>
              {busy === "sign" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSignature className="h-3.5 w-3.5" />}
              Review &amp; sign your agreement
            </GlassButton>
          </div>
        ) : retainerStatus === "Signed" ? (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Signed — your legal team is on it.</p>
        ) : null}
      </section>
    </div>
  );
}
