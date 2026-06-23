"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_INTERVAL_MS = 7000;
const HIGHLIGHT_MS = 2500;

type Identifiable = { id: string; updatedAt?: string };

export interface LiveList<T> {
  data: T[] | null;
  error: boolean;
  /** Ids that appeared or changed on the most recent poll (for a brief highlight). */
  changedIds: Set<string>;
  /** Force an immediate refresh (e.g. after a mutation like "Run follow-ups"). */
  refresh: () => Promise<void>;
}

/**
 * Near-real-time list without hard reloads. Polls `fetcher` on an interval and:
 *  - pauses while the browser tab is hidden, refetching the moment it's visible again;
 *  - refreshes silently (no loading flash — keeps the last good data on screen);
 *  - flags rows that appeared or changed (by id + `updatedAt`) so the UI can highlight them.
 * Re-runs immediately when `deps` change (e.g. filters) without flashing the whole list.
 *
 * This is what lets a freshly-ended call's lead appear and then enrich (name, score,
 * pipeline) in place, instead of the admin hard-reloading to see it.
 */
export function useLiveList<T extends Identifiable>(
  fetcher: () => Promise<T[]>,
  deps: unknown[],
  intervalMs: number = DEFAULT_INTERVAL_MS,
): LiveList<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  const [changedIds, setChangedIds] = useState<Set<string>>(() => new Set());

  // Latest fetcher without retriggering the effect every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const dataRef = useRef<T[] | null>(null);
  const sigRef = useRef<Map<string, string>>(new Map());
  const reqRef = useRef(0); // guards against out-of-order/stale responses
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async (baseline: boolean) => {
    const my = ++reqRef.current;
    try {
      const rows = await fetcherRef.current();
      if (my !== reqRef.current) return; // superseded by a newer run
      setError(false);
      const nextSig = new Map<string, string>();
      const changed = new Set<string>();
      for (const r of rows) {
        const sig = r.updatedAt ?? JSON.stringify(r);
        nextSig.set(r.id, sig);
        if (!baseline && sigRef.current.get(r.id) !== sig) changed.add(r.id);
      }
      sigRef.current = nextSig;
      dataRef.current = rows;
      setData(rows);
      if (changed.size) {
        setChangedIds(changed);
        if (clearRef.current) clearTimeout(clearRef.current);
        clearRef.current = setTimeout(() => setChangedIds(new Set()), HIGHLIGHT_MS);
      }
    } catch {
      if (my !== reqRef.current) return;
      if (dataRef.current === null) setError(true); // only surface errors before first data
    }
  }, []);

  useEffect(() => {
    // New deps (e.g. filters): re-baseline so the new set isn't flashed as "changed",
    // while keeping the old rows on screen until the new ones arrive (no loading flash).
    sigRef.current = new Map();
    void run(true);

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      timer ??= setInterval(() => { if (!document.hidden) void run(false); }, intervalMs);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const onVisibility = () => {
      if (document.hidden) stop();
      else { void run(false); start(); } // catch up immediately, then resume polling
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      reqRef.current++; // invalidate any in-flight run
      if (clearRef.current) clearTimeout(clearRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, intervalMs, ...deps]);

  const refresh = useCallback(() => run(false), [run]);
  return { data, error, changedIds, refresh };
}
