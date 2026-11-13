# CareLink PWA: Team Setup & Git Guide

## Part 0: Yi Wen// i alr done this

1. **GitHub:** repo -> Settings -> Collaborators -> Add people. Add Sarah, Hazeeq and Nabilah. Each person must accept the email invite.
2. **Supabase:** Organization settings -> Team -> invite them by email. Sarah needs access first (database schema).
3. **Vercel:** the free plan cannot add collaborators, so teammates do not need Vercel access. Deployments come from `main` on Yi Wen's account.
4. **Share the `.env` values privately** (WhatsApp or similar, never in GitHub). They need `VITE_SUPABASE_URL` and the anon/publishable key.
5. **Turn on branch protection** (see the section at the end of this guide). Until this is on, the "never push to main" rule depends on everyone being careful.

## Part 1: One-time setup (everyone)

**1. Accept the invites** from Yi Wen (GitHub and Supabase). Check your email.

**2. Install the tools:** Node (same version as the `.nvmrc` file in the repo), Git and VS Code. Check in PowerShell:

```powershell
node -v
git --version
```

**3. Clone the repo** into a fresh folder. Do not make your own folder or run `npm create vite`:

```powershell
cd C:\Users\<your-name>
git clone https://github.com/yiwen04/CareLink-PWA.git
cd CareLink-PWA
```

**4. Install packages and create your env file:**

```powershell
npm install
Copy-Item .env.example .env
```

Open `.env` and paste the values Yi Wen sends you privately.

**5. Check that it runs:**

```powershell
npm run dev
```

Open the localhost link it prints. If you see the app, you are ready.

## Part 2: Daily workflow (one branch per task)

**Starting a new task:**

```powershell
git checkout main
git pull
git checkout -b feature/short-task-name
```

(`checkout -b` creates a new branch and switches to it.)

**While working:** save often with small commits.

```powershell
git add .
git commit -m "clear message about what changed"
```

**First push of your branch** (the `-u` links it to GitHub, only needed the first time):

```powershell
git push -u origin feature/short-task-name
```

**Later pushes on the same branch:**

```powershell
git push
```

**Then:** open GitHub, click **Compare & pull request**, describe your change, and ask a teammate to review. Yi Wen merges after approval.

**Continuing yesterday's work?** Do not go back to `main`. Just switch to your branch:

```powershell
git checkout feature/short-task-name
```

**After your PR is merged:** run `git checkout main` then `git pull`, and start the next task on a new branch.

**Useful commands:**

- `git branch` shows your branches (the current one has a `*`).
- `git status` shows what you changed.

## Part 3: Team rules

### Git rules

1. Never push directly to `main`. Always use a branch and a pull request.
2. One branch per task. Name it after the task, lowercase with `-`, like `feature/wishlist-ui` or `fix/login-error`.
3. Run `git pull` on `main` before starting any new branch.
4. Make small commits with clear messages. Good: `add wishlist card component`. Bad: `update`.
5. Every PR needs one teammate's review before merging.
6. Run all commands from the repo folder (the one with `package.json`). Never create a second Git repo inside it.

### Security rules (very important)

1. Never commit `.env`. Never paste keys into GitHub, screenshots or public chats.
2. The frontend may only use the Supabase **anon/publishable** key. Never use the `service_role` key or the Gemini API key in frontend code.
3. Every database table must have Row Level Security (RLS) turned on, with its policies written in the same migration file. Never turn RLS off to "make it work". Fix the policy instead.
4. No real children's names or photos in the app, the repo or test data. Use placeholders.
5. Payments are bank transfer / DuitNow only. Never collect or store card numbers.

### Code rules

1. Before every commit, `npm run lint` and `npm run build` must both pass.
2. Functional React components only, one component per file.
3. Use Tailwind utility classes only, and design for mobile first.
4. Put data fetching in hooks (`src/hooks/`), not inside components.
5. Always handle loading, error and empty states.
6. All database changes go in `supabase/migrations/` as SQL files, not only by clicking in the dashboard.
7. Use the one shared Supabase client in `src/lib/supabase.js`. Do not create new clients.
8. Ask in the group chat before adding any new npm package.

### Testing rules

1. Add a test for every bug fix and for any non-trivial logic (Vitest).
2. Cypress is for key user flows only. Use `data-cy` attributes for selectors.
3. Cypress tests use a separate test user and never touch real data.
4. Test PWA behaviour with `npm run build` then `npm run preview`, never `npm run dev`.

### Team habits

1. Run `git pull` before starting work each day.
2. Update the Kanban board when you start and finish a task.
3. Tell the group early if you are blocked.

## Who does what next

- **Sarah:** Step 3, database schema and RLS policies.
- **Hazeeq:** wireframes in Figma for the wishlist and subscription screens.
- **Nabilah:** set up Vitest, Cypress and the test user.
- **Yi Wen:** PWA shell, navigation and wishlist UI.
