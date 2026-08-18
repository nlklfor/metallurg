# METALLURG METALLURG Design System Reference

How the site actually looks and moves, extracted from the code (not aspirational — this describes what's implemented today). Companion to `architecture.md`. Use this before introducing new colors, fonts, or motion patterns so new UI stays consistent with the existing "terminal archive" identity.

---

## 1. Visual identity in one line

A monochrome (black/white) streetwear brand presented as a classified military/tech archive — CRT scanlines, boot logs, glitch transitions, encrypted-text reveals, coordinate watermarks (47.3769°N Zürich / 50.4501°N Kyiv), and terminal-style `// comment` labels used as UI copy throughout (`// STATUS: OPERATIONAL`, `// ABOUT_METALLURG`, `// classified_document`).

## 2. Typography

Three typefaces, each with a fixed role — don't introduce a fourth without a reason:

| Font                                  | Loaded via                                                                               | Used for                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **IBM Plex Mono**                     | Google Fonts `@import` in `index.css`                                                    | Default body font (`:root { font-family: "IBM Plex Mono", monospace }`), all mono/UI/label text, form inputs, terminal log lines |
| **Archivo Black**                     | Google Fonts `@import` in `index.css`                                                    | Large uppercase display headings, product names in toasts, section titles (`font-family: 'Archivo Black', sans-serif`)           |
| **TheNeue** (custom, weight 900 only) | Self-hosted `@font-face` in `index.css` (`woff2`/`woff`/`ttf` under `src/assets/fonts/`) | The brand wordmark specifically — "METALLURG™" — wherever it appears standalone (navbar logo, landing page, welcome gate)        |

Convention: headings are uppercase + `tracking-tighter` + often `italic`; small labels/eyebrows use very wide letter-spacing (`tracking-[0.2em]` to `tracking-[0.4em]`) at tiny sizes (9–10px), consistently prefixed with `//` to read as a code comment (e.g. `// TRACK_ORDER`, `// ORDER_MANAGEMENT`).

## 3. Color system

Two layers coexist:

1. **shadcn/Tailwind v4 token system** (`index.css`, `@theme inline` block) — OKLCH-based CSS variables (`--background`, `--foreground`, `--primary`, `--destructive`, `--border`, etc.) with a `.dark` class override block. This is the generic shadcn scaffold (from `components.json`, `baseColor: "neutral"`) and backs the shadcn primitives in `components/ui/` (button, select, slider).
2. **Brand palette in practice** — almost pure black/white, applied directly via Tailwind utility classes rather than the token system: `bg-black`/`bg-white`, `text-black`/`text-white`, `border-gray-200` (light surfaces) / `border-gray-800` (dark surfaces), `text-gray-400`/`text-gray-500` for secondary text. See `src/config/theme.ts` for the two named variants (`light`/`dark`) used by components like `Navbar` that need to adapt to the page they're on.

Accent colors are used sparingly and only for semantic status, never decoratively:

- Success/positive: white (`bg-white` accent bar in toasts) or `text-green-500`/`text-green-600` (delivered/shipped order status)
- Error/destructive: `bg-red-500` / `text-red-500` / `text-red-400`
- Warning/pending: `bg-yellow-500` / `text-yellow-500` / `text-yellow-400`
- Info/in-progress: `text-blue-500`

Order status colors are centralized in `STATUS_COLORS` (`src/lib/constants/order.ts`) — extend that map rather than inlining new status colors elsewhere.

The `Aurora` WebGL component (`ui/Aurora.tsx`) is the one place with an arbitrary color gradient (`colorStops` prop, default purple→green→purple) — it's a decorative background effect, used sparingly, not part of the core palette.

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
- **Welcome gate effects** (`.gate-*` classes, ~500 lines of `index.css`): CRT scanline overlay (`gate-scanline-scroll`, 8s linear infinite repeating gradient), film grain (`gate-grain-shift`, SVG turbulence filter + 0.3s stepped position jitter), and a multi-stage **exit glitch** (`gate-exit`/`gate-screen-glitch`/`gate-glitch` — brightness/contrast/invert/hue-rotate keyframes culminating in a hard cut to black) triggered when the user clicks "ENTER_ARCHIVE".
- **404 glitch** (`.notfound-glitch`): RGB-split duplicate-text effect via `::before`/`::after` with `clip-path` bands + independent horizontal-shift keyframes, plus a periodic (every ~10% of a 4s loop) skew jolt on the base element.

### c) WebGL (non-CSS)

- `Aurora` (`ui/Aurora.tsx`) — a full custom vertex/fragment shader pipeline via `ogl` (not `three.js`), rendering an animated simplex-noise aurora gradient into a `<canvas>`, driven by `requestAnimationFrame` and reading `uTime`/`uAmplitude`/`uColorStops`/`uBlend` uniforms. Self-contained — mounts/unmounts its own `WebGLRenderer` and cleans up the GL context on unmount.

## 5. Popups / overlays inventory

All follow the same modal pattern from §4a (backdrop + panel, body-scroll-lock, Escape-to-close, backdrop-click-to-close) unless noted:

| Component                | Purpose                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `CheckoutModal`          | Multi-step checkout (form/submitting/success/error)                                                                                 |
| `TrackModal` (tracking/) | Order number lookup, embeds `NpTrackingPanel` on success                                                                            |
| `ReviewModal`            | Review submission form with photo upload                                                                                            |
| `SearchModal`            | Global product search, debounced                                                                                                    |
| `SizeGuideModal`         | Static measurement reference table                                                                                                  |
| Navbar currency dropdown | Lighter-weight (not a full modal) — absolutely-positioned panel, closes on outside-click via a `mousedown` listener + ref check     |
| Navbar mobile menu       | Full-screen overlay (`fixed inset-0 z-[60]`), slide-in nav links + currency selector, closes on link click or explicit close button |

Toasts (`useActionToast`) are a distinct, non-modal overlay pattern: bottom-of-stack `react-hot-toast` positioned `top-right`, fully custom card render (not the library's default UI) — black card, 3px colored accent bar on the left keyed to success/error/warning, small `// status:` label line, optional product thumbnail, explicit close button.

## 6. Layout conventions

- Breakpoint philosophy: mobile-first, most components branch at `sm:` (640px) and `md:` (768px); a dedicated `BottomBar` component exists for mobile-only bottom navigation (rendered globally in `main.tsx`, outside the router's page transitions).
- Section labels follow a fixed pattern: tiny (`text-[9px]`–`text-[10px]`), wide-tracked, uppercase, gray, `//`-prefixed eyebrow line above a large black uppercase italic heading (see `About.tsx`, `Orders.tsx`, `Protocol.tsx` headers) — treat this as the standard page-header template for new pages.
- Cards/panels are typically borderless-fill on hover: `border border-gray-200` at rest → `hover:border-black`, no background color change, no shadow — flat, high-contrast, no soft UI (no rounded-xl/soft-shadow language; shadcn's default rounded corners are mostly unused in favor of sharp/`rounded-none` brand components).
- iOS Safari zoom prevention: `index.css` forces `font-size: 16px !important` on `input/textarea/select` under 640px — keep this in mind, don't override with a smaller font size on mobile form fields.

## 7. When adding new UI

1. Reuse `theme.ts` (`getThemeColors("light" | "dark")`) if the component needs to adapt to being placed on a light or dark page, rather than hardcoding new gray shades.
2. Reuse the `[0.16, 1, 0.3, 1]` easing curve for anything modal/transition-like.
3. Keep new modals consistent with §5's pattern (backdrop + `motion.div` panel, scroll-lock, Escape handler) rather than introducing Radix Dialog or a different library — the codebase has deliberately stayed hand-rolled here.
4. New status/semantic colors go in `STATUS_COLORS`/`STATUS_LABELS` (`lib/constants/order.ts`), not inlined.
5. Stick to the three-font system (§2) — no new font families without a stated reason.
