# METALLURG — Fixes & Hardening Backlog

Living action list from the 2026-08-16 project review. Each item has: what's wrong, where, why it matters, and a concrete fix. Ordered by priority within each section. Check items off (or delete them) as they land — this file should stay true to the current state of the code, not become another stale doc.

Workflow for anything here that touches code: new branch → implement → **ask Nikita first if it needs an API key / env var / secret** → he tests locally → commit/push → merge. See `CLAUDE.md`.

---

## 🔴 Critical — Security / Data Integrity

### 1. ~~Order total is trusted from the client~~ ✅ Done

Order creation now goes through the `create-order` edge function: it re-fetches live prices from `products`, validates stock, decrements it atomically via the `create_order()` Postgres RPC, and computes the total server-side. The client's cart total is display-only.

### 2. `contact-form` edge function is an open, unthrottled relay

**Where:** `supabase/functions/contact-form/index.ts`
**What:** `Access-Control-Allow-Origin: "*"`, no rate limiting, no captcha, no length caps on `name`/`message`, and the input is interpolated directly into a Telegram message sent with `parse_mode: "Markdown"`.
**Risk:** Anyone (not just from your site — any script anywhere) can spam your Telegram bot, and crafted input could break/inject Markdown formatting in the delivered message.
**Fix:** Add a length cap on `name`/`message`, rate-limit by IP (Supabase edge functions can check `x-forwarded-for` or use Upstash/KV), and either escape Telegram Markdown special characters or switch to `parse_mode: "HTML"` with escaping. CORS restriction alone won't stop a determined attacker (they can call the function directly, bypassing browser CORS) but still blocks casual abuse from other sites.

### 3. ~~Three of four edge functions aren't in this repo~~ ✅ Done

All six edge functions (`contact-form`, `track-order`, `notify-telegram`, `nova-poshta-track`, `create-order`, `nova-poshta-search`) are now vendored under `supabase/functions/` and deployed from the repo.

### 4. ~~RLS policies aren't verifiable from the codebase~~ ✅ Done

Policies for `products`/`orders`/`reviews` plus `is_admin()` are now committed as an idempotent snapshot (`supabase/migrations/20260819120000_rls_policy_snapshot.sql`). While auditing, found and dropped a live `"Public can insert orders"` policy that let the anon key insert directly into `orders` with an attacker-chosen price — a bypass of the `create-order` edge function from #1. Also ran `get_advisors` and pinned the missing `search_path` on `set_is_international` (`supabase/migrations/20260819120100_pin_search_path_set_is_international.sql`), closing a `function_search_path_mutable` warning.

---

## 🟡 Medium — Weak Points to Firm Up

### 5. ~~Guest order lookup exposes PII by order code alone~~ ✅ Already handled

Turns out `track-order` already rate-limits lookups (8 attempts / 10 min per IP, via the `lookup_attempts` table — discovered when vendoring it into the repo for #3). Order number entropy (~1.3 billion combinations) plus that rate limit is an acceptable guest-tracking tradeoff. No further action needed.

### 6. No tests anywhere in the repo

**What:** Zero test files. CI (`ci.yml`) only runs typecheck/lint/format/build — nothing verifies actual logic.
**Risk:** The checkout total math, order-number generation, and cart quantity clamping (`useCartStore.ts`) are exactly the kind of small pure functions that silently break during refactors.
**Fix:** Start small — Vitest + unit tests for `computeTotal`, `generateOrderNumber` (alphabet/length/prefix), and `serializeCartItems`. Wire `npm test` into `ci.yml` once it exists. Don't aim for full coverage immediately; cover the money-and-PII-adjacent logic first.

### 7. ~~No `.env.example`~~ ✅ Done

`.env.example` added in commit `39d0568` — lists all required vars with one-line comments.

### 8. ~~Duplicated / hardcoded edge function base URL~~ ✅ Done

`EDGE_FUNCTIONS_BASE_URL` now lives in `src/lib/constants/order.ts`; every edge function URL (`useContact.ts`, `useNpTracking.ts`, `useTrackOrder.ts`, plus the new `create-order`/`nova-poshta-search`) is built from it.

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
- `README.md` was stale template boilerplate — now replaced with project-specific content. `.github/copilot-instructions.md` was deleted (was unused GitHub Copilot scaffolding template).
- `ProductDetails.tsx` (357 lines) and `CheckoutModal.tsx` (317 lines) are getting large; consider splitting presentational sub-sections out as the feature set grows further, not urgent today.
- `set_is_international()` (Postgres trigger, see `supabase/migrations/20260819120100_pin_search_path_set_is_international.sql`) has inverted logic: it sets `is_international := (shipping_zone = 'Ukraine')`, i.e. the flag is `true` when the order is domestic, not international. Found during the #4 RLS audit; not fixed there since search_path pinning was the only in-scope change. Needs a look at every place `is_international` is read before flipping it, in case something already compensates for the inversion.

---

## Already done well (don't regress these)

- Order codes were already hardened once (commit `e6552a9`, "fixed edge functions in supa / authorization required / mtl code more strong") — the 6-char/33-alphabet scheme and edge function auth header were a deliberate fix, not an oversight.
- ESLint + Prettier + husky + lint-staged + commitlint are all wired correctly and enforced pre-commit. `supabase/` is excluded from ESLint via `globalIgnores` to prevent Deno import errors hanging the pre-commit hook.
- CI already typechecks, lints, format-checks, and builds on every PR to `main`.
