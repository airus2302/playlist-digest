# AGENTS.md - Development Guidelines for playlist-digest

This document provides guidelines for agentic coding agents working in this React Router 7 project.

## Project Overview

- **Framework**: React Router 7 (full-stack React framework)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: TailwindCSS v4 (CSS-first configuration) + shadcn/ui
- **Build Tool**: Vite 7.1.7
- **Runtime**: Node.js server-side rendering enabled

## Commands

### Development
```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run start        # Serve production build
npm run typecheck    # Run type generation and TypeScript compiler
```

### Testing
*No testing framework is currently configured. If tests are needed, add Vitest or Playwright first.*

## Code Style Guidelines

### File Structure & Organization
- **Routes**: Place route components in `app/routes/`
- **Components**: Use feature-based organization (e.g., `app/welcome/`)
- **Route Registration**: Update `app/routes.ts` using the `RouteConfig` pattern
- **Types**: React Router generates types in `.react-router/types/` - import from `+types/filename`

### Import Patterns
```typescript
// React Router imports
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/route-filename";

// Asset imports (handled by Vite)
import logoDark from "./logo-dark.svg";
import component from "../feature/component";

// Always use type imports for types
import type { SomeType } from "./types";
```

### Component Patterns
```typescript
// Route component with metadata
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Page Title" },
    { name: "description", content: "Page description" },
  ];
}

// Default export for the main component
export default function RouteComponent() {
  return <div>Content</div>;
}

// Named exports for utilities
export function loader({ request }: Route.LoaderArgs) {
  // Data loading logic
}
```

### TypeScript Configuration
- **Strict mode**: Enabled in `tsconfig.json`
- **Path aliases**: Use `~/*` for `app/*` imports
- **JSX**: `react-jsx` transform (no need to import React)
- **Module syntax**: ESM with `verbatimModuleSyntax: true`

### Styling Guidelines
- **Primary**: Use TailwindCSS utility classes + shadcn/ui components
- **Theme**: Inter font, light/dark mode support with CSS variables
- **CSS imports**: Use `@import "tailwindcss";` and `@import "shadcn/tailwind.css";` in CSS files
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Dark mode**: Use `dark:` prefixes for dark mode variants
- **shadcn/ui**: Use pre-built components from `app/components/ui/` with consistent theming

### Naming Conventions
- **Files**: kebab-case for general files, PascalCase for components
- **Components**: PascalCase (e.g., `Welcome`, `PlaylistDigest`)
- **Functions**: camelCase for regular functions, PascalCase for components
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Directories**: lowercase (e.g., `routes`, `welcome`, `components`)

### Error Handling
Use React Router's ErrorBoundary pattern with isRouteErrorResponse for 404s and error handling.

### State Management
- **Server state**: Use React Router loaders/actions
- **Client state**: Use React hooks (useState, useEffect, useContext)
- **URL state**: Use search params for shareable state
- **Form state**: Use React Router's Form component and useFetcher

### Performance & Security
- **Code splitting**: Use dynamic imports for large components
- **Accessibility**: Use semantic HTML and ARIA attributes
- **Security**: React Router auto-escapes content, validate input on both client and server

## Development Workflow

### Adding shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```
Components are added to `app/components/ui/` and can be imported with:
```typescript
import { Button } from "~/components/ui/button";
```

### Adding New Routes
1. Create component file in `app/routes/`
2. Add route to `app/routes.ts` using `RouteConfig` pattern
3. Export `meta` function for SEO metadata
4. Add loader/action functions if data handling is needed

### Styling New Components
1. Use Tailwind utility classes directly in JSX
2. Leverage dark mode variants with `dark:` prefix
3. Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
4. Follow mobile-first responsive design

### Type Safety
- Always import generated types from `+types/filename`
- Use `type` imports for type-only imports
- Enable strict TypeScript checking
- Run `npm run typecheck` before committing

### Best Practices
- Prefer functional components with hooks
- Define prop interfaces for complex components
- Use error boundaries for route-level error handling
- Leverage React Router's pending states for better UX

## Tools & Configuration

### Linting/Formatting
*No linting tools are currently configured. Consider adding ESLint and Prettier.*

## Deployment

### Production Build
```bash
npm run build    # Creates build/ directory
npm run start    # Serves production build
```

## Notes for Agents

1. **No existing linting**: Be extra careful with code consistency
2. **React Router 7 patterns**: Follow framework conventions, not generic React patterns  
3. **Type safety**: TypeScript is strict - ensure all types are properly defined
4. **SSR enabled**: Code must work in both browser and Node.js environments
5. **No test framework**: Set up Vitest or Playwright if tests are needed

Follow patterns in `app/root.tsx`, `app/routes/home.tsx`, and welcome component.