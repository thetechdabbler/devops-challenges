# Build Instructions — Unit 1: setup

## Prerequisites

- **Node.js**: 20 LTS (`node:20-alpine` in Docker, or `node --version` ≥ 20 locally)
- **npm**: bundled with Node 20
- **Docker**: required to run PostgreSQL locally
- **Environment Variables**: see `.env.example` — must copy to `.env` and fill values before `npm run dev` or `npm start`

## Build Steps

### 1. Install Backend Dependencies

```bash
cd portal/backend
npm install
```

Expected output: `added N packages, audited N packages`, `found 0 vulnerabilities`

### 2. Generate Prisma Client

```bash
npx prisma generate
```

Expected output: `✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client`

> Must be run once after `npm install` and after any schema change.

### 3. TypeScript Compile Check

```bash
npm run build
```

Expected output: silent (no errors). Artifacts written to `dist/`.

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Expected output: `added N packages, audited N packages`, `found 0 vulnerabilities`

### 5. Verify Frontend Build

```bash
npm run build
```

Expected output: Vite build summary — `dist/index.html` + hashed JS/CSS bundles.

## Build Artifacts

| Location | Contents |
|----------|----------|
| `portal/backend/dist/` | Compiled JS — entry: `dist/index.js` |
| `portal/backend/node_modules/.prisma/` | Generated Prisma client bindings |
| `portal/frontend/dist/` | Bundled SPA — served by nginx in Docker |

## Troubleshooting

### `Cannot find module '@prisma/client'`
**Cause**: `prisma generate` not run after install.
**Fix**: `cd portal/backend && npx prisma generate`

### TypeScript error on `src/lib/prisma.ts`
**Cause**: Prisma client not generated; types are missing.
**Fix**: Run `npx prisma generate` first.

### Frontend build: `Cannot find module 'vite'`
**Cause**: `npm install` not run in `portal/frontend/`.
**Fix**: `cd portal/frontend && npm install`
