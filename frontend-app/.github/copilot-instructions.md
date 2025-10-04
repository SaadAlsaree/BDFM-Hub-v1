# Copilot / AI assistant instructions for contributors

This file tells AI coding agents (and human devs) the most important, repo-specific knowledge needed to be productive fast. Keep it short and actionable.

- Project type: Next.js 15 App Router + TypeScript + Tailwind (RTL primary). See `package.json`, `next.config.js` and `src/app/layout.tsx`.
- Big picture: feature-based monorepo-like structure under `src/features/*`. Shared UI and layout components live in `src/components/*`. Global providers and wiring live in `src/app/*` and `src/providers/*`.

Key architectural touchpoints

- Routing & rendering

  - App Router pages live under `src/app/`. Routes are feature-grouped (e.g. `src/features/correspondence/*`). Layouts and providers are configured in `src/app/layout.tsx` which sets RTL direction and theme handling.
  - Middleware for auth lives in `src/middleware.ts` and uses `next-auth`'s `getToken` to redirect unauthenticated users.

- Data fetching & auth

  - Client API helper and axios instance live in `src/lib/axios.ts`. Use `setAuthToken(token)` to attach Bearer tokens for client API calls (example usage: `src/hooks/use-auth-api.ts`).
  - The project uses `next-auth` (see middleware and hooks). Server actions / API routes are under `src/app/api` or inside features.
  - React Query is wired via `providers/query-client-provider` (imported in `src/app/layout.tsx` via `QueryClientProvider`).

- State & utilities
  - Zustand stores / global state are in `src/stores/` and custom hooks in `src/hooks/`.
  - Nuqs is used for search params state; `NuqsAdapter` is mounted in `src/app/layout.tsx`.

Developer workflows & commands

- Local dev: `npm run dev` (runs `next dev --turbopack -p 3000`). App listens on port 3000.
- Build: `npm run build` then `npm run start` to run the production server on port 3000.
- Lint & format: `npm run lint`, `npm run lint:fix`, `npm run format`.
- Pre-commit hooks: Husky + lint-staged configured; expect pre-commit format checks.

Environment

- Copy `env.example.txt` to `.env.local` and set environment variables (especially `NEXT_PUBLIC_API_URL` and `NEXTAUTH_SECRET`). See `README.md` for the recommended flow.

Patterns & conventions unique to this repo

- RTL-first layout: `src/app/layout.tsx` renders the root HTML with `dir='rtl'`. When adding UI, confirm visual ordering and alignment for RTL.
- Token management: components rarely call axios directly; instead they use `useAuthApi` or call `setAuthToken` to ensure the Authorization header is set/cleared around calls. See `src/hooks/use-auth-api.ts` and `src/lib/axios.ts`.
- Shared component style: Shadcn-style components live in `src/components/ui/` while feature-level components live under each `src/features/<feature>/components/`.
- Feature grouping: Place feature specific routes, components, actions, and schemas under the feature folder (e.g., `src/features/correspondence/`).

Integration points & external services

- API backend: calls use `process.env.NEXT_PUBLIC_API_URL` as the axios base URL. Update `.env.local` accordingly.
- Authentication: `next-auth` session is used; tokens are stored by next-auth and passed to client code via `useSession()`.
- SignalR: The app imports `@microsoft/signalr` in features like notifications and correspondence (search for `SignalR` in `src/features/*`).

How AI should make edits

- Prefer small, well-scoped changes. Update or add files under `src/` (not root-level unrelated changes).
- Preserve existing patterns: use feature folders, keep RTL direction, and use `setAuthToken` or `useAuthApi` for API calls.
- When adding new pages, mirror structure used by nearby features. Add route entry at `src/features/<feature>/` and include components in `src/features/<feature>/components`.
- Run `npm run lint:fix` and `npm run format` before proposing a PR.

Examples to cite in PRs

- Auth-aware API call: `src/hooks/use-auth-api.ts` uses `setAuthToken(session.accessToken)` then clears it after the request.
- Root providers: `src/app/layout.tsx` mounts `NuqsAdapter`, `QueryClientProvider`, `ThemeProvider`, and other global providers — follow its pattern when adding global wiring.
- Middleware auth: `src/middleware.ts` defines `publicPaths` and redirects to `/login` when not authenticated.

Files to read first

- `src/app/layout.tsx` — root layout and providers
- `src/middleware.ts` — auth gating logic
- `src/lib/axios.ts` — axios instance and `setAuthToken`
- `src/hooks/use-auth-api.ts` — example pattern for auth-scoped API calls
- `src/features/*/README.md` — feature-level docs (several exist)

When in doubt

- Follow patterns in the surrounding feature folder. If adding network code, reuse `src/lib/axios.ts` and `useAuthApi`.
- If the change affects global rendering or providers, update `src/app/layout.tsx` and explain why.

If you add or change Copilot instructions, ping the maintainers with a short summary of what changed.

---

Please review this draft and tell me if you'd like more detail on any section (build steps, env vars, or examples for a specific feature).
