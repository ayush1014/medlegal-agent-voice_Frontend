"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FileWarning } from "lucide-react";
import type { LeadSummary } from "@/types/lead";
import { fmtCurrency, fmtDate, fmtRelative } from "@/lib/format";
import {
  QualificationBadge,
  TemperatureBadge,
  PipelineBadge,
  ScoreChip,
} from "@/components/leads/lead-badges";

// Pure presentational table — filtering/sorting is owned by the page (server-side).
export function LeadsTable({ leads, total }: { leads: LeadSummary[]; total?: number }) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <section className="glass-card min-w-0 rounded-2xl">
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <FileWarning className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No matching leads</p>
          <p className="text-xs text-muted-foreground">Try clearing the search or filters.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card min-w-0 rounded-2xl">
      {/* ---- Desktop table (lg+) ---- */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Lead</th>
              <th className="px-3 py-2.5 font-medium">Case type</th>
              <th className="px-3 py-2.5 font-medium">Qualification</th>
              <th className="px-3 py-2.5 text-center font-medium">Score</th>
              <th className="px-3 py-2.5 font-medium">Temp.</th>
              <th className="px-3 py-2.5 text-right font-medium">Settlement</th>
              <th className="px-3 py-2.5 font-medium">Pipeline</th>
              <th className="px-3 py-2.5 text-center font-medium">Docs</th>
              <th className="px-5 py-2.5 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr
                key={l.id}
                onClick={() => router.push(`/leads/${l.id}`)}
                className="cursor-pointer border-t border-border/40 transition hover:bg-foreground/[0.03]"
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-foreground">{l.fullName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{l.phone}</div>
                </td>
                <td className="px-3 py-3 text-foreground">{l.caseType}</td>
                <td className="px-3 py-3"><QualificationBadge status={l.qualificationStatus} /></td>
                <td className="px-3 py-3 text-center"><ScoreChip score={l.leadScore} /></td>
                <td className="px-3 py-3"><TemperatureBadge temperature={l.leadTemperature} /></td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">{fmtCurrency(l.settlementExpected)}</td>
                <td className="px-3 py-3"><PipelineBadge status={l.pipelineStatus} /></td>
                <td className="px-3 py-3 text-center">
                  {l.missingDocuments ? (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-50 px-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20">
                      {l.missingDocuments}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-xs text-muted-foreground">{fmtRelative(l.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Mobile cards (< lg) ---- */}
      <ul className="divide-y divide-border/40 lg:hidden">
        {leads.map((l) => (
          <li key={l.id}>
            <Link href={`/leads/${l.id}`} className="flex items-start gap-3 p-4 transition active:bg-foreground/[0.04]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">{l.fullName}</span>
                  <ScoreChip score={l.leadScore} />
                </div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">{l.phone}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l.caseType} · {fmtDate(l.incidentDate)}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <QualificationBadge status={l.qualificationStatus} />
                  <TemperatureBadge temperature={l.leadTemperature} />
                  <PipelineBadge status={l.pipelineStatus} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums text-foreground">{fmtCurrency(l.settlementExpected)}</span>
                  {l.missingDocuments ? (
                    <span className="text-amber-600 dark:text-amber-400">{l.missingDocuments} doc{l.missingDocuments > 1 ? "s" : ""} missing</span>
                  ) : (
                    <span>All docs in</span>
                  )}
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        <span>Showing {leads.length}{total != null && total !== leads.length ? ` of ${total}` : ""} lead{leads.length === 1 ? "" : "s"}</span>
      </div>
    </section>
  );
}
