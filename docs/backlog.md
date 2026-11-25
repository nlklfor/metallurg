# METALLURG — Fixes & Hardening Backlog

Living action list, started with the 2026-08-16 project review and last updated 2026-11-24 (after the archive redesign, PRs #72–#81). Each item has: what's wrong, where, why it matters, and a concrete fix. Ordered by priority within each section. Check items off (or delete them) as they land — this file should stay true to the current state of the code, not become another stale doc.

Workflow for anything here that touches code: new branch → implement → **ask Nikita first if it needs an API key / env var / secret** → he tests locally → commit/push → merge. See `CLAUDE.md`.

---

## 🔴 Critical — Security / Data Integrity

### 1. ~~Order total is trusted from the client~~ ✅ Done

Order creation now goes through the `create-order` edge function: it re-fetches live prices from `products`, validates stock, decrements it atomically via the `create_order()` Postgres RPC, and computes the total server-side. The client's cart total is display-only.

### 2. `contact-form` edge function — mostly closed

**Where:** `supabase/functions/contact-form/index.ts`
**Done:** length caps (name 100 / email 254 / message 2000), per-IP rate limit through the shared `lookup_attempts` table, Telegram Markdown escaped (`escapeMarkdown`).
**Left:** `Access-Control-Allow-Origin: "*"`. Restrict it to the site origin(s) (`https://metallurg.vercel.app`, `http://localhost:5173`, later the custom domain). Small change, low risk; doesn't stop direct calls but blocks casual abuse from other sites.

### 3. ~~Three of four edge functions aren't in this repo~~ ✅ Done

All edge functions (`contact-form`, `track-order`, `nova-poshta-track`, `create-order`, `nova-poshta-search`) are vendored under `supabase/functions/` and deployed from the repo. `notify-telegram` was retired in 2026-10: `create-order` sends the owner alert itself.

### 4. ~~RLS policies aren't verifiable from the codebase~~ ✅ Done

Policies for `products`/`orders`/`reviews` plus `is_admin()` are now committed as an idempotent snapshot (`supabase/migrations/20260819120000_rls_policy_snapshot.sql`). While auditing, found and dropped a live `"Public can insert orders"` policy that let the anon key insert directly into `orders` with an attacker-chosen price — a bypass of the `create-order` edge function from #1. Also ran `get_advisors` and pinned the missing `search_path` on `set_is_international` (`supabase/migrations/20260819120100_pin_search_path_set_is_international.sql`), closing a `function_search_path_mutable` warning.

---

## 🟡 Medium — Weak Points to Firm Up

### 5. ~~Guest order lookup exposes PII by order code alone~~ ✅ Already handled

Turns out `track-order` already rate-limits lookups (8 attempts / 10 min per IP, via the `lookup_attempts` table — discovered when vendoring it into the repo for #3). Order number entropy (~1.3 billion combinations) plus that rate limit is an acceptable guest-tracking tradeoff. No further action needed.

### 6. ~~No tests anywhere in the repo~~ ✅ Done

Vitest is set up (`npm test`, runs in `ci.yml`). Tests cover `computeTotal`, `generateOrderNumber`, `serializeCartItems`, cart quantity/stock logic and the tracking helpers in `src/utils/trackUtils.ts` (`src/utils/__tests__/`). Add a test alongside any change to that logic (see `CLAUDE.md`).

### 7. ~~No `.env.example`~~ ✅ Done

`.env.example` added in commit `39d0568` — lists all required vars with one-line comments.

### 8. ~~Duplicated / hardcoded edge function base URL~~ ✅ Done

`EDGE_FUNCTIONS_BASE_URL` now lives in `src/lib/constants/order.ts`; every edge function URL (`useContact.ts`, `useNpTracking.ts`, `useTrackOrder.ts`, plus the new `create-order`/`nova-poshta-search`) is built from it.

### 9. `lib/constants/order.ts` mixes unrelated concerns

**Where:** `src/lib/constants/order.ts` — has a `// TODO: SPLIT THE CONSTANTS...` comment at the bottom already acknowledging this.
**Fix:** Split into `constants/shipping.ts` (zones, routes), `constants/status.ts` (labels/colors), `constants/api.ts` (edge function URLs, ties into #8).

### 10. No security headers on deploy

**Where:** `vercel.json` has rewrites and one `Cache-Control` rule, no security headers.
**Fix:** Add a `headers` block for `Content-Security-Policy` (at least `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. Low effort, closes off clickjacking/MIME-sniffing for free. A full CSP must allow the Supabase project, `tile.openstreetmap.org` (tracking map) and the `blob:`/`data:` images used by the review uploader.

---

## 🟢 Low — Nice to Have

- ~~`GateGuard` / `useGateStore` dead code~~ ✅ Removed in 2026-10 cleanup (along with `Aurora`, `NetworkNodesMap`, `iphone`, `App.css`).
- `.notfound-glitch` CSS (~60 lines in `index.css`) is unused since the 404 got the video hero; delete it in the next cleanup.
- `package.json` version is stuck at `0.0.0` — bump it or drop the field if you're not tracking releases.
- `README.md` was stale template boilerplate — now replaced with project-specific content. `.github/copilot-instructions.md` was deleted (was unused GitHub Copilot scaffolding template).
- `ProductDetails.tsx` (357 lines) and `CheckoutModal.tsx` (317 lines) are getting large; consider splitting presentational sub-sections out as the feature set grows further, not urgent today.
- `set_is_international()` (Postgres trigger, see `supabase/migrations/20260819120100_pin_search_path_set_is_international.sql`) has inverted logic: it sets `is_international := (shipping_zone = 'Ukraine')`, i.e. the flag is `true` when the order is domestic, not international. Found during the #4 RLS audit; not fixed there since search_path pinning was the only in-scope change. Needs a look at every place `is_international` is read before flipping it, in case something already compensates for the inversion.

---

## 🧩 After the redesign — open follow-ups

The archive redesign (design file "METALLURG™ — Archive Redesign", PRs #72–#81) is merged for every customer page. What it left open:

- **Privacy & Terms page.** Waiting for the lawyer's answers (ФОП details, personal-data wording, consumer-law terms). Needs a route, `ROUTE_META` entry and `<Seo />`, a footer link, and a checkbox/notice in checkout and the review form. Don't publish ФОП details until Nikita decides what goes on the site.
- **Status timestamps.** `TrackModal` shows one time stamp per order (`created_at`). Per-step times (paid, shipped, delivered) need a `status_history` (or `*_at` columns) written when the admin changes the status.
- **Reviews per product.** Reviews are tied to an order, and `ARCHIVE_REVIEWS` (`src/lib/constants/archiveReviews.ts`) are hardcoded. Showing reviews on the product page needs `product_id` filled reliably (one review per order line, or a picker in `ReviewModal`) and the archive reviews mapped to product slugs.
- **Review photos are crops of Instagram stories.** Fine for now. Replace with the customers' original photos if they send them.
- **`_reviews/` is gitignored** (customers' handles and chats). Keep it out of commits.
- **Leftover Switzerland mentions.** Zürich is gone from the copy and the zones are `Ukraine` / `International`, but the checkout country placeholder (`CheckoutModal`, "Switzerland"), the protocol text ("across Ukraine and Switzerland"), the About timeline and the CHF currency still mention it. Fine if Swiss customers stay a target; otherwise swap the wording.
- **Hardcoded exchange rates** (`useCurrencyStore`: CHF 1/50, EUR 1/45). They drift. Either update them by hand now and then or fetch a rate daily (cron + table).
- **Bundle size.** The production build warns about large chunks (`model-viewer`, leaflet, `@react-pdf` is already lazy). Lazy-load `WelcomeGate` and the tracking map when there's time.
- **Custom domain.** When it's bought: `VITE_SITE_URL`, `public/robots.txt`, the URLs in `index.html`, Search Console property, CORS list in #2.
- **Admin side** still has the old look; redesign it last.

---

## 📨 Telegram — bot and widgets

Repo: `tgBot-metallurg` (Python, separate from this one). Ideas collected in 2026-11:

**Bot polish**

- Avatar, description, short description and `/start` text in the brand voice (`// ACCESS_GRANTED`, WORD_WORD labels, `/` separators, no emoji walls).
- Menu button and commands list (`/track`, `/faq`, `/contact`) set with `setMyCommands`.
- Order-status messages from the bot use the same labels as the site (`STATUS_LABELS`).

**Widgets (Bot API 10.4, Nov 2026).** Small HTML/JS views inside a message; state ≤ 1 KB, bundle ≤ 4 KB compressed, private chats only, no network from the widget, payments in TON only. Methods: `sendWidget`, `editMessageWidgetData`, `answerWidgetQuery`.

1. **Live order tracker.** Today the bot already links a chat to an order (deep link `t.me/metallurgTm_bot?start=MTL-XXXXXX` from the confirmation screen → `orders.customer_chat_id`) and sends a new message on every status/TTN change (`notified_state`, 60 s loop). The widget version sends one tracker message (`sendWidget`) and updates it in place (`editMessageWidgetData`) — the same pipeline as `TrackModal`. Needs one more column, `orders.customer_widget_message_id`, and keeps a short plain message for each change so the customer still gets a notification.
2. **Drop countdown with NOTIFY_ME.** A widget counting down to a drop; the button calls `answerWidgetQuery`, the bot stores the subscriber and messages them when the drop opens. Needs a `drops` table (or a `drop_at` on products) and a cron.
3. **Auction bids (later).** Current bid + bid buttons inside the message. Depends on accounts/auctions on the site; payments can't go through the widget (TON only), so the widget only places bids and the payment stays manual.

---

## Already done well (don't regress these)

- Order codes were already hardened once (commit `e6552a9`, "fixed edge functions in supa / authorization required / mtl code more strong") — the 6-char/33-alphabet scheme and edge function auth header were a deliberate fix, not an oversight.
- ESLint + Prettier + husky + lint-staged + commitlint are all wired correctly and enforced pre-commit. `supabase/` is excluded from ESLint via `globalIgnores` to prevent Deno import errors hanging the pre-commit hook.
- CI typechecks, lints, format-checks, runs the unit tests and builds on every PR to `main`.
- Fonts are self-hosted (`@fontsource/*`), so local and production render the same type. Don't go back to Google Fonts links.
