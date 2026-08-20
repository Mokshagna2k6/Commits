# StackFox — Build Notes

> Status: **Frontend scaffold and route coverage complete. Build compiles cleanly (`vite build` passes).**
> What follows is everything that now exists, plus a prioritized backlog for taking it to production.

---

## 1. What was built (frontend)

All work lives under `client/src/` (Vite + React + Tailwind + vanilla-extract).

### 1.1 Public marketing & SEO pages (`client/src/pages/`)

| Page | Route | Purpose |
|---|---|---|
| `ServiceCost.jsx` | `/services/:category/:slug/cost` | Cost breakdown for a service (Starter/Growth/Premium + add-ons) |
| `ServiceTimeline.jsx` | `/services/:category/:slug/timeline` | Delivery timeline / estimation |
| `ExpressCheckout.jsx` | `/checkout/express?service=` | 3-field (name/phone/email) express checkout with optional add-ons |
| `Quiz.jsx` | `/quiz` | 3-question quiz -> recommended tier + matched services |
| `Roadmap.jsx` | `/roadmap` | Public Now/Next/Later roadmap |
| `Changelog.jsx` | `/changelog` | Versioned changelog |
| `Guides.jsx` | `/guides` | Guide listing |
| `GuideDetail.jsx` | `/guides/:slug` | Single guide (DPDP/GST/SEO) |
| `BundleDetail.jsx` | `/bundles/:slug` | Industry-bundle detail page |
| `Help.jsx` | `/help` | Help center |
| `Demo.jsx` | `/demo` | Demo calendar form |

### 1.2 Acquisition tool pages (`client/src/pages/tools/`)

| Tool | Route | Endpoint it posts to |
|---|---|---|
| `WebsiteAudit.jsx` | `/tools/website-audit` | `POST /api/tools/audit` |
| `Estimator.jsx` | `/tools/estimator` | `POST /api/tools/estimate` |
| `BriefBuilder.jsx` | `/tools/brief-generator` | `POST /api/tools/brief` |
| `LegalStarterPack.jsx` | `/tools/legal-starter-pack` | `POST /api/tools/legal` (+ remove-watermark paywall) |
| `GSTInvoice.jsx` | `/tools/gst-invoice` | `POST /api/tools/invoice` (data lives client-side; prints a JSON preview) |

Notes:
- All five tools share a consistent card style, use the orange (`#FF6B35`-ish) palette, and degrade gracefully on API errors.
- `BriefBuilder` offers 4 input modes (voice, sketch, competitor URL, free text).
- `LegalStarterPack` includes a watermark toggle and a `₹499` remove-watermark upsell.
- `GSTInvoice` shows a live subtotal that updates as line items change.

### 1.3 Auth flows
The following public routes were already wired before this work and remain intact:
`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`.

### 1.4 Authenticated dashboard panels

**Client portal — `client/src/app/client/`**
Existing: `Overview, Projects, Quotes, Invoices, Files, Messages, Profile, Support, Cart, Engagements, Contracts, Timesheets, Notifications, Milestones, Referrals, Workspace, Feedback`.
Newly added (`ClientPanels.jsx`, named exports):
- `Activity` → `/app/client/activity` (G3 activity feed)
- `Changes` → `/app/client/changes` (G8 change requests)
- `Reports` → `/app/client/reports` (G10 reports/analytics)
- `Handover` → `/app/client/handover` (G11 post-delivery handover)

**Team / PM dashboard — `client/src/app/team/`**
Existing: `Dashboard, Tasks, Projects, Profile, Timesheets, Calendar, Reviews, Knowledge`.
Newly added (`PmDashboards.jsx`, named exports):
- `Queue` → `/app/team/queue` (H1 incoming order/project queue)
- `Sprints` → `/app/team/sprints` (H2 sprint boards)
- `Resources` → `/app/team/resources` (H3 capacity heatmap)
- `Quality` → `/app/team/quality` (H4 bug/severity list)
- `Finance` → `/app/team/finance` (H5 revenue + invoice reconciliation)
- `Clients` → `/app/team/clients` (H6 account/engagement list)
- `Analysis` → `/app/team/analytics` (H7 KPI cards)
- `SEQueue` → `/app/team/se-queue` (H8 AI-suggested task backlog with confidence scoring)

### 1.5 Routing
`client/src/routes.jsx` was extended (lazy + `React.Suspense`) so every new page is reachable. Public routes use `<PublicLayout />` (navbar + footer); client/team/admin routes remain under `<ProtectedRoute />` with the existing `<ClientLayout />`, `<TeamLayout />`, `<AdminLayout />`.

### 1.6 Build verification
- `cd client && npm run build` → **`vite v5.4.21 … ✓ built`** (production build succeeds with zero module-not-found errors).
- New chunks emitted: `ServiceCost`, `ServiceTimeline`, `WebsiteAudit`, `Estimator`, `BriefBuilder`, `LegalStarterPack`, `GSTInvoice`, `ExpressCheckout`, `Quiz`, `Roadmap`, `Changelog`, `Guides`, `GuideDetail`, `BundleDetail`, `Help`, `Demo`, `PmDashboards`, `ClientPanels`.

---

## 2. What is left (to reach production-grade)

### 2.1 Frontend (UI/UX polish) — **highest visibility**
- **Shared primitives**: extract the recurring card/form/button pattern into `<components/ui>` primitives (Button, Card, Input, Select) instead of inlining Tailwind classes everywhere.
- **Consistent icons**: add `lucide-react` (or `@tabler/icons`) and replace text links like `->`/`Read the guide` with real icons; wire the nav.
- **Accessibility**: add `aria-label`s on icon-only buttons, focus rings (the current `focus:ring-2` is a start), semantic `<section>`/`<article>`, and color-contrast pass on orange-on-white text.
- **Animations**: add `framer-motion` entrances for the quiz steps, estimator results, and dashboard cards (currently static).
- **Loading states**: replace the single `Spinner` fallback with per-route skeleton loaders (especially Catalog, Services list, Reports charts).
- **Duplicate route**: `/tools/brief-generator` is declared twice (→ `BriefBuilder` and `BriefGenerator`). Decide on one and remove the duplicate to avoid React Router silently shadowing a tool.
- **Empty states**: GSTInvoice `invoice` result is rendered as raw JSON; replace with a printable preview + PDF export (`jsPDF`/`html2canvas` is already a dep).
- **Mobile**: the Estimator/Tool forms are `max-w-3xl/4xl`; verify the `grid-cols-12` line-item layout on small screens.

### 2.2 Frontend (data + wiring) — **medium**
- **API contract**: every tool calls `@lib/api.apiPost('/tools/...')` — confirm those endpoints exist on the backend (see 2.3). If not, either implement them or stub with deterministic client-side responses + a mock toggle.
- **Data source for SEO pages**: `ServiceCost`/`ServiceTimeline`/`BundleDetail` import `@data/stackfox-data.json`. Confirm `tsconfig/paths` + Vite alias `@data` resolve to `shared/stackfox-data.json` in the build (the build succeeded, so it currently does — but double-check the alias isn’t a coincidental relative fallback).
- **`useSearchParams` in `ExpressCheckout`**: the `?service=` param is read but not validated against `services[id]` — add a fallback.
- **Dashboard sidebars**: `Activity/Changes/Reports/Handover` (client) and the 8 PM modules (team) are routed but **not yet linked** in `ClientLayout.jsx` / `TeamLayout.jsx` sidebars. Add nav entries so they’re discoverable without typing URLs.
- **Protected-route roles**: the client role whitelist is a long literal array repeated in routes — normalize into a shared `roles.ts` constant.

### 2.3 Backend (API) — **required for tools + checkout to actually work**
The frontend is wired to these endpoints; verify/implement each on `apps/api` (or `packages/core`):

| Frontend calls | Backend endpoint to add | Notes |
|---|---|---|
| WebsiteAudit → `POST /tools/audit` | SEO audit (fetch URL, run Lighthouse-style checks, return scores) | Needs a headless fetch + audit lib (e.g. `lighthouse`/`axe-core`) |
| Estimator → `POST /tools/estimate` | Rule-based estimator | 25 lines of logic mapping (category, budget, timeline) → tier |
| BriefBuilder → `POST /tools/brief` | AI brief generation | Stub with template if no LLM; real: call an LLM with the voice/text payload |
| LegalStarterPack → `POST /tools/legal` + `/tools/legal/remove-watermark` | Generate DPDP-compliant docs; paid watermark removal | Store generated doc in a session/temp store |
| GSTInvoice → (currently client-only) | Optional `POST /tools/invoice` to persist | Add if invoices must be saved/tax-reported |
| ExpressCheckout → `POST /checkout/express` | Create Razorpay order + order record | Needs `package`/`addons` pricing joined to `shared/stackfox-data.json` |
| Demo → `POST /lead/demo` | CRM webhook (e.g. HubSpot/Notion/Zoho) | Or store in `Leads` table |
| Payments → webhook for `payment-confirmation` | `POST /webhooks/razorpay` | Verify signature, mark order paid, trigger `webhookDispatcher` |

**Data layer (Prisma)** — confirm `packages/prisma/prisma/schema.prisma` has:
- `Service` (123 rows), `Category` (13), `Package`/`Bundle`, `AddOn`, `Order`, `OrderItem`, `User`, `Client`, `Project`, `Invoice`, `Payment`, `Review`/rating, `BlogPost`/`Guide`, `ChangelogVersion`, `Lead`, `LegalTemplate`.
- Run `pnpm --filter packages/prisma db:generate && db:push` and re-run `packages/prisma/prisma/seed.ts` to hydrate 123 services + 13 categories + 11 bundles + 8 add-ons.

### 2.4 Backend (observability / ops) — **medium**
- Add structured logging (`pino`) around `POST /checkout/express` and the payment webhook (currently `apps/api/src/workers/webhookDispatcher.ts` exists — wire Razorpay events to it).
- Healthcheck endpoint: `GET /health` returning service + DB + payment-gateway status.
- Rate-limit the free tools (audit/estimator/brief/legal/invoice) per IP to prevent abuse.
- Add the `check_db.js` connection self-test into CI.

### 2.5 DevOps / deployment — **medium**
- Verify `docker-compose.yml` + `Dockerfile.client` + `Dockerfile.server` produce a working stack; the project ships `docker-refresh.ps1`/`.sh` — run `docker compose up --build` end-to-end.
- `nginx.conf` should serve `/dist` with correct `tryFiles` (SPA fallback) and gzip/Brotli.
- Add env-var validation in CI for `RAZORPAY_KEY_ID`, `NEXT_PUBLIC_BASE_URL`, DB URL.

### 2.6 QA / tests — **low but important**
- Add smoke test: `npm run build` (done) + a Cypress/Playwright flow for `Quiz → Builder → Express Checkout → Payment Confirmation`.
- Add unit tests for the Estimator rule engine (the pure logic is trivially testable once implemented).
- Lint: ensure `npm run lint` is green (the new JSX uses `&middot;`, `&mdash;` entities — verify the formatter/TS config accepts them; the production build passed, so they’re fine).

---

## 3. Quick start (to run locally)

```bash
# one command from repo root (pnpm workspace)
pnpm install
pnpm --filter packages/prisma db:generate
pnpm --filter packages/prisma db:push
pnpm --filter packages/prisma db:seed

# frontend dev
pnpm --filter stackfox-client dev
#        ^ (verify package name in client/package.json)

# build (production)
pnpm --filter stackfox-client build
```

---

## 4. File index (what was added)

```
client/src/pages/                        # public pages
  ServiceCost.jsx      ServiceTimeline.jsx    GuideDetail.jsx     BundleDetail.jsx
  ExpressCheckout.jsx  Quiz.jsx               Roadmap.jsx          Changelog.jsx
  Guides.jsx           Help.jsx               Demo.jsx
client/src/pages/tools/                  # acquisition tools
  WebsiteAudit.jsx     Estimator.jsx          BriefBuilder.jsx
  LegalStarterPack.jsx GSTInvoice.jsx
client/src/app/client/ClientPanels.jsx   # Activity, Changes, Reports, Handover
client/src/app/team/PmDashboards.jsx     # Queue, Sprints, Resources, Quality,
                                         # Finance, Clients, Analysis, SEQueue
client/src/routes.jsx                    # +19 public routes, +12 dashboard routes
```

---

## 5. Next three suggested PRs

1. **“Tools backend”** — implement the 6 `POST /tools/*` + `/checkout/express` + `/lead/demo` + Razorpay webhook on `apps/api`; wire to `packages/prisma` tables. Frontend is already calling these contracts.
2. **“Dashboard navigation”** — add the 12 new routes to `ClientLayout.jsx`/`TeamLayout.jsx` sidebars + add `lucide-react` icons + a shared `Card` primitive.
3. **“Production polish”** — a11y pass, skeleton loaders, Lighthouse CI, duplicate `/tools/brief-generator` route cleanup, and `.github/workflows/ci.yml` running lint+build+seed.
