# citron-web-billing — Citron Billing & Usage dashboard

The **account subdomain** for Citron (`billing.citronos.com`). It hosts the
signed-in account experience — Overview, Usage, and Billing — that previously
lived under `/account` on citron-web.

Same look and feel as citron-web (shared `@citron-systems/citron-ds` design
system + identical tokens/components), but a focused, standalone Next.js app.

```
User ──► billing.citronos.com (this app)
            │  session  ─► identity (cookie / DEV_FAKE_SESSION)
            │  usage    ─► citron-api  /v1/usage/by-owner
            │  billing  ─► citron-api  /v1/billing/summary
            │  portal   ─► Stripe Customer Portal
            └  top-up   ─► Stripe Checkout ─► webhook (citron-web) ─► citron-api
```

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 + `@citron-systems/citron-ds`
- Stripe (Customer Portal + credit top-up checkout)

## Pages

| Route | What |
|-------|------|
| `/` | Overview — plan, credits remaining, local-AI actions, quick links |
| `/usage` | Credits meter, daily chart, per-model table, credit top-ups |
| `/billing` | Plan snapshot, Stripe portal, invoices, change-plan links |
| `/checkout/success` | Confirmation after a credit top-up |

## API routes (server-side)

| Route | Purpose |
|-------|---------|
| `GET /api/session` | Validate the shared identity session |
| `GET /api/usage` | Proxy citron-api usage for the signed-in user |
| `GET /api/billing/summary` | Proxy citron-api billing summary |
| `POST /api/billing/portal` | Open the Stripe Customer Portal |
| `POST /api/checkout` | Start a one-time credit top-up checkout |

## Local development

```bash
npm install
npm run dev     # http://localhost:3001
```

Requires the other services running:

- **citron-api** on `:8787` (usage/billing data)
- **citron-web** on `:3000` (owns the Stripe webhook that provisions purchases)
- optionally **identity** on `:3002/:5175` (or use `DEV_FAKE_SESSION=1`)

## Environment

Copy `.env.example` → `.env.local`. Key vars:

| Var | Meaning |
|-----|---------|
| `NEXT_PUBLIC_BILLING_URL` | Canonical URL of this app |
| `NEXT_PUBLIC_SITE_URL` | Main marketing site (pricing/cart links) |
| `NEXT_PUBLIC_IDENTITY_URL` / `IDENTITY_API_URL` | Auth portal + session validation |
| `SESSION_COOKIE_NAME` | Shared cookie (`citron_session`) |
| `DEV_FAKE_SESSION` | `1` to preview locally without identity |
| `CITRON_API_URL` / `CITRON_API_TOKEN` | Platform API (usage/billing source of truth) |
| `STRIPE_SECRET_KEY` | Customer Portal + top-up checkout |

## Deployment (production)

- Deploy to Vercel as its own project mapped to `billing.citronos.com`.
- Set the same `CITRON_API_TOKEN` as citron-api and citron-web.
- The shared `.citronos.com` session cookie makes the user sign in once and be
  recognised across `citronos.com` and `billing.citronos.com`.
