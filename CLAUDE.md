# CLAUDE.md

Project-specific instructions for Claude Code when working in this repo. See also `Project-mtl.md` (architecture/stack/functionality reference), `style-mtl.md` (design system reference), and `FIXES.md` (known issues/hardening backlog).

## Workflow — always follow this for real code changes

1. **Branch first.** Create a new branch off `main` for the change (docs-only edits can go straight to a `docs/*` branch too — see the docs batch on `docs/project-audit-and-docs` for the pattern). Don't commit directly to `main`.
2. **Ask before assuming secrets.** If a change needs an API key, env var, or other config value from Nikita, stop and ask for it rather than inventing a placeholder or guessing. Add the variable name (not the value) to `.env.example` if it's a new one.
3. **He tests locally before merge.** After implementing, hand it back for local testing. Don't push to `main` or merge on your own initiative — wait for approval.
4. **Commit/push/merge only after approval**, PR-style, matching the existing `develop`/`main` branch flow already used in this repo's history.

This applies to code changes. Read-only investigation, planning, and running things locally for the user to review don't need a branch first.

## Things to keep in mind about this codebase

- Checkout currently trusts the client-computed order total (`src/hooks/useCheckout.ts`) — see `FIXES.md` #1 before building anything that touches pricing or payment.
- Only the `contact-form` edge function is version-controlled under `supabase/functions/`; `track-order`, `notify-telegram`, `nova-poshta-track` exist only in the Supabase dashboard. If you need to change their behavior, that's out-of-repo until `FIXES.md` #3 is addressed — ask before assuming you can edit them from here.
- No test suite exists yet. If you touch `computeTotal`, `generateOrderNumber`, `serializeCartItems`, or cart quantity logic, treat those as the highest-value places to add a test alongside the change.
- Design language is a monochrome black/white "terminal/archive" aesthetic (IBM Plex Mono, Archivo Black, custom "TheNeue" display font) with a consistent `ease: [0.16, 1, 0.3, 1]` motion curve. Check `style-mtl.md` before introducing new UI patterns, colors, or fonts.
