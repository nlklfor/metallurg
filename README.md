# METALLURG™

A streetwear/sportswear e-commerce storefront with a terminal/cyberpunk visual identity, positioned across Zürich and Kyiv. Built with React 19, Vite, TypeScript, Tailwind v4, and Supabase.

For a deep dive into architecture, stack, and functionality, see [`Project-mtl.md`](./Project-mtl.md). For the design system (colors, fonts, animations, motion), see [`style-mtl.md`](./style-mtl.md). For known issues and the hardening backlog, see [`FIXES.md`](./FIXES.md).

## Stack

- **Frontend:** React 19, TypeScript, Vite 7, React Router 7
- **Styling:** Tailwind CSS v4, shadcn/ui ("new-york" style), Radix UI primitives, `class-variance-authority`
- **State:** Zustand (cart, currency, gate) with `persist` middleware where needed
- **Backend:** Supabase (Postgres + Storage + Edge Functions), accessed directly from the client via `@supabase/supabase-js`
- **Motion:** `motion` (Framer Motion), custom CSS keyframes, WebGL shader background (`ogl`)
- **Other:** `@react-pdf/renderer` (order receipts), `react-leaflet` (Nova Poshta tracking map), `embla-carousel-react` (product image sliders)

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (or access to the existing one) with the `products`, `orders`, `reviews` tables and the `review-images` storage bucket set up

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values — ask a project maintainer if you don't have them
npm run dev
```

### Environment variables

See [`.env.example`](./.env.example) for the full list. At minimum, the app needs:

| Variable            | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL` | Supabase project URL                             |
| `VITE_SUPABASE_KEY` | Supabase anon/public key                         |
| `EDGE_FUNCTION_URL` | Base URL for the `notify-telegram` edge function |

**Never commit real values** — `.env` is gitignored; only `.env.example` (with placeholder values) should be tracked.

### Scripts

| Command           | Does                                       |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite dev server                  |
| `npm run build`   | Typecheck (`tsc -b`) then production build |
| `npm run lint`    | Run ESLint                                 |
| `npm run preview` | Preview the production build locally       |

### Git workflow

Work happens on feature branches off `develop`/`main`, merged via PR — see `CLAUDE.md` for the exact rules this repo follows (branch first, ask before adding new secrets, test locally before merging). Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are linted by commitlint via husky.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`/`develop`: typecheck → lint → format check → build.
