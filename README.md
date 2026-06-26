# Hoof & Claw — marketing site

A cinematic, scroll-driven landing site + dev-log blog for **Hoof & Claw**, a
board game + companion app of social deduction on the savanna.

Built with **Astro 5 + Tailwind v4**, deploys free to **Vercel** (or Cloudflare/
Netlify). The hero scrolls through three faction-themed acts — golden **Dawn /
Herd**, bloodied **Dusk / Pack**, dark **Night / Chaos** — using real artwork that
cross-fades and grades on scroll, with atmospheric particles and a 3D emblem.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output -> dist/
npm run preview    # serve the production build
```

Requires Node 18+ (tested on Node 24).

## Project layout

```
src/
  components/   SceneBackdrop (dawn→dusk→night engine), Particles, Newsletter
  layouts/      Base.astro (SEO head + backdrop)
  pages/        index.astro (landing), blog/ (dev log), rss.xml.js
  content/blog/ Markdown/MDX posts (the dev log)
  assets/       emblem.png, scenes/, factions/, gallery/  (optimized at build)
    incoming/   your Midjourney masters (git-ignored; source of truth)
  config.ts     site name, stats, positioning, Buttondown username, social links
scripts/
  notify-subscribers.mjs   emails subscribers when a new post publishes
public/         favicon.svg, og-image.png, robots.txt
```

## Configure before launch

Edit `src/config.ts`:
- `kitFormId` — your Kit (ConvertKit) form ID (waitlist form posts here).
- `links` — Kickstarter / Discord / Instagram / BGG (empty = hidden).
- `domain` — your real domain (also update `site` in `astro.config.mjs`).

## Newsletter + waitlist (Kit / ConvertKit — free to 10k subscribers)

1. Create a free account at <https://kit.com>.
2. **Grow → Landing Pages & Forms → Create a Form** (Inline). Save it.
3. Copy the **form ID** — it's the number in the form's embed/share URL:
   `app.kit.com/forms/<THIS_NUMBER>/subscriptions`.
4. Put that number in `src/config.ts` → `kitFormId`.

The hero/CTA forms now subscribe visitors straight into Kit (double opt-in /
unsubscribe handled by Kit). No API key is exposed on the site.

## "Which Animal Are You?" quiz (Claude-powered)

`/quiz` is an interactive 5-question quiz: Claude reads the answers and assigns
the visitor a Hoof & Claw role (Herd / Pack / Chaos) with a dramatic write-up,
then a "Claim your role" CTA pushes them to the Kickstarter (or the waitlist).

How it works:
- `src/components/AnimalQuiz.astro` — the UI (questions + result card + share).
- `src/pages/api/quiz.ts` — an **on-demand** route (`prerender = false`) that runs
  as a **Cloudflare Pages Function** and calls Claude. The role roster and the API
  key stay server-side; the browser only ever sees its assigned role.
- The rest of the site stays static. The `@astrojs/cloudflare` adapter enables the
  single dynamic route (build emits `dist/_worker.js`).

Setup (Cloudflare Pages):
1. **Get a key:** <https://platform.claude.com> → add billing → API keys → Create.
2. **Production:** Cloudflare dashboard → your Pages project → **Settings →
   Variables and Secrets** → add `ANTHROPIC_API_KEY` (as a **Secret**) for
   Production *and* Preview, then redeploy.
3. **Node compatibility:** the Anthropic SDK needs it. In the Pages project →
   **Settings → Functions → Compatibility flags**, add `nodejs_compat` to both
   Production and Preview (and set a recent Compatibility date). (We intentionally
   do **not** ship a `wrangler.toml` — it flips Cloudflare into Workers-deploy
   mode and breaks the Pages auto-publish; leave the project's **Deploy command
   empty** so Pages publishes the `dist` output automatically.)
4. **Local testing:** create `.dev.vars` (gitignored) with
   `ANTHROPIC_API_KEY=sk-ant-...`, then `npm run dev` and open `/quiz`.
5. Set `links.kickstarter` in `src/config.ts` once the campaign is live — the quiz
   CTA points there; until then it falls back to the waitlist.

Cost/quality knobs live in `src/pages/api/quiz.ts`: the model is `claude-opus-4-8`
at `effort: medium` (≈ a fraction of a cent per quiz). For a cheaper/faster public
endpoint, switch the model to `claude-haiku-4-5`. Submissions are validated against
the known questions before any API call, so the endpoint can't be used to send
arbitrary prompts.

## Writing dev-log posts

Add a Markdown file to `src/content/blog/`, e.g. `my-update.md`:

```markdown
---
title: My update
description: One-line summary (also used in the email + social preview).
date: 2026-06-15
tag: Dev log
cover: ../../assets/scenes/dusk.png   # optional
coverAlt: Dusk over the savanna
draft: false                          # true = hidden + never emailed
---

Your post body in Markdown…
```

It appears at `/blog` and `/blog/my-update`, and in the RSS feed at `/rss.xml`.

## Emailing subscribers on each new post (Kit broadcasts)

After publishing a new (non-draft) post:

```bash
KIT_API_KEY=xxxxx npm run notify            # create a DRAFT broadcast in Kit
KIT_API_KEY=xxxxx npm run notify -- --send  # create + send immediately
npm run notify -- --dry-run                 # preview, nothing created
```

Get the key at **Kit → Settings → Advanced → API** (v4). By default it creates a
**draft** broadcast (recommended — review/polish in Kit, then hit send). It
records announced posts in `scripts/.notified.json` (commit it so a post is never
announced twice). Run locally or as a CI step after deploy.

## Deploy to Cloudflare Pages (free, unlimited bandwidth)

1. Push this folder to its own GitHub repo.
2. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**,
   pick the repo.
3. Build settings (auto-detected for Astro, but confirm):
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. You get a `*.pages.dev` URL immediately.
5. **Custom domain:** Pages → your project → Custom domains → add your domain.
   Cheapest domain: **Cloudflare → Registrar** (sold at cost, no renewal markup).

> Vercel/Netlify work identically (same build command + `dist` output) if you
> ever switch.

## Swapping art

Drop new masters in `src/assets/incoming/`, copy the ones you want into
`scenes/` (dawn/dusk/night), `factions/` (herd/pack/chaos), `gallery/`, or
`emblem.png`. Astro optimizes them to responsive WebP at build time. If a PNG has
a baked-in white/checkerboard background, key it out first (the emblem and
banners were processed this way).
