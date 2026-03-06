# Coding Standards

## Overview
Code style and quality standards for a TypeScript Next.js full-stack application.

## Code Formatting
Prettier

Opinionated, zero-config formatter. Run on save and enforced in CI. No custom rules — let Prettier decide.

## Linting Rules
ESLint with Next.js built-in config (`eslint-config-next`)

Extends Next.js recommended rules. Add `@typescript-eslint` for TypeScript-specific checks. No unused variables, no explicit `any`.

## Naming Conventions
- **Variables / functions**: camelCase
- **Components / classes / types / interfaces**: PascalCase
- **Files / folders**: kebab-case (e.g., `user-profile.tsx`, `auth-service.ts`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase for module-level config

## File & Folder Organization
Next.js App Router structure:

```
app/                  # Pages, layouts, route handlers (API)
  (auth)/             # Route groups
  api/                # API route handlers
components/           # Shared React components
lib/                  # Utility functions, helpers, services
db/                   # Drizzle schema, migrations, client
types/                # Shared TypeScript types/interfaces
public/               # Static assets
```

## Testing Strategy
- **Vitest** — unit and integration tests (co-located with source files, `*.test.ts`)
- **Playwright** — end-to-end tests (`e2e/` directory at project root)
- Aim for unit tests on business logic in `lib/`, integration tests on API routes, E2E on critical user flows

## Error Handling Patterns
Throw + catch boundaries pattern:

- Unexpected errors: throw and let Next.js `error.tsx` boundaries catch them
- API routes: wrap handlers in try/catch, return structured error responses (`{ error: string, status: number }`)
- Never swallow errors silently — always log before re-throwing or returning

## Logging Standards
pino for structured JSON logging

- Use pino in API routes and server-side code
- Log level controlled by `LOG_LEVEL` env var
- Always include context: `logger.info({ userId, action }, 'message')`
- Never log sensitive data (passwords, tokens, secrets)
