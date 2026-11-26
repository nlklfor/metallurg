# METALLURG METALLURG Design System Reference

How the site actually looks and moves, extracted from the code (not aspirational — this describes what's implemented today). Companion to `architecture.md`. Use this before introducing new colors, fonts, or motion patterns so new UI stays consistent with the existing "terminal archive" identity.

---

## 0. Tokens (redesign v3, 2026-10, rolled out to every page by 2026-11)

Source of truth: the "METALLURG™ — Archive Redesign" design file (00 SYSTEM). Tokens live in `src/index.css` (`@theme`) and `src/lib/motion.ts`.

| Token                     | Value                                                                                 | Tailwind                            |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------- |
| Wordmark font             | TheNeue Black 900 — **METALLURG™ wordmark and brand marks only**, never headings/body | `font-wordmark` or `<Wordmark />`   |
| Display font              | Archivo Black, italic, uppercase, -0.05em                                             | `display` (utility), `font-display` |
| Mono font                 | IBM Plex Mono 400–700 (everything else)                                               | `font-mono` (default on `:root`)    |
| Eyebrow                   | mono 11px / .15em / uppercase (pages often set `text-[10px]`)                         | `eyebrow`                           |
| Ink / Paper               | #000 / #fff                                                                           | `bg-ink`, `text-paper`…             |
| Rules                     | #E5E7EB light, #1F2937 dark                                                           | `border-rule`, `border-rule-dark`   |
| Secondary text            | #6B7280 on light, #9CA3AF on dark                                                     | `text-dim`, `text-dim-dark`         |
| Status (accent only here) | ok #22C55E · info #3B82F6 · wait #EAB308 · error #EF4444 · low #FB923C                | `bg-status-ok` …                    |
| Easing                    | cubic-bezier(0.16, 1, 0.3, 1)                                                         | `ease-mtl`, `EASE_MTL`              |
| Shape                     | radius 0, 1px borders, no shadows, no gradients                                       | `--radius: 0`                       |
| Bars                      | 64px navbar / mobile bottom bar, 56px mobile top bar                                  | `h-bar`, `h-topbar`                 |

Theme rule: ARCHIVE pages (inventory, loadout, orders, contact, about) are light. Dark surfaces: landing, gate, product page, 404, Protocol (white/grey on black, `Breadcrumbs variant="dark"`), and the track, review and checkout modals. Search is a light panel. `<Navbar variant="light|dark">`.

### 0.1 Copy and label rules (set during the redesign)

- **WORD_WORD labels and `//` comments** stay the brand voice (`// MANIFESTO`, `01 // TRACK_BY_CODE`, `FILE_REPORT →`). Keep them few: one eyebrow per block, not one per line.
- **Separators:** `/` inside a line, `//` before a label. Never `·`.
- **Smallest text is 10px.** Nothing at 8–9px.
- **Letter-spacing tops out at 0.15em** for small caps labels (0.2–0.3em only on a few big buttons and the 404 eyebrow). The old 0.3–0.4em tracking is gone.
- **Less text.** One sentence under a page title. No helper lines that repeat what a control already says.
- **Product cards:** photo, PRE_ORDER/NEW tag (no border), name, price. Sizes appear only in the hover strip. No "units left"/LAST_N labels anywhere (cards, product page, cart; the cart shows `MAX_QTY` at the limit). Archived items show the price struck through.
- **No Zürich.** Coordinates and nodes are Kyiv only (`50.4501° N, 30.5234° E`). The gate URL `/gate/mtl-ch-ua` stays because it's printed on QR codes.

### 0.2 Page header pattern

Every archive page starts the same way (`Shop`, `Cart`, `Orders`, `Contact`, `About`):

```tsx
<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders" }]} />
<header className="flex flex-col gap-3 px-4 pb-5 pt-6 sm:px-8 md:px-12 lg:gap-4 lg:pb-8 lg:pt-10">
  <h1 className="display text-[36px] sm:text-[48px] lg:text-[64px]">Orders</h1>
  <div className="h-px bg-ink" />
  <p className="text-[12px] leading-relaxed lg:text-[13px]">One sentence.</p>
</header>
```

Page gutters: `px-4 sm:px-8 md:px-12`. Long display words with `_` get a `<wbr />` after each `_` (`Breakable` in About/Protocol) so they wrap between words, not mid-word.

### 0.3 Loading states

Skeletons mirror the real layout box for box (`ProductSkeleton`, `ProductDetailsSkeleton`, `FilterSidebarSkeleton`, the `SearchModal` rows). When a layout changes, change its skeleton in the same PR.

Buttons: `<Button variant="mtl" size="mtl">` (black, inverts on hover, 52px), `mtl-outline`, `mtl-text`.

`prefers-reduced-motion` collapses CSS animations/transitions and skips the wordmark scramble.

## 1. Visual identity in one line

A monochrome (black/white) streetwear brand presented as a classified military/tech archive — CRT scanlines, boot logs, glitch transitions, encrypted-text reveals, coordinate watermarks (50.4501°N Kyiv), and terminal-style `// comment` labels used as UI copy throughout (`// STATUS: OPERATIONAL`, `// ABOUT_METALLURG`, `// classified_document`).

## 2. Typography

Three typefaces, each with a fixed role — don't introduce a fourth without a reason:

| Font                                  | Loaded via                                                                               | Used for                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **IBM Plex Mono**                     | `@fontsource/ibm-plex-mono` (400/500/600/700), imported in `src/main.tsx`                | Default body font (`:root { font-family: "IBM Plex Mono", monospace }`), all mono/UI/label text, form inputs, terminal log lines |
| **Archivo Black**                     | `@fontsource/archivo-black`, imported in `src/main.tsx`                                  | Large uppercase display headings, product names in toasts, section titles (`font-family: 'Archivo Black', sans-serif`)           |
| **TheNeue** (custom, weight 900 only) | Self-hosted `@font-face` in `index.css` (`woff2`/`woff`/`ttf` under `src/assets/fonts/`) | The brand wordmark specifically — "METALLURG™" — wherever it appears standalone (navbar logo, landing page, welcome gate)        |

All fonts are self-hosted (no Google Fonts requests), so localhost and production render identically. TheNeue is the wordmark only — never change it or use it for headings.

Convention: headings use the `display` utility (Archivo Black, italic, uppercase, -0.05em). Small labels/eyebrows are 10–11px, tracking ≤ 0.15em, often prefixed with `//` to read as a code comment (e.g. `// TRACK_BY_CODE`). See §0.1.

## 3. Color system

Two layers coexist:

1. **shadcn/Tailwind v4 token system** (`index.css`, `@theme inline` block) — OKLCH-based CSS variables (`--background`, `--foreground`, `--primary`, `--destructive`, `--border`, etc.) with a `.dark` class override block. This is the generic shadcn scaffold (from `components.json`, `baseColor: "neutral"`) and backs the shadcn primitives in `components/ui/` (button, select, slider).
2. **Brand palette** — the §0 tokens (`ink`, `paper`, `rule`, `rule-dark`, `dim`, `dim-dark`, `status-*`). Use these in new code; older `bg-black`/`border-gray-200`/`text-gray-400` classes still appear and mean the same thing. See `src/config/theme.ts` for the two named variants (`light`/`dark`) used by components like `Navbar` that need to adapt to the page they're on.

Accent colors are used sparingly and only for semantic status, never decoratively:

- Success/positive: white (`bg-white` accent bar in toasts) or `text-green-500`/`text-green-600` (delivered/shipped order status)
- Error/destructive: `bg-red-500` / `text-red-500` / `text-red-400`
- Warning/pending: `bg-yellow-500` / `text-yellow-500` / `text-yellow-400`
- Info/in-progress: `text-blue-500`

Order status colors are centralized in `STATUS_COLORS` (`src/lib/constants/order.ts`) — extend that map rather than inlining new status colors elsewhere. On light pages, status text uses the darker shade for contrast (`#15803D` green, `#B91C1C` red); the bright `status-*` value is for borders and dots.

## 4. Motion & animation

Two motion systems are layered:

### a) `motion` (Framer Motion) — component-driven

- **Standard easing curve:** `[0.16, 1, 0.3, 1]` (a snappy ease-out) — reused across `PageTransition`, `CheckoutModal`, and other modals. Use this curve for any new modal/transition to stay consistent, rather than a default ease.
- **Page transitions** (`PageTransition.tsx`): fade + 12px vertical slide in, -8px slide out, 0.3s, wrapped per-route in `AnimatedRoutes.tsx` inside `<AnimatePresence mode="wait">`.
- **Modal pattern** (e.g. `CheckoutModal.tsx`): backdrop (`fixed inset-0 bg-black/70 backdrop-blur-sm`, fade 0.3s) + panel (fade + 40px vertical slide, 0.35s, the standard easing curve above). Modals are **hand-rolled with `motion.div` + `AnimatePresence`**, not Radix Dialog, despite `radix-ui` being a dependency (Radix is only used for `Slot`/`Select`/`Slider` primitives). Every modal also: locks `document.body.style.overflow = "hidden"` while open, closes on `Escape` keydown, and closes on backdrop click.
- **Scroll-triggered reveals:** `useInView` (from `motion/react`) gates animations like `EncryptedText`'s scramble-reveal and `TypingAnimation`'s typewriter effect so they only start once scrolled into view (`once: true`).
- **Staggered list reveals** (e.g. `About.tsx`): a shared `fadeUp` variants object (`opacity 0→1`, `y: 20→0`, `delay: i * 0.1`) applied per-index to timeline/pillar/value lists.

### b) Raw CSS keyframes — effect-driven, in `index.css`

- `animate-enter` / `animate-leave` (Tailwind v4 `@utility`) — generic 0.2s/0.15s fade+slide, used for lightweight dropdowns (e.g. the currency selector).
- `animate-toast-in` / `animate-toast-out` — custom toast slide-from-right with a snappy `cubic-bezier(0.16, 1, 0.3, 1)` in / sharper `cubic-bezier(0.7, 0, 0.84, 0)` out, applied in `useActionToast`.
- `animate-blink-cursor` — 1.2s step-end infinite opacity blink, used for terminal cursor characters (boot log, typing animation cursor).
- **Welcome gate effects** (`index.css`): film grain (`.gate-grain`, SVG turbulence + 0.3s stepped jitter) and the **exit glitch** (`.gate-root--exit`: brightness/contrast/invert keyframes ending in a cut to black) when ENTER_ARCHIVE is pressed. The rest of the gate is Tailwind.
- **404 hero** is the owner's Blender render, not CSS: `public/404/metallurg_404.webm` (VP9 + alpha) for Chrome/Edge/Firefox, `metallurg_404_animated.webp` for Safari, `metallurg_404_still.webp` as poster and for reduced motion (`NotFound.tsx`, `pickMedia`).
- **Tracking pipeline:** the active step "breathes" (slow opacity pulse) in `TrackStep`; the map uses OpenStreetMap tiles darkened by `.mtl-dark-tiles` (CSS filter) with the OSM attribution visible.
- **Typewriter text:** `TypingAnimation` has a default `leading-[5rem]`; pass `className="leading-[inherit]"` when it sits in normal text.

### c) 3D

- The welcome gate's rotating logo is a GLB model rendered by `@google/model-viewer` (`src/assets/icons/logo-mtl.glb`). There's no hand-written WebGL in the app.

## 5. Popups / overlays inventory

All follow the same modal pattern from §4a (backdrop + panel, body-scroll-lock, Escape-to-close, backdrop-click-to-close) unless noted:

| Component                | Purpose                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `CheckoutModal`          | Multi-step checkout (form/submitting/success/error)                                                                                 |
| `TrackModal` (tracking/) | Dark. Order code lookup (`initialCode` prop), status pipeline, then `NpTrackingPanel` (route map with city nodes, `uaCities.ts`)    |
| `ReviewModal`            | Dark. Panel on desktop, two steps on phones; rating 1–5, up to 3 photos (8 MB each); done / ALREADY_REPORTED / REPORT_NOT_SENT      |
| `SearchModal`            | Global product search, debounced                                                                                                    |
| `SizeGuideModal`         | Static measurement reference table                                                                                                  |
| Navbar currency dropdown | Lighter-weight (not a full modal) — absolutely-positioned panel, closes on outside-click via a `mousedown` listener + ref check     |
| Navbar mobile menu       | Full-screen overlay (`fixed inset-0 z-[60]`), slide-in nav links + currency selector, closes on link click or explicit close button |

Toasts (`useActionToast`) are a distinct, non-modal overlay pattern: bottom-of-stack `react-hot-toast` positioned `top-right`, fully custom card render (not the library's default UI) — black card, 3px colored accent bar on the left keyed to success/error/warning, small `// status:` label line, optional product thumbnail, explicit close button.

## 6. Layout conventions

- Breakpoint philosophy: mobile-first, most components branch at `sm:` (640px) and `md:` (768px); a dedicated `BottomBar` component exists for mobile-only bottom navigation (rendered globally in `main.tsx`, outside the router's page transitions).
- Page headers follow §0.2. Section labels are a 10px `eyebrow` with `//` above the content.
- Cards/panels: `border border-rule` at rest → `hover:border-ink` (or a solid `border-ink` for the primary card), no shadow — flat, high-contrast, no soft UI (no rounded-xl/soft-shadow language; shadcn's default rounded corners are mostly unused in favor of sharp/`rounded-none` brand components).
- iOS Safari zoom prevention: `index.css` forces `font-size: 16px !important` on `input/textarea/select` under 640px — keep this in mind, don't override with a smaller font size on mobile form fields.

## 7. When adding new UI

1. Reuse `theme.ts` (`getThemeColors("light" | "dark")`) if the component needs to adapt to being placed on a light or dark page, rather than hardcoding new gray shades.
2. Reuse the `[0.16, 1, 0.3, 1]` easing curve for anything modal/transition-like.
3. Keep new modals consistent with §5's pattern (backdrop + `motion.div` panel, scroll-lock, Escape handler) rather than introducing Radix Dialog or a different library — the codebase has deliberately stayed hand-rolled here.
4. New status/semantic colors go in `STATUS_COLORS`/`STATUS_LABELS` (`lib/constants/order.ts`), not inlined.
5. Stick to the three-font system (§2) — no new font families without a stated reason.
6. Follow the copy rules in §0.1 (no `·`, ≥10px, tracking ≤0.15em, no stock counts).
7. A new public page gets a `ROUTE_META` entry and `<Seo />` (see `CLAUDE.md`).
