# METALLURG Architecture Reference

Deep reference for the codebase: what it is, how it's structured, what libraries do what, and how each piece of functionality works. Companion to `design-system.md` (design system) and `backlog.md` (known issues). Written 2026-08-16, updated 2026-11-24 after the archive redesign — re-verify specifics (file line numbers, dependency versions) against the current code before relying on them, this is a snapshot.

---

## 1. What this is

METALLURG™ is a small e-commerce storefront for a streetwear/sportswear brand, presented as a "classified archive" / terminal aesthetic rather than a typical shop UI. Two shipping zones exist end-to-end in the product: **Ukraine** (local delivery via Nova Poshta) and **International**. Ordering is manual/offline-payment: a customer checks out, gets an order number, and pays out of band (bank transfer / other channel) — the storefront notifies the brand via Telegram and lets the customer track status and later leave a review once "completed".

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
| Motion           | `motion` (Framer Motion successor, imported everywhere as `motion/react`)                                                                                                                                                                 | Page transitions, modal enter/exit, scroll-triggered reveals                                                                 |
| 3D / WebGL       | `@google/model-viewer` (GLB logo on the welcome gate)                                                                                                                                                                                     |                                                                                                                              |
| Maps             | `react-leaflet` + `leaflet`                                                                                                                                                                                                               | Tracking route map (`NpTrackingPanel`), OpenStreetMap tiles darkened with CSS; city coords from `src/lib/uaCities.ts`        |
| PDF              | `@react-pdf/renderer`                                                                                                                                                                                                                     | Order receipt generation, lazy-loaded (see §5)                                                                               |
| Carousel         | `embla-carousel-react`                                                                                                                                                                                                                    | Product image slider, related products slider                                                                                |
| Fonts            | `@fontsource/ibm-plex-mono`, `@fontsource/archivo-black` (imported in `main.tsx`); TheNeue self-hosted in `src/assets/fonts/`                                                                                                             | No Google Fonts requests                                                                                                     |
| Tests            | Vitest (`npm test`)                                                                                                                                                                                                                       | Unit tests in `src/utils/__tests__/`, run in CI                                                                              |
| Toasts           | `react-hot-toast`                                                                                                                                                                                                                         | Wrapped in a custom hook (`useActionToast`) with a fully custom `toast.custom()` render, not the default toast UI            |
| Forms/validation | None — plain `useState` + manual `isFormValid` booleans throughout (no react-hook-form/zod)                                                                                                                                               |                                                                                                                              |

Path alias: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## 3. Folder structure

```
src/
  api/           Thin Supabase query functions, one file per resource (products.ts, reviews.ts)
  components/
    brand/       Wordmark (TheNeue + encrypted-text reveal)
    cart/        Cart line-item card, LoadoutDrawer
    checkout/    Checkout modal, Nova Poshta city/branch combobox, PDF receipt + its lazy download link
    layout/      Navbar, Footer, BottomBar, Breadcrumbs (light/dark), PageTransition, AnimatedRoutes (route table), ErrorState
    product/     Product list/item/filters/skeletons/image slider/related products/size guide
    review/      Review card/list/modal
    search/      Global search modal
    seo/         <Seo /> (one per page, reads ROUTE_META)
    tracking/    TrackModal, TrackStep (pipeline), NpTrackingPanel (route map)
    ui/          shadcn primitives (button, select, slider) + effects (encrypted-text, typing-animation)
    index.ts     Barrel export (Navbar + Footer only)
  config/        theme.ts — light/dark class tokens
  hooks/         One hook per page/feature concern (see §5)
  interfaces/    TypeScript types, one file per domain + an index.ts barrel
  lib/
    constants/   Static content and config by domain (navigation, site, filters, np, order, about, protocol, contact, archiveReviews) — order.ts over-broad, see backlog.md #9
    motion.ts    EASE_MTL / DURATION
    seo.ts       ROUTE_META + product meta helpers (also used by api/meta.ts)
    uaCities.ts  Ukrainian city coordinates + findCity() for the tracking map
    supabase.ts  Supabase client singleton
    utils.ts     `cn()` helper
  pages/         One component per route (see §4)
  stores/        Zustand stores: cart, currency, loadout drawer
  utils/         Pure functions: computeTotal, filterUtils, orderUtils, stock, phone, timeAgo, trackUtils (code normalising, TTN/name masking, recent orders) + __tests__/
api/             Vercel functions: meta.ts (meta tags for bots), sitemap.ts
public/          404/ (Blender render: webm, animated + still webp), reviews/ (archive review photos), icons, og image, robots.txt, webmanifest
supabase/
  functions/     contact-form, create-order, track-order, nova-poshta-search, nova-poshta-track, nova-poshta-ttn, _shared
  migrations/    Schema changes; schema.sql is a snapshot, not a migration
```

## 4. Routes (`src/components/layout/AnimatedRoutes.tsx`)

All routes are wrapped in `<PageTransition>` (shared fade/slide-up) and rendered inside `<AnimatePresence mode="wait">` for cross-route exit animations, keyed by `location.pathname`.

| Path                                | Page                 | Purpose                                                                     |
| ----------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| `/`                                 | `App.tsx`            | Landing/splash — video background, brand reveal, nav buttons                |
| `/gate/mtl-ch-ua`                   | `WelcomeGate.tsx`    | Standalone "boot sequence" terminal splash with 3D logo (see §7)            |
| `/inventory`                        | `Shop.tsx`           | Product listing/catalog                                                     |
| `/product/:slug`                    | `ProductDetails.tsx` | Single product page                                                         |
| `/loadout` (`/cart` redirects here) | `Cart.tsx`           | Cart / bag                                                                  |
| `/contact`                          | `Contact.tsx`        | Contact form, channels list, collapsible FAQ                                |
| `/about`                            | `About.tsx`          | Brand story, pillars, timeline, values                                      |
| `/protocol`                         | `Protocol.tsx`       | "Operational protocol" — policy/FAQ content styled as a classified document |
| `/orders`                           | `Orders.tsx`         | Track by code, file a field report, reviews feed (`#field-reports`)         |
| `*`                                 | `NotFound.tsx`       | 404 with the looping Blender render (`public/404/`)                         |

Note: `/loadout` is the "real" cart route name (brand voice — cart items are your "loadout"); `/cart` exists only as a redirect, presumably for anyone typing the more obvious URL.

## 5. Hooks — where the logic actually lives

Each hook owns one page/feature's state + Supabase calls, keeping the corresponding page/component mostly presentational:

- **`useProductList`** — fetches all products (`getProducts`) once on mount.
- **`useProductDetails(slug)`** — fetches one product by slug, re-fetches on slug change.
- **`useFilters`** — local-only filter state (sort, sizes, price range, category), no URL sync.
- **`useDebounce`** — generic debounce utility, used for search input.
- **`useCheckout`** — the entire checkout flow: form state (name/contact/zone/city/np_branch), validity, submit (POST to `create-order`, which prices, inserts and notifies server-side), step machine (`form → submitting → success/error`).
- **`useTrackOrder`** — POSTs an order number to the `track-order` edge function, returns the order or a not-found error.
- **`useContact`** — contact form state + POST to `contact-form` edge function.
- **`useNpTracking(ttn)`** — POSTs a Nova Poshta tracking number to the `nova-poshta-track` edge function; reducer-based state machine (`idle/loading/success/error`).
- **`useAllReviews`** — fetches all reviews joined with order items, merges them with the hardcoded `ARCHIVE_REVIEWS` (Instagram reviews from before the form existed), sorts by date and computes average + count client-side.
- **`useReviewSubmission({isOpen, orderId})`** — checks whether an order already has a review (prevents duplicate reviews), handles image upload + review insert via `submitReview` (uploads to the `review-images` Storage bucket, then inserts a row referencing the resulting public URLs).
- **`useActionToast`** — not data-fetching, but centralizes the three toast variants (success/error/warning) as a fully custom-rendered `react-hot-toast` component (brand-styled card, not the default toast look).

## 6. Data model (inferred from `src/interfaces/*.ts` + `src/api/*.ts`)

**`products` table** (`ProductType`): `id`, `name`, `description?`, `price` (in UAH — see currency conversion below), `sizes` (numbers or strings), `stock_status` (`in_stock | out_of_stock | pre_order`), `is_new`, `slug`, `quantity`, `size_stock?` (per-size stock map; caps cart quantity — stock counts are not shown to customers), `image_url[]`, `materials?`, `weight?`, `condition?`, `box?`, `sku?`, `category?` (`apparel | footwear | accessories`).

**`orders` table** (`Order`): `order_number` (`MTL-XXXXXX`), `customer_name`, `contact`, `total_price`, `status` (`waiting_for_payment | paid | processing | shipped | completed | cancelled` — see `STATUS_LABELS`/`STATUS_COLORS` in `lib/constants/order.ts`), `current_status_index`, `is_international`, `tracking_number`, `shipping_zone` (`Ukraine | International`), `created_at`, `items[]` (denormalized snapshot of cart line items at order time: name/selectedSize/price/cart_quantity — see `serializeCartItems`).

**`reviews` table** (`Review`): `id`, `product_id?`, `order_id` (FK, one review per order — enforced client-side via `useReviewSubmission`, should also be enforced by a DB constraint/RLS policy), `author_name`, `rating`, `size_purchased?`, `body?`, `image_urls[]`, `created_at`. Review images go to the `review-images` Storage bucket under `${order_id}/${uuid}.${ext}`.

Currency: all prices are stored/entered in UAH. `useCurrencyStore` + `convertPrice`/`formatPrice` convert to CHF/EUR for display only, using **hardcoded exchange rates** (`CHF: 1/50`, `EUR: 1/45`) — these will drift from real rates over time and aren't fetched from any live source.

## 7. Notable functionality

- **Welcome gate (`WelcomeGate.tsx`)** — a standalone boot-sequence screen at `/gate/mtl-ch-ua` with a scripted terminal log (`BOOT_LINES`), a rotating 3D GLB logo (`@google/model-viewer`), CRT scanline + grain overlays, and a glitch transition out. It's a standalone landing page, not an access gate.
- **Checkout (`CheckoutModal` + `useCheckout`)** — multi-step modal (form → submitting → success/error), zone-conditional fields (city + Nova Poshta branch only for `Ukraine`), POSTs to the `create-order` edge function, which re-prices the items server-side, decrements stock and inserts the order via the `create_order()` RPC, and sends the owner a Telegram alert. On success, offers a downloadable PDF receipt (`ReceiptDownloadLink` → lazy-loaded `@react-pdf/renderer` document, kept out of the main bundle via `lazy()`/`Suspense`).
- **Order tracking (`TrackModal` + `useTrackOrder` + `NpTrackingPanel` + `useNpTracking`)** — customer enters the 6-character code (normalised by `trackUtils`; recent codes remembered in localStorage); the modal shows the status pipeline (`TrackStep`, active step breathes). If the order has a Nova Poshta TTN, `NpTrackingPanel` draws the route between city nodes (`uaCities.ts`) on darkened OSM tiles, with the TTN and name masked.
- **Reviews feed** also includes `ARCHIVE_REVIEWS` (`lib/constants/archiveReviews.ts`, photos in `public/reviews/`), real Instagram reviews with their real dates.
- **SEO** — `ROUTE_META` + `<Seo />` in the browser; bots are rewritten (`vercel.json`) to `api/meta.ts`, which fills the same tags into `index.html`; `api/sitemap.ts` serves `/sitemap.xml`.
- **Reviews (`ReviewModal`, `ReviewList`, `ReviewCard`, `useAllReviews`, `useReviewSubmission`)** — gated behind order status: `Orders.tsx` looks the order up via `track-order` first and only allows opening the review modal if `status === "completed"`. Supports photo uploads.
- **Product filtering (`ProductFilters`, `useFilters`, `filterUtils.ts`)** — client-side filter/sort over the full product list (no server-side pagination/filtering — all products are fetched up front by `useProductList`).
- **Size guide (`SizeGuideModal`)** — static measurement reference modal, no data dependency.
- **Search (`SearchModal`)** — opened from `Navbar`, debounced client-side search over the already-fetched product list.
- **Currency switcher (`Navbar`)** — dropdown (UAH/CHF/EUR) backed by `useCurrencyStore`, persisted to localStorage, affects only display formatting (source of truth stays UAH).
- **Encrypted text reveal (`ui/encrypted-text.tsx`)** — scrambles-then-reveals text character by character using `requestAnimationFrame`, triggered on scroll-into-view (`useInView` from `motion`); used for the brand wordmark across the site (landing page, navbar logo, welcome gate).

## 8. Tooling & process

- **Linting/formatting:** ESLint (`eslint.config.js` — flat config, `typescript-eslint` recommended + `react-hooks` + `react-refresh`), Prettier (`.prettierrc`/`.prettierignore`), enforced pre-commit via `husky` + `lint-staged` (`npx lint-staged` on `pre-commit`).
- **Commit convention:** `commitlint.config.js` extends `@commitlint/config-conventional` — commits must be `type: message` (feat/fix/style/refactor/etc.), enforced via husky's `commit-msg` hook (implied by the config's presence).
- **CI (`.github/workflows/ci.yml`):** on push/PR to `main`/`develop` — `npm ci` → `tsc --noEmit` → `npm run lint` → `prettier --check .` → `npm test` → `npm run build` (build step injects `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY`/`EDGE_FUNCTION_URL` from repo secrets).
- **Deploy:** Vercel (`vercel.json` — sitemap + bot rewrites, SPA rewrite to `index.html`, security headers + CSP on every path). Edge functions and migrations are deployed to Supabase separately; the public functions share `supabase/functions/_shared/cors.ts` (allowed origins + `ALLOWED_ORIGINS` secret).
- **Code splitting:** `AnimatedRoutes.tsx` lazy-loads every page except the landing and prefetches them when the browser is idle; `TrackModal` lazy-loads the Leaflet map, `CheckoutModal` the PDF receipt.
- **Git flow:** `develop` → `main` via PRs (see commit history — multiple `Merge pull request #N from nlklfor/develop`). See `CLAUDE.md` for the branch/ask-before-secrets/local-test-before-merge rule going forward.

## 9. Known architectural gaps (cross-reference `backlog.md`)

- No accounts: orders and reviews are found by order code only.
- All products are fetched up front and filtered client-side — fine at the current catalogue size.
- Exchange rates are hardcoded (§6).
- No per-status timestamps on orders, no product-level reviews (`backlog.md`, "After the redesign").
