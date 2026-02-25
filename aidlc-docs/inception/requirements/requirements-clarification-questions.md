# Requirements Clarification Questions — DevOps Practice Portal

I detected a contradiction in your responses that needs resolving before I can proceed.

---

## Contradiction: Full-stack app (Q1:B) vs Static hosting (Q8:B)

You chose:
- **Q1 (B)** — Full-stack web app with backend API and database
- **Q2 (B)** — Backend database with user accounts
- **Q3 (C)** — GitHub OAuth authentication
- **Q5 (B)** — Serve exercise content via backend API at runtime
- **Q8 (B)** — GitHub Pages or Netlify (described as "static hosting")

**The problem**: GitHub Pages is purely static — it cannot run server-side code, API routes, or connect to a database. Netlify *can* support serverless functions, but that is a different architecture than traditional static hosting and requires choosing the right stack.

Your full requirements (GitHub OAuth + database + API serving markdown) need server-side execution. Here are three valid paths:

---

### Clarification Question 1
Which hosting and architecture approach do you want to use?

A) **Netlify + Next.js** — Deploy a Next.js app to Netlify using Netlify Functions as the serverless backend. Database via Supabase (managed PostgreSQL). GitHub OAuth via NextAuth.js. This gives a unified React + API codebase and deploys to Netlify's free tier.

B) **Vercel + Next.js** — Same stack as above but deployed on Vercel (which is purpose-built for Next.js). Better Next.js support, generous free tier. GitHub OAuth via NextAuth.js. Database via Supabase or Neon.

C) **Self-hosted VPS (Node.js + Express/Fastify backend + React frontend)** — Traditional full-stack: separate backend API server and React SPA. Full control, requires a VPS (DigitalOcean, Hetzner, etc.). GitHub OAuth via Passport.js. Database via PostgreSQL.

D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

> **Recommendation**: Option A or B (Next.js) gives you React (Q4:A), GitHub OAuth, database persistence, and API-served content in a single unified codebase — plus a generous free hosting tier. The only difference is Netlify (A) vs Vercel (B). Vercel is slightly simpler for Next.js deployments.
