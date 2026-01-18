# AGENTS.md — Guidance for Agentic Work on playlist-digest

This file instructs coding agents working in this repository. Follow these rules for all changes unless a more specific AGENTS file appears deeper in the tree (none exist today).

## Stack Snapshot
- Framework: React Router 7 (full-stack, SSR enabled)
- Build tool: Vite 7.1.7
- Language: TypeScript (strict, `verbatimModuleSyntax`)
- Styling: TailwindCSS v4 (CSS-first) + shadcn/ui, tw-animate-css
- Runtime: Node.js SSR server via `react-router-serve`
- Package manager: npm (package-lock.json present)

## Commands (npm)
```bash
npm run dev       # React Router dev server (HMR)
npm run build     # Production build (react-router build)
npm run start     # Serve build/server/index.js (SSR)
npm run typecheck # react-router typegen + tsc
```
- No lint command configured (ESLint/Prettier absent).
- No test command configured (Vitest/Playwright/Jest absent); **single-test runs are unavailable** until a framework is added.

## Repository Landmarks
- `app/root.tsx` — document shell, `<Layout>`, `<ErrorBoundary>` pattern.
- `app/routes.ts` — central RouteConfig (`index`, `route`).
- `app/routes/home.tsx` — marketing/landing route with loader-auth check.
- `app/routes/dev.tsx` + `app/routes/dev.server.ts` — summarize UI + loader defaults.
- `app/routes/api.summarize.ts` — action-only resource route (no UI).
- `app/app.css` — Tailwind v4 setup, theme tokens, dark variant.

## Routing Rules
- Place route files in `app/routes/`; register in `app/routes.ts` using `index()`/`route()`.
- Default export: route component. Use named `meta`/`loader`/`action` as needed.
- Import generated types from `./+types/<route-name>` (e.g., `import type { Route } from "./+types/home"`).
- Resource routes return `null` components and use `data()` helpers for responses.

## TypeScript & Imports
- Strict TS enforced via `tsconfig.json`.
- Path alias: `~/*` → `app/*` (use instead of relative climbing when appropriate).
- Use `import type` for types; keep value imports separate when necessary.
- `jsx: react-jsx`; do not import React unless needed for types.
- Prefer explicit named imports; avoid wildcard imports.

## Error Handling
- Use React Router `isRouteErrorResponse` in ErrorBoundaries to distinguish 404s vs generic errors.
- In dev, surfacing stack traces is acceptable (`import.meta.env.DEV`).
- For actions/loaders, return structured errors with status codes (see `api.summarize.ts`). Avoid swallowing errors; map to user-friendly messages.

## Data Loading & Actions
- Use loaders/actions for server data and mutations; keep UI components presentational when possible.
- For background form submissions, use `useFetcher` (pattern in `dev.tsx`).
- Validate inputs server-side; return field-level errors in a typed shape (see `SummarizeActionData`).
- Avoid browser-only APIs in loaders/actions; guard SSR-sensitive code.

## Styling & UI
- CSS imports (already in `app/app.css`):
  - `@import "tailwindcss";`
  - `@import "tw-animate-css";`
  - `@import "shadcn/tailwind.css";`
  - `@import "@fontsource-variable/noto-sans";`
- Theme tokens defined with `@theme` and `@theme inline`; dark mode via `@custom-variant dark` and `.dark` overrides.
- Prefer Tailwind utilities in JSX; leverage shadcn/ui components from `~/components/ui/*`.
- Keep UI SSR-safe (no direct `window`/`document` without guards).

## Component Patterns
```ts
export function meta({}: Route.MetaArgs) {
  return [{ title: "Title" }, { name: "description", content: "..." }];
}

export async function loader({ request }: Route.LoaderArgs) {
  // server data
}

export default function RouteComponent() {
  return <main>...</main>;
}
```
- Use `LinksFunction` for global links when needed (fonts, preconnects) as in `root.tsx`.
- Keep components functional; define props interfaces for complex inputs.

## Naming Conventions
- Files: kebab-case (routes), PascalCase for components when outside routes.
- Components: PascalCase; hooks/utilities: camelCase; constants: UPPER_SNAKE_CASE.
- Directories: lowercase; feature folders encouraged for shared UI.

## Formatting & Linting
- No formatter configured; preserve existing style (2-space JSX indentation common from Tailwind class wrapping).
- Keep imports ordered: external → internal alias `~/` → relative.
- Do not add `@ts-ignore`/`as any`.

## Performance & Accessibility
- Prefer code splitting for large UI segments when needed (React.lazy or route-level splitting).
- Use semantic HTML and ARIA labels on interactive elements.
- Favor server-side validation; avoid heavy client computation in loaders/actions.

## Environment & Secrets
- `.env` values are required for LLM providers (see `dev.tsx` hints) but this file does not enumerate secrets; consult feature docs before changing env usage.
- Do not log secrets; avoid committing `.env`.

## Database / Queue
- Drizzle ORM and BullMQ are dependencies; follow existing patterns if touching these areas (none shown in inspected files). Avoid schema/tooling changes without confirmation.

## Tests & Single-Test Guidance
- There is **no** test runner configured; single-test execution is impossible until one is added.
- If you add Vitest, prefer `vitest run path/to/file.test.ts --filter "name"` for single cases; document the command when you add it.

## Contribution Workflow for Agents
- Before commits: run `npm run typecheck` (runs typegen + tsc).
- Keep changes minimal and scoped; do not introduce new dependencies unless requested.
- When adding routes: update `app/routes.ts`, add `meta`, and ensure types import from `+types/...`.
- When adjusting UI: respect Tailwind/shadcn patterns and theme tokens.
- When handling errors: return structured `data()` responses with status codes.

## AI Assistant Rules
- No Cursor rule files or GitHub Copilot instruction files were found.
- Default to the guidance in this document; if new AI policy files are added later, obey the most specific one in scope.

## When in Doubt
- Follow patterns in `app/root.tsx`, `app/routes/home.tsx`, `app/routes/dev.tsx`, `app/routes/api.summarize.ts`.
- Ask for clarification before introducing tooling or architectural shifts.
- Keep SSR compatibility in mind for any new code.
