# CareLink PWA

## Stack

React + Vite + Tailwind + vite-plugin-pwa · Supabase (DB, Auth, Storage,
Realtime, Edge Functions) · Vercel · Vitest (unit) · Cypress (E2E)
Node: team-agreed LTS (pin in `.nvmrc` and `"engines"` in package.json;
must match the Node version set in Vercel project settings)
Shell: Windows PowerShell — give PowerShell commands, not bash.

## Commands

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run test` (Vitest, add `"test": "vitest run"` to package.json) · `npx cypress run` (E2E)
- `npm run lint` and `npm run build` must pass before any commit.
- Test PWA behavior with `build` + `preview`, never `dev`
  (the service worker is not reliable in dev mode).

## Security (non-negotiable)

- Never commit `.env`. Only `VITE_`-prefixed vars reach the browser, and the
  only Supabase key allowed in frontend code is the anon/publishable key.
- Never put `service_role` or the Gemini API key in the frontend.
  Gemini is called only from a Supabase Edge Function, with the key stored
  as a Supabase secret.
- Edge Functions must verify the caller's JWT and role (admin/staff only)
  before calling Gemini, so the free quota cannot be abused.
- Every table gets Row Level Security enabled, with policies written in the
  same migration that creates the table.
- Never disable RLS to "make it work". Fix the policy.
- Roles (admin, staff, donor) live in a `profiles` table (or app_metadata),
  never in user-editable metadata. RLS policies check this role.
- Only the wishlist is readable by anonymous visitors. Everything else
  requires login.
- Payment slips and receipts go in a private Storage bucket, accessed via
  signed URLs, with bucket policies written in a migration.
- Payments are bank transfer / DuitNow QR only. Never collect or store card
  numbers. Store only what a donation record needs (PDPA).
- No real children's names or identifiable photos in the app, the repo or
  test data. Use placeholders.

## Supabase

- All schema changes go in `supabase/migrations/` as SQL files, never
  by clicking in the dashboard only.
- Keep one shared client in `src/lib/supabase.js`. Do not create new clients.
- Free tier: projects pause after about 1 week of inactivity, so keep it
  warm before demos. Keep Storage uploads small.
- Always unsubscribe Realtime channels in the `useEffect` cleanup.

## PWA

- Use `registerType: 'autoUpdate'` (or prompt) deliberately and document the choice.
- Manifest needs 192/512 icons plus a maskable icon.
- Never cache Supabase auth or private API responses in the service worker.
  Default: cache static assets only.
- Sprint 3 offline exception: the public wishlist GET may use a
  NetworkFirst strategy. Nothing authenticated is ever cached.
- Check installability with Lighthouse before each sprint demo.

## Code conventions

- Functional components and hooks only. One component per file.
- Tailwind utilities only, no custom CSS unless unavoidable. Mobile-first.
- Data fetching in hooks (`src/hooks/`), not inline in components.
- Always handle loading, error, and empty states.

## Testing

- Vitest for logic, hooks, utils. Cypress for key user flows only
  (wishlist CRUD, subscription selection, slip upload, admin approval).
- Add a test for every bug fix and for any non-trivial logic.
- Use `data-cy` attributes for selectors, never CSS classes.
- Cypress tests use a separate test user (ideally a separate Supabase
  project) and never touch real data.

## Deployment

- Vercel env vars are set in the Vercel dashboard, not in the repo.
- Add a `vercel.json` SPA rewrite so deep links don't 404.
- Never push directly to `main`: use a branch and a PR.
- Vercel Hobby deploys from Yi Wen's account: confirm teammates' PRs get
  preview builds, otherwise Yi Wen deploys after merge.

## Working style

- Explain new concepts in beginner-friendly terms, one step at a time.
- Ask before adding a new dependency (Vitest, Cypress, Tailwind and
  vite-plugin-pwa are already approved).
- Make small, focused commits with clear messages.

testing
