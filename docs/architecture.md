# METALLURG Architecture Reference

Deep reference for the codebase: what it is, how it's structured, what libraries do what, and how each piece of functionality works. Companion to `design-system.md` (design system) and `backlog.md` (known issues). Written 2026-08-16 — re-verify specifics (file line numbers, dependency versions) against the current code before relying on them, this is a snapshot.

---

## 1. What this is

METALLURG™ is a small e-commerce storefront for a streetwear/sportswear brand, presented as a "classified archive" / terminal aesthetic rather than a typical shop UI. Two shipping zones exist end-to-end in the product: **Ukraine** (local delivery via Nova Poshta) and **Switzerland** (international). Ordering is manual/offline-payment: a customer checks out, gets an order number, and pays out of band (bank transfer / other channel) — the storefront notifies the brand via Telegram and lets the customer track status and later leave a review once "completed".

There is no user authentication system. Every visitor is anonymous; orders and reviews are looked up by a short order code, not by account.

## 2. Stack & why each piece is there

| Layer            | Choice                                                                                                                                                                                                                                    | Notes                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Framework        | React 19 + TypeScript                                                                                                                                                                                                                     | `strict`-flavored TS via `tsconfig.app.json`                                                                                 |
| Build tool       | Vite 7                                                                                                                                                                                                                                    | `@vitejs/plugin-react` (Babel-based fast refresh), `@tailwindcss/vite` plugin                                                |
| Routing          | React Router 7                                                                                                                                                                                                                            | Single `<BrowserRouter>` in `main.tsx`, route table in `AnimatedRoutes.tsx`                                                  |
| Styling          | Tailwind CSS v4 (`@import "tailwindcss"` in `index.css`, no `tailwind.config.*` — v4 CSS-first config)                                                                                                                                    | shadcn/ui components generated with `components.json` (`style: "new-york"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`) |
| UI primitives    | `radix-ui` (via `Slot`, `select.tsx`, `slider.tsx`), `class-variance-authority` for variant props, `lucide-react` for icons                                                                                                               | shadcn convention: primitives wrapped in `src/components/ui/`                                                                |
| State            | `zustand` (+ `zustand/middleware persist` for cart/currency)                                                                                                                                                                              | No Redux/Context — each concern is its own tiny store under `src/stores/`                                                    |
| Backend          | `@supabase/supabase-js` client (`src/lib/supabase.ts`) talking directly to Postgres tables + Storage from the browser, plus Supabase **Edge Functions** (Deno) for anything that needs a secret (Telegram bot token, Nova Poshta API key) | No custom Node/Express backend — Supabase is the entire backend                                                              |
| Motion           | `motion` (Framer Motion successor/rebrand — imported as both `motion/react` and `framer-motion` depending on file, they're the same underlying package)                                                                                   | Page transitions, modal enter/exit, scroll-triggered reveals                                                                 |
| 3D / WebGL       | `@google/model-viewer` (GLB logo on the welcome gate), `ogl` (hand-written WebGL shader for the `Aurora` background effect)                                                                                                               |                                                                                                                              |
| Maps             | `react-leaflet` + `leaflet`                                                                                                                                                                                                               | Nova Poshta live tracking map (`NpTrackingPanel`), contact page map (`NetworkNodesMap`)                                      |
| PDF              | `@react-pdf/renderer`                                                                                                                                                                                                                     | Order receipt generation, lazy-loaded (see §5)                                                                               |
| Carousel         | `embla-carousel-react`                                                                                                                                                                                                                    | Product image slider, related products slider                                                                                |
| Toasts           | `react-hot-toast`                                                                                                                                                                                                                         | Wrapped in a custom hook (`useActionToast`) with a fully custom `toast.custom()` render, not the default toast UI            |
| Forms/validation | None — plain `useState` + manual `isFormValid` booleans throughout (no react-hook-form/zod)                                                                                                                                               |                                                                                                                              |

Path alias: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## 3. Folder structure

```
src/
  api/           Thin Supabase query functions, one file per resource (products.ts, reviews.ts)
  components/
    cart/        Cart line-item card
    checkout/    Checkout modal, PDF receipt document + its lazy download-link wrapper
    contact/     Contact page: `NetworkNodesMap` (leaflet map), static social links
    layout/      Navbar, Footer, BottomBar, Breadcrumbs, PageTransition, AnimatedRoutes (route table), ErrorState, GateGuard (currently unused — see backlog.md)
    product/     Product list/item/filters/skeletons/image slider/related products/size guide
    review/      Review card/list/modal
    search/      Global search modal
    tracking/    Order tracking modal + Nova Poshta live-status panel + step indicator
    ui/          shadcn primitives (button, select, slider) + bespoke effects (Aurora WebGL bg, encrypted-text scramble reveal, typing-animation, iphone mockup frame)
    index.ts     Barrel export (currently just Navbar + Footer — not all components are re-exported here)
  config/        theme.ts — light/dark Tailwind class tokens for pages that toggle Navbar variant
  hooks/         One hook per page/feature concern (see §5) — this is where almost all business logic and data-fetching lives, keeping pages/components close to presentational
  interfaces/    TypeScript types, one file per domain + an index.ts barrel
  lib/
    constants/   Static content and config, split by domain (navigation, site, filters, np, order, about, protocol, contact) — order.ts currently over-broad, see backlog.md #9
    supabase.ts  Supabase client singleton
    utils.ts     `cn()` (clsx + tailwind-merge) helper used everywhere for conditional classNames
  pages/         One component per route (see §4)
  stores/        Zustand stores: cart, currency, gate (unused)
  utils/         Pure functions: computeTotal, filterUtils, orderUtils (order number generation, price formatting, cart serialization), timeAgo
supabase/
  functions/     Only contact-form is committed here — see backlog.md #3 for the other three
```

## 4. Routes (`src/components/layout/AnimatedRoutes.tsx`)

All routes are wrapped in `<PageTransition>` (shared fade/slide-up) and rendered inside `<AnimatePresence mode="wait">` for cross-route exit animations, keyed by `location.pathname`.

| Path                                | Page                 | Purpose                                                                       |
| ----------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `/`                                 | `App.tsx`            | Landing/splash — video background, brand reveal, nav buttons                  |
| `/gate/mtl-ch-ua`                   | `WelcomeGate.tsx`    | Standalone "boot sequence" terminal splash with 3D logo (see §7)              |
| `/inventory`                        | `Shop.tsx`           | Product listing/catalog                                                       |
| `/product/:slug`                    | `ProductDetails.tsx` | Single product page                                                           |
| `/loadout` (`/cart` redirects here) | `Cart.tsx`           | Cart / bag                                                                    |
| `/contact`                          | `Contact.tsx`        | Contact form + map                                                            |
| `/about`                            | `About.tsx`          | Brand story, pillars, timeline, values                                        |
| `/protocol`                         | `Protocol.tsx`       | "Operational protocol" — policy/FAQ content styled as a classified document   |
| `/orders`                           | `Orders.tsx`         | Order tracking entry point + review submission entry point + all-reviews feed |
| `*`                                 | `NotFound.tsx`       | 404 with a glitch-text effect (`.notfound-glitch` in `index.css`)             |

Note: `/loadout` is the "real" cart route name (brand voice — cart items are your "loadout"); `/cart` exists only as a redirect, presumably for anyone typing the more obvious URL.

## 5. Hooks — where the logic actually lives

Each hook owns one page/feature's state + Supabase calls, keeping the corresponding page/component mostly presentational:

- **`useProductList`** — fetches all products (`getProducts`) once on mount.
- **`useProductDetails(slug)`** — fetches one product by slug, re-fetches on slug change.
- **`useFilters`** — local-only filter state (sort, sizes, price range, category), no URL sync.
- **`useDebounce`** — generic debounce utility, used for search input.
- **`useCheckout`** — the entire checkout flow: form state (name/contact/zone/city/np_branch), validity, submit (insert into `orders` + notify edge function), step machine (`form → submitting → success/error`). See `backlog.md` #1 for the client-trusted-total issue here.
- **`useTrackOrder`** — POSTs an order number to the `track-order` edge function, returns the order or a not-found error.
- **`useContact`** — contact form state + POST to `contact-form` edge function.
- **`useNpTracking(ttn)`** — POSTs a Nova Poshta tracking number to the `nova-poshta-track` edge function; reducer-based state machine (`idle/loading/success/error`).
- **`useAllReviews`** — fetches all reviews joined with order items (for the public reviews feed on `/orders`), computes average rating + count client-side.
- **`useReviewSubmission({isOpen, orderId})`** — checks whether an order already has a review (prevents duplicate reviews), handles image upload + review insert via `submitReview` (uploads to the `review-images` Storage bucket, then inserts a row referencing the resulting public URLs).
- **`useActionToast`** — not data-fetching, but centralizes the three toast variants (success/error/warning) as a fully custom-rendered `react-hot-toast` component (brand-styled card, not the default toast look).

## 6. Data model (inferred from `src/interfaces/*.ts` + `src/api/*.ts`)

**`products` table** (`ProductType`): `id`, `name`, `description?`, `price` (in UAH — see currency conversion below), `sizes` (numbers or strings), `stock_status` (`in_stock | out_of_stock | pre_order`), `is_new`, `slug`, `quantity`, `size_stock?` (per-size stock map, used for "LAST_X" low-stock badges), `image_url[]`, `materials?`, `weight?`, `condition?`, `box?`, `sku?`, `category?` (`apparel | footwear | accessories`).

**`orders` table** (`Order`): `order_number` (`MTL-XXXXXX`), `customer_name`, `contact`, `total_price`, `status` (`waiting_for_payment | paid | processing | shipped | completed | cancelled` — see `STATUS_LABELS`/`STATUS_COLORS` in `lib/constants/order.ts`), `current_status_index`, `is_international`, `tracking_number`, `shipping_zone` (`Ukraine | Switzerland`), `created_at`, `items[]` (denormalized snapshot of cart line items at order time: name/selectedSize/price/cart_quantity — see `serializeCartItems`).

**`reviews` table** (`Review`): `id`, `product_id?`, `order_id` (FK, one review per order — enforced client-side via `useReviewSubmission`, should also be enforced by a DB constraint/RLS policy), `author_name`, `rating`, `size_purchased?`, `body?`, `image_urls[]`, `created_at`. Review images go to the `review-images` Storage bucket under `${order_id}/${uuid}.${ext}`.

Currency: all prices are stored/entered in UAH. `useCurrencyStore` + `convertPrice`/`formatPrice` convert to CHF/EUR for display only, using **hardcoded exchange rates** (`CHF: 1/50`, `EUR: 1/45`) — these will drift from real rates over time and aren't fetched from any live source.

## 7. Notable functionality

- **Welcome gate (`WelcomeGate.tsx`)** — a standalone boot-sequence screen at `/gate/mtl-ch-ua` with a scripted terminal log (`BOOT_LINES`), a rotating 3D GLB logo (`@google/model-viewer`), CRT scanline + grain overlays, and a glitch transition out. Not currently wired into the main navigation flow as an actual access gate (see `GateGuard`/`useGateStore` note in §3 and `backlog.md`) — right now it's reachable as a standalone landing page, not a gatekeeper.
- **Checkout (`CheckoutModal` + `useCheckout`)** — multi-step modal (form → submitting → success/error), zone-conditional fields (city + Nova Poshta branch only for `Ukraine`), inserts into `orders`, then POSTs to the `notify-telegram` edge function so the brand gets pinged. On success, offers a downloadable PDF receipt (`ReceiptDownloadLink` → lazy-loaded `@react-pdf/renderer` document, kept out of the main bundle via `lazy()`/`Suspense`).
- **Order tracking (`TrackModal` + `useTrackOrder` + `NpTrackingPanel` + `useNpTracking`)** — customer enters an order number; if the order has a Nova Poshta tracking number, a second live-status panel renders using `react-leaflet` to plot city/warehouse coordinates and shows a step progression (`TrackStep`) driven by `INTERNATIONAL_ROUTE`/`LOCAL_ROUTE` in `lib/constants/order.ts`.
- **Reviews (`ReviewModal`, `ReviewList`, `ReviewCard`, `useAllReviews`, `useReviewSubmission`)** — gated behind order status: `Orders.tsx` looks the order up via `track-order` first and only allows opening the review modal if `status === "completed"`. Supports photo uploads.
- **Product filtering (`ProductFilters`, `useFilters`, `filterUtils.ts`)** — client-side filter/sort over the full product list (no server-side pagination/filtering — all products are fetched up front by `useProductList`).
- **Size guide (`SizeGuideModal`)** — static measurement reference modal, no data dependency.
- **Search (`SearchModal`)** — opened from `Navbar`, debounced client-side search over the already-fetched product list.
- **Currency switcher (`Navbar`)** — dropdown (UAH/CHF/EUR) backed by `useCurrencyStore`, persisted to localStorage, affects only display formatting (source of truth stays UAH).
- **Aurora background (`ui/Aurora.tsx`)** — a hand-rolled WebGL fragment shader (simplex noise aurora effect) rendered via `ogl`, independent of Tailwind/CSS — see `design-system.md` for where it's used.
- **Encrypted text reveal (`ui/encrypted-text.tsx`)** — scrambles-then-reveals text character by character using `requestAnimationFrame`, triggered on scroll-into-view (`useInView` from `motion`); used for the brand wordmark across the site (landing page, navbar logo, welcome gate).

## 8. Tooling & process

- **Linting/formatting:** ESLint (`eslint.config.js` — flat config, `typescript-eslint` recommended + `react-hooks` + `react-refresh`), Prettier (`.prettierrc`/`.prettierignore`), enforced pre-commit via `husky` + `lint-staged` (`npx lint-staged` on `pre-commit`).
- **Commit convention:** `commitlint.config.js` extends `@commitlint/config-conventional` — commits must be `type: message` (feat/fix/style/refactor/etc.), enforced via husky's `commit-msg` hook (implied by the config's presence).
- **CI (`.github/workflows/ci.yml`):** on push/PR to `main`/`develop` — `npm ci` → `tsc --noEmit` → `npm run lint` → `prettier --check .` → `npm run build` (build step injects `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY`/`EDGE_FUNCTION_URL` from repo secrets). No test step (no tests exist yet — see `backlog.md` #6).
- **Deploy:** Vercel (`vercel.json` — SPA rewrite, all paths → `index.html`).
- **Git flow:** `develop` → `main` via PRs (see commit history — multiple `Merge pull request #N from nlklfor/develop`). See `CLAUDE.md` for the branch/ask-before-secrets/local-test-before-merge rule going forward.

## 9. Known architectural gaps (cross-reference `backlog.md`)

- Checkout total is client-computed and client-trusted (`backlog.md` #1) — the single highest-priority item in the whole project.
- 3 of 4 edge functions live outside this repo (`backlog.md` #3) — meaning roughly half the "backend" isn't actually version-controlled here.
- No automated tests (`backlog.md` #6).
- `GateGuard`/`useGateStore` are dead code, not wired to any route.
