# Requirements Clarification Questions — DevOps Practice Portal

Please answer each question by filling in the letter after the `[Answer]:` tag.
If none of the options fit, choose the last option (Other) and describe your preference.

Let me know when you're done.

---

## Question 1
What type of application should the portal be?

A) Static site / client-side only (no backend, runs entirely in the browser)
B) Full-stack web app (frontend + backend API + database)
C) Next.js / Nuxt.js app (SSR/SSG with optional API routes)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
Where should user progress and notes be stored?

A) Browser localStorage only (no account needed, data stays on device)
B) Backend database with user accounts (persists across devices)
C) GitHub (store progress/notes as files in a repo via GitHub API)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3
Is user authentication required?

A) No authentication — single-user, local-only experience
B) Yes — simple email/password accounts
C) Yes — GitHub OAuth (sign in with GitHub)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 4
What frontend framework/stack do you prefer?

A) React (with Vite or Next.js)
B) Vue.js (with Vite or Nuxt)
C) Plain HTML/CSS/JS (no framework)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
How should exercise content be loaded into the portal?

A) Read directly from the devops-challenges/ directory at build time (static generation)
B) Serve the markdown files via a local/backend API at runtime
C) Embed/copy exercise content into the portal's own data files
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
What progress tracking granularity do you want?

A) Per-exercise status only (Not Started / In Progress / Completed)
B) Per-exercise status + bug checklist (track which bugs were found/fixed)
C) Per-exercise status + timed sessions (track time spent per exercise)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 7
What should the notes feature support?

A) Plain text notes per exercise (simple textarea)
B) Markdown notes per exercise (rendered preview)
C) Notes per exercise + global scratch pad
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 8
Where will the portal be deployed / run?

A) Local development only (run with `npm run dev`, no public hosting)
B) GitHub Pages or Netlify (static hosting)
C) Self-hosted on a VPS/server
D) Other (please describe after [Answer]: tag below)

[Answer]: B
