"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getLeads } from "@/lib/api";
import { LeadsTable } from "@/components/leads/leads-table";
import {
  PIPELINE_STATUSES,
  QUALIFICATION_STATUSES,
  LEAD_TEMPERATURES,
} from "@/lib/constants";
import type { LeadSummary } from "@/types/lead";

const SORTS = [
  { value: "updated", label: "Recently updated" },
  { value: "score", label: "Highest score" },
  { value: "value", label: "Highest value" },
  { value: "created", label: "Newest" },
];

function Select({ value, onChange, all, options, aria }: {
  value: string; onChange: (v: string) => void; all: string; options: readonly string[]; aria: string;
}) {
  return (
    <select aria-label={aria} value={value} onChange={(e) => onChange(e.target.value)}
            className="glass-control h-9 cursor-pointer rounded-full bg-transparent px-3 pr-8 text-sm text-foreground focus:outline-none">
      <option value="">{all}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [pipeline, setPipeline] = useState("");
  const [qualification, setQualification] = useState("");
  const [temperature, setTemperature] = useState("");
  const [sort, setSort] = useState("updated");

  // Debounce the search box; other filters apply immediately.
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(
    () => ({ q: debouncedQ, pipeline_status: pipeline, qualification_status: qualification, temperature, sort }),
    [debouncedQ, pipeline, qualification, temperature, sort],
  );

  useEffect(() => {
    let alive = true;
    setError(false);
    getLeads(params)
      .then((r) => { if (alive) setLeads(r); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [params]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Every intake lead with qualification, score and pipeline status.
        </p>
      </header>

      {/* Server-driven toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="glass-control flex h-9 w-full items-center gap-2 rounded-full px-3 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email…"
                 className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select aria="Filter by pipeline" value={pipeline} onChange={setPipeline} all="All stages" options={PIPELINE_STATUSES} />
          <Select aria="Filter by qualification" value={qualification} onChange={setQualification} all="All statuses" options={QUALIFICATION_STATUSES} />
          <Select aria="Filter by temperature" value={temperature} onChange={setTemperature} all="All temps" options={LEAD_TEMPERATURES} />
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}
                  className="glass-control h-9 cursor-pointer rounded-full bg-transparent px-3 pr-8 text-sm text-foreground focus:outline-none">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">Couldn&apos;t load leads. Is the API running?</p>
      ) : leads === null ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
