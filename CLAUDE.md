# CLAUDE.md

Project-specific instructions for Claude Code when working in this repo. See also `docs/architecture.md` (architecture/stack/functionality reference), `docs/design-system.md` (design system reference), and `docs/backlog.md` (known issues/hardening backlog).

## Workflow — always follow this for real code changes

1. **Branch first.** Create a new branch off `main` for the change (docs-only edits can go straight to a `docs/*` branch too — see the docs batch on `docs/project-audit-and-docs` for the pattern). Don't commit directly to `main`.
2. **Ask before assuming secrets.** If a change needs an API key, env var, or other config value from Nikita, stop and ask for it rather than inventing a placeholder or guessing. Add the variable name (not the value) to `.env.example` if it's a new one.
3. **He tests locally before merge.** After implementing, hand it back for local testing. Don't push to `main` or merge on your own initiative — wait for approval.
4. **Commit/push/merge only after approval**, PR-style, matching the existing `develop`/`main` branch flow already used in this repo's history.

This applies to code changes. Read-only investigation, planning, and running things locally for the user to review don't need a branch first.

## Things to keep in mind about this codebase

- Orders are created only by the `create-order` edge function: it re-reads prices from `products`, computes delivery and the total server-side, and calls the `create_order()` RPC (atomic stock decrement). The browser total is display-only. The owner's Telegram alert is sent from `create-order` too.
- All edge functions live under `supabase/functions/`. Deploying them (and applying migrations) is a separate step from merging: Vercel only deploys the frontend.
- `supabase/schema.sql` is a snapshot of the whole live schema (tables, functions, triggers, RLS, storage, cron). It is not a migration. Make schema changes as new files in `supabase/migrations/`, then refresh the snapshot.
- Unit tests run with Vitest (`npm test`, also in CI). If you touch `computeTotal`, `generateOrderNumber`, `serializeCartItems`, `getMaxQuantity`, or cart quantity logic, add or update a test alongside the change.
- Design language is a monochrome black/white "terminal/archive" aesthetic (IBM Plex Mono, Archivo Black, custom "TheNeue" display font) with a consistent `ease: [0.16, 1, 0.3, 1]` motion curve. Check `docs/design-system.md` before introducing new UI patterns, colors, or fonts.
