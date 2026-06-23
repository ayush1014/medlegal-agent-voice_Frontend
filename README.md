# medlegal-agent-voice — Frontend

The web app for **MedLegal**, an AI voice-intake and lead-management platform for **Personal Injury (PI) law firms**. It has two faces:

- **Firm admin dashboard** — the team's live view of every intake: leads, scores, qualification, settlement estimates, the document pipeline, analytics, and Letter-of-Representation status.
- **Client portal & e-sign** — where an injured caller (now a lead) tracks their case, uploads documents, and **signs their LOR** from a no-login magic link.

It's a **Next.js (App Router)** app with a custom **liquid-glass** design system, talking to the FastAPI backend in `medlegal-agent-voice_Backend`.

---

## Tech stack

| | |
| --- | --- |
| Framework | **Next.js 16** (App Router) · **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + a bespoke liquid-glass system (`src/app/glass.css`) · light/dark themes |
| Data | Native `fetch` via a thin typed client (no SWR/React-Query) with **auto-refresh** + **live polling** |
| Icons | lucide-react |
| Deploy | **Vercel**, proxying `/api/*` to the backend |

---

## How it talks to the backend

The browser **only ever talks to this origin**. A Next.js rewrite proxies the API server-side, so cookies are first-party (no cross-site cookie blocking) and no CORS is needed:

```
browser ──▶ vercel.app/api/*  ──(Next.js rewrite)──▶  BACKEND_ORIGIN/api/*
```

Set the target with `BACKEND_ORIGIN` (defaults to the VPS). All requests go through one thin client, `src/lib/api/client.ts`:

- **`apiFetch` / `apiUpload`** — attach the firm slug (`X-Org-Slug`), send cookies, and echo the CSRF token on mutations (double-submit).
- **Auto-refresh** — on a `401`, a single-flight call to `/api/auth/refresh` silently renews the short-lived access token (from the 30-day refresh cookie) and retries the request once, so a session lasts the full refresh window instead of dying at 15 minutes.
- **`apiUrl(path)`** — absolute backend URL for resources the browser loads directly (e.g. an `<img>`/`<iframe>` for a stored document), so their cookies match the backend origin.

Typed endpoint wrappers live in `src/lib/api.ts` (`getLeads`, `getLead`, `runFollowups`, `getSignDoc`/`signDoc`, portal calls, analytics, …). Auth flows (`login`, `me`, `refresh`, OTP, client signup) live in `src/lib/auth/`.

---

## Live updates (no hard reload)

The leads table and the dashboard pipeline poll in the background via **`src/lib/hooks/use-live-list.ts`**:

- refreshes every ~7s **silently** (no loading flash; keeps the last good data),
- **pauses while the tab is hidden** and catches up the instant it's visible,
- **flags rows that appeared or changed** (diffed by id + `updatedAt`) so the table briefly **highlights** them.

This is what lets a freshly-ended call's lead appear and then **enrich in place** (`Caller +number` → real name, score, pipeline) with a soft emerald flash — the admin never reloads to see new or updated leads, and the dashboard KPI cards (derived from the same list) tick live too.

---

## App structure

```
src/
  app/
    (app)/                 # authenticated firm dashboard (sidebar layout)
      dashboard/           #   KPI cards + live lead pipeline + "Run follow-ups"
      leads/               #   filterable/searchable leads table (live)
      leads/[id]/          #   lead detail: AI summary + attorney brief, transcript,
                           #     documents (cards + in-UI viewer), lead intelligence, LOR
      analytics/           #   funnel + pipeline analytics
      intake/ · settings/
    (auth)/                # public auth screens (gradient + glass card)
      login/               #   firm staff sign-in (email + password)
      client/              #   client phone-first OTP login / signup (+ "call us now" line)
      sign/[code]/         #   public LOR e-sign magic link (no login → type name → done)
    portal/                # logged-in client portal (case status, document upload)
    onboarding/            # firm provisioning
    layout.tsx · page.tsx · globals.css · glass.css
  components/
    ui/                    # liquid-glass primitives (glass-button, glass-input, ...)
    leads/                 # leads-table (live highlight), lead-badges
    dashboard/ · analytics/ · auth/ · layout/   # stat cards, charts, auth shell/provider, nav
    brand.tsx · theme-provider.tsx · theme-toggle.tsx
  lib/
    api/client.ts          # fetch client: X-Org-Slug, CSRF, auto-refresh-on-401, apiUrl
    api.ts                 # typed endpoint wrappers
    auth/                  # login / me / refresh / OTP / client signup; CSRF bootstrap
    hooks/use-live-list.ts # background polling + change-highlight
    org.ts · format.ts · constants.ts · utils.ts
```

---

## Configuration

```bash
# .env.local
BACKEND_ORIGIN=http://localhost:8000        # the FastAPI backend the /api proxy targets
NEXT_PUBLIC_DEV_ORG_SLUG=demo               # firm slug sent as X-Org-Slug in dev
# NEXT_PUBLIC_API_BASE_URL=                 # leave empty in prod (uses the same-origin /api proxy)
```

In production on Vercel, `BACKEND_ORIGIN` points at the backend and `NEXT_PUBLIC_API_BASE_URL` is left unset so the browser uses the same-origin proxy.

---

## Setup & run

```bash
cd medlegal-agent-voice_Frontend
npm install
npm run dev        # http://localhost:3000  (needs the backend running on :8000)
```

```bash
npm run build && npm run start   # production build
npm run lint                     # eslint
npx tsc --noEmit                 # typecheck
```

Demo firm (after the backend's `seed_demo`): admin **demo@example.com / demodemo123** at `/login`.

---

## Design system

The liquid-glass look (frosted surfaces, the signature conic-gradient glass edge, soft shadows) lives in `src/app/glass.css` as a small set of composable classes — `.glass-card`, `.glass-control`, `.glass-button`, `.glass-pop`, plus the animated gradient backdrop and the `lead-flash` highlight. UI primitives (`GlassButton`, `GlassInput`, …) wrap them so pages stay declarative. It supports light + dark themes and respects `prefers-reduced-motion`.

---

## Roadmap — next iterations

Frontend-facing pieces of where the platform goes next (the engine work is detailed in the backend README):

### 1. Live call console (multi-agent telephony)
A real-time view of in-progress calls — live transcript, the lead populating field-by-field, current score/qualification — with **human-in-the-loop** controls (listen / whisper / take over) and visibility into **warm transfers** between specialist agents (medical / insurance / legal).

### 2. Agentic follow-up cockpit
A UI for the LLM follow-up agent: see exactly which fields each lead is missing, the personalized email/SMS the agent sent, the client's parsed replies, and one-click escalation to an **outbound AI call** — replacing today's fire-and-forget reminders with a visible, steerable loop.

### 3. Explainable, research-backed settlement estimates
Surface the **live web research** behind each estimate — comparable verdicts/settlements for the injury and jurisdiction, medical-cost benchmarks, and citations — with the confidence band and the factors driving the number, so an attorney can trust and adjust it.

### 4. Real-time everywhere (SSE upgrade)
Upgrade the polling layer to **Server-Sent Events** for sub-second updates on the dashboard and lead detail (keeping polling as the graceful fallback), plus toast notifications for new hot leads and signed retainers.

### 5. Richer document & case workspace
In-browser annotation of uploaded medical bills/records, an auto-built **treatment timeline**, a damages worksheet fed by structured extraction, and document-completeness progress per lead.

### 6. Firm experience
A certified e-sign flow (DocuSign / Dropbox Sign) in place of the internal LOR, **white-label** per-firm theming (logo, colors, voice), pipeline forecasting and source-attribution dashboards, agent QA scorecards, Spanish/multilingual UI, and deeper accessibility passes.
```
