# Tech Stack

## Overview
Full-stack web application built with TypeScript. Backend: Node.js + Express. Frontend: React 18 + Vite SPA. Self-hosted via Docker with GitHub OAuth for authentication and PostgreSQL for data persistence.

## Languages
TypeScript

Full-stack type safety across frontend and backend. Enables consistent data contracts between client and server, better tooling, and catches bugs at compile time.

## Framework
Node.js + Express (backend) / React 18 + Vite (frontend)

Separate backend and frontend apps coordinated via docker-compose. Express handles all API routes. Vite React SPA consumes the API.

> **Note**: Original standards specified Next.js App Router. Decision updated 2026-03-06 to align with existing portal (Option A+). A future migration to Next.js may be planned separately.

## Authentication
GitHub OAuth via passport-github2 + JWT (httpOnly cookies)

Custom JWT-based auth with GitHub OAuth as the identity provider. passport-github2 handles the OAuth dance; JWT is issued and verified by the backend.

## Infrastructure & Deployment
Docker + self-hosted

Containerized via docker-compose.yml. Services run as Docker containers on self-managed infrastructure.

## Package Manager
npm

Default package manager. Widest compatibility with the toolchain in use.

## Decision Relationships
- Express + Vite is the existing portal architecture — reuse avoids a full rewrite
- PostgreSQL handles relational data with Prisma ORM
- Docker deployment aligns with existing docker-compose.yml setup
- GitHub OAuth is the sole auth method — no multi-provider complexity
