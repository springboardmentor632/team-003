# DecisionHub Frontend

A React (Vite) frontend implementing the uploaded DecisionHub design — the warm-paper editorial
style with teal/brass/coral accents, Fraunces display type, and the "tipping bar" as the signature
voting visual. Wired to the Spring Boot backend from Modules 1 & 2.

## Setup

1. Make sure the backend (`decisionhub-backend`) is running on `http://localhost:8080`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env example and adjust if your backend runs elsewhere:
   ```bash
   cp .env.example .env
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Pages built

| Route | Page | Wired to backend? |
|---|---|---|
| `/` | Landing page | Static (marketing copy) |
| `/login`, `/register` | Auth | Yes — real JWT login/register |
| `/dashboard` | Dashboard | Yes — `GET /api/decisions/mine` |
| `/boards` | Browse boards (public/mine, category filter) | Yes — `GET /api/decisions/public` and `/mine` |
| `/boards/new` | Create a decision board | Yes — `POST /api/decisions` |
| `/boards/:id` | Board detail — comparison, criteria table, voting | Yes — `GET /api/decisions/:id`, `POST/DELETE .../votes` |
| `/analytics` | Analytics | Yes — computed client-side from your visible decisions |
| `/communities` | Communities | **Preview only** — no backend yet (Module 3) |

## Known limitations (by design, for now)

- **"You voted for this" only persists for the current browser session.** The backend doesn't yet
  expose which options the logged-in user has voted for on a `GET`, so the frontend tracks it in
  local component state after you vote. Refreshing the page will show the current results but not
  re-highlight your specific past vote. Fixing this properly means adding a `myVotes` field to
  `DecisionResponse` on the backend — a small, natural follow-up.
- **Discussion/comments and Communities are UI-only.** Module 3 (comments, notifications, real
  communities) hasn't been built on the backend yet, so those sections show honest "coming soon"
  states instead of fake data.
- **Analytics is computed client-side** from whatever decisions are visible to you (yours + public
  ones), not from a dedicated analytics endpoint. It's accurate for what it shows, just recomputed
  on every page load rather than cached server-side.

## Design notes

All CSS lives in `src/styles/global.css`, ported directly from the uploaded mockup — same class
names, same tokens (`--paper`, `--teal`, `--brass`, `--coral`, etc.), same fonts (Fraunces / Inter /
IBM Plex Mono). If you tweak the design later, that's the one file to edit.

## Next steps

- Build backend Module 3 (discussions, notifications, communities) to light up the remaining pages
- Add `myVotes` to `DecisionResponse` so voted state persists across reloads
- Add pagination controls to Boards (backend already supports `page`/`size`, UI doesn't use them yet)
