// Firm-branded org resolution: which firm's login is this?
// Prod: the subdomain (firm-a.medlegal.app → "firm-a"). Dev: a fixed slug from
// env (stands in for the subdomain). Sent to the API as the X-Org-Slug header.

export function getOrgSlug(): string | null {
  const devSlug = process.env.NEXT_PUBLIC_DEV_ORG_SLUG ?? null;
  if (typeof window === "undefined") return devSlug;

  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (base) {
    const host = window.location.hostname;
    const suffix = `.${base}`;
    if (host.endsWith(suffix)) {
      const sub = host.slice(0, -suffix.length);
      if (sub && sub !== "www") return sub;
    }
  }
  return devSlug;
}
