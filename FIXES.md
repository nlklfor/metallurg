# METALLURG — Fixes & Hardening Backlog

Living action list from the 2026-08-16 project review. Each item has: what's wrong, where, why it matters, and a concrete fix. Ordered by priority within each section. Check items off (or delete them) as they land — this file should stay true to the current state of the code, not become another stale doc.

Workflow for anything here that touches code: new branch → implement → **ask Nikita first if it needs an API key / env var / secret** → he tests locally → commit/push → merge. See `CLAUDE.md`.

---

## 🔴 Critical — Security / Data Integrity

### 1. Order total is trusted from the client

**Where:** `src/hooks/useCheckout.ts:50-70`
**What:** `total_price` is computed in the browser from the Zustand cart (`computeTotal`, itself sourced from `localStorage`) and inserted straight into the Supabase `orders` table via `supabase.from("orders").insert(...)` using the public anon key. Nothing on the server recomputes the price from the `products` table.
**Risk:** Anyone can edit `localStorage` or intercept the request and submit an order at any price — including near-zero.
**Fix:** Move order creation behind an edge function (or a Postgres function/trigger) that takes only `product_id` + `size` + `quantity` per line, looks up the live price server-side, computes the total itself, and rejects the client-supplied total if present. The client should never be the source of truth for price.

### 2. `contact-form` edge function is an open, unthrottled relay

**Where:** `supabase/functions/contact-form/index.ts`
**What:** `Access-Control-Allow-Origin: "*"`, no rate limiting, no captcha, no length caps on `name`/`message`, and the input is interpolated directly into a Telegram message sent with `parse_mode: "Markdown"`.
**Risk:** Anyone (not just from your site — any script anywhere) can spam your Telegram bot, and crafted input could break/inject Markdown formatting in the delivered message.
**Fix:** Add a length cap on `name`/`message`, rate-limit by IP (Supabase edge functions can check `x-forwarded-for` or use Upstash/KV), and either escape Telegram Markdown special characters or switch to `parse_mode: "HTML"` with escaping. CORS restriction alone won't stop a determined attacker (they can call the function directly, bypassing browser CORS) but still blocks casual abuse from other sites.

### 3. Three of four edge functions aren't in this repo

**Where:** frontend calls `track-order`, `notify-telegram`, `nova-poshta-track` (see `src/lib/constants/order.ts`, `src/hooks/useNpTracking.ts`, `src/hooks/useTrackOrder.ts`) but only `contact-form` exists under `supabase/functions/`.
**Risk:** No code review, no version history, no way to verify these functions validate input, rate-limit, or check auth. They're also invisible to anyone else who ever works on this project.
**Fix:** Pull the source for these three functions into `supabase/functions/<name>/index.ts` in this repo (Supabase CLI: `supabase functions download <name>` if not stored locally, or copy from the dashboard) and deploy from the repo going forward.

### 4. RLS policies aren't verifiable from the codebase

**What:** All client tables (`products`, `orders`, `reviews`) are read/written directly from the browser via the anon key, which means table-level security is _entirely_ delegated to Supabase Row Level Security policies that live in the Supabase dashboard, not in this repo.
**Risk:** A single misconfigured policy (e.g., `SELECT` allowed on all columns of `orders`, or `UPDATE` allowed on `status`) could leak customer PII or let anyone mark their own order "paid"/"completed".
**Fix:** Export current RLS policies into a migrations folder (`supabase/migrations/`) and commit them, so policy changes are reviewable diffs like everything else. At minimum, verify: `orders` has no public `SELECT`/`UPDATE` (only the edge functions using the service-role key should touch it), and `reviews` insert is restricted to rows where a matching completed `order_id` exists.

---

## 🟡 Medium — Weak Points to Firm Up

### 5. Guest order lookup exposes PII by order code alone

**Where:** `track-order` edge function (not in repo — see #3), called from `src/hooks/useTrackOrder.ts` and `src/pages/Orders.tsx`.
**What:** Order number is `MTL-` + 6 chars from a 33-char alphabet (~1.3 billion combinations — reasonable entropy), and knowing it alone returns `customer_name`, `contact`, shipping city/branch, items, and total price.
**Risk:** Not a high-probability brute-force target given the entropy, but there's no visible rate limiting on the lookup endpoint, and it's a fairly standard "guest tracking" tradeoff many stores accept. Worth confirming the edge function rate-limits lookups (ties into #3).
**Fix:** Once #3 lands, add basic rate limiting to `track-order` (e.g., N requests/minute per IP) so brute-forcing isn't free even at low probability of success.

### 6. No tests anywhere in the repo

**What:** Zero test files. CI (`ci.yml`) only runs typecheck/lint/format/build — nothing verifies actual logic.
**Risk:** The checkout total math, order-number generation, and cart quantity clamping (`useCartStore.ts`) are exactly the kind of small pure functions that silently break during refactors.
**Fix:** Start small — Vitest + unit tests for `computeTotal`, `generateOrderNumber` (alphabet/length/prefix), and `serializeCartItems`. Wire `npm test` into `ci.yml` once it exists. Don't aim for full coverage immediately; cover the money-and-PII-adjacent logic first.

### 7. No `.env.example`

**What:** `.gitignore` excludes `.env`, correctly, but there's no template listing which vars are required (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `EDGE_FUNCTION_URL`, and whatever the uncommitted edge functions need on the server side: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, likely a Nova Poshta API key).
**Fix:** Add `.env.example` with variable names and one-line comments (no real values). Referenced from `README.md`.

### 8. Duplicated / hardcoded edge function base URL

**Where:** The full Supabase project URL (`https://ytynsqcxteyufoynvsir.supabase.co/functions/v1/...`) is hardcoded independently in `src/hooks/useContact.ts`, `src/hooks/useNpTracking.ts`, `src/hooks/useTrackOrder.ts`, and `src/lib/constants/order.ts` — the last two even duplicate the exact same `track-order` URL in two separate places.
**Risk:** If the Supabase project URL ever changes (migration, new environment), four files need editing and it's easy to miss one.
**Fix:** Add one `EDGE_FUNCTIONS_BASE_URL` (from `import.meta.env.VITE_SUPABASE_URL` + `/functions/v1`) in `src/lib/constants/`, and build each endpoint URL from it.

### 9. `lib/constants/order.ts` mixes unrelated concerns

**Where:** `src/lib/constants/order.ts` — has a `// TODO: SPLIT THE CONSTANTS...` comment at the bottom already acknowledging this.
**Fix:** Split into `constants/shipping.ts` (zones, routes), `constants/status.ts` (labels/colors), `constants/api.ts` (edge function URLs, ties into #8).

### 10. No security headers on deploy

**Where:** `vercel.json` only has SPA rewrites, no headers.
**Fix:** Add a `headers` block for `Content-Security-Policy` (at least `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. Low effort, closes off clickjacking/MIME-sniffing for free.

---

## 🟢 Low — Nice to Have

- `src/components/layout/GateGuard.tsx` and `src/stores/useGateStore.ts` are unused dead code — no route imports `GateGuard`, and `/gate/mtl-ch-ua` (`WelcomeGate.tsx`) is reachable directly without ever calling `unlock()`. Either wire it up (if the intent is to gate `/inventory` etc. behind the welcome sequence) or delete it.
- `package.json` version is stuck at `0.0.0` — bump it or drop the field if you're not tracking releases.
- `README.md` and `.github/copilot-instructions.md` were stale/template boilerplate — now replaced (see `README.md`, and consider deleting `copilot-instructions.md` if you don't use GitHub Copilot's workspace scaffolding feature).
- `ProductDetails.tsx` (357 lines) and `CheckoutModal.tsx` (317 lines) are getting large; consider splitting presentational sub-sections out as the feature set grows further, not urgent today.

---

## Already done well (don't regress these)

- Order codes were already hardened once (commit `e6552a9`, "fixed edge functions in supa / authorization required / mtl code more strong") — the 6-char/33-alphabet scheme and edge function auth header were a deliberate fix, not an oversight.
- ESLint + Prettier + husky + lint-staged + commitlint are all wired correctly and enforced pre-commit.
- CI already typechecks, lints, format-checks, and builds on every PR to `main`.
