# System Architecture

## Overview
Modular monolith built on Next.js — single deployable unit with clear domain boundaries enforced through folder structure in `lib/`.

## Architecture Style
Modular Monolith

Single Next.js application with domain modules organized under `lib/`. Each domain (e.g., `lib/auth`, `lib/exercises`, `lib/users`) owns its own logic, types, and DB queries. No cross-domain direct imports — domains communicate through well-defined interfaces.

Benefits over microservices for this stage:
- Single deployment unit (simpler Docker setup)
- No network overhead between domains
- Easy to extract to services later if needed

## API Design
Next.js App Router API routes (`app/api/`)

- Route handlers co-located with their domain concern
- RESTful resource-based routing (see API Conventions standard)
- Server Actions for form mutations where appropriate

## State Management
- **Server state**: Fetched in Server Components, cached via Next.js fetch cache
- **Client state**: React useState / useReducer for local UI state
- **No global client state library** (no Redux, Zustand) unless complexity demands it

## Caching Strategy
Next.js built-in caching:
- Route cache for full-page renders
- Fetch cache with `revalidate` for data fetching
- `cache: 'no-store'` for user-specific or real-time data

## Security Patterns
JWT + Next.js Middleware:
- JWTs issued on GitHub OAuth callback, stored in HttpOnly cookies
- `middleware.ts` at project root validates JWT on protected routes
- No sensitive data in JWT payload — only userId and role
- Secrets via environment variables, never hardcoded
