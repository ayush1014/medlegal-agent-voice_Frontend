// Display formatters. Kept tiny and dependency-free so they're cheap to call in
// table cells. All return strings safe to render directly.

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function fmtCurrency(n?: number): string {
  if (n === undefined || n === null) return "—";
  return USD.format(n);
}

// Compact settlement range like "$15k–$75k" for dense table cells.
export function fmtCurrencyRange(low?: number, high?: number): string {
  if (low === undefined && high === undefined) return "—";
  const k = (v?: number) =>
    v === undefined ? "?" : v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`;
  return `${k(low)}–${k(high)}`;
}

export function fmtNumber(n?: number): string {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("en-US").format(n);
}

// Short human date: "Jun 12, 2026". Accepts an ISO string or undefined.
export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  // A date-only string ("YYYY-MM-DD") is parsed as UTC midnight by `new Date`, which
  // shifts it a day earlier in negative-offset timezones. Parse those as LOCAL.
  // Full timestamps (with time/zone) parse correctly as-is.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Relative-ish "time ago" for last-contact columns. Coarse on purpose.
export function fmtRelative(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const day = 86_400_000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmtDate(iso);
}
