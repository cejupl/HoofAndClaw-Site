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
- `buttondownUsername` — your Buttondown handle (waitlist form posts here).
- `links` — Kickstarter / Discord / Instagram / BGG (empty = hidden).
- `domain` — your real domain (also update `site` in `astro.config.mjs`).

## Newsletter + waitlist (Buttondown)

1. Create a free account at <https://buttondown.com> and note your username.
2. Put it in `src/config.ts` → `buttondownUsername`.
3. The hero/CTA forms now subscribe visitors (double opt-in, unsubscribe handled
   by Buttondown).

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

## Emailing subscribers on each new post

After deploying a new (non-draft) post:

```bash
BUTTONDOWN_API_KEY=xxxxx npm run notify            # send
BUTTONDOWN_API_KEY=xxxxx npm run notify -- --dry-run   # preview, no send
```

It emails every subscriber once per post and records sent posts in
`scripts/.notified.json` (commit that file so a post is never emailed twice).
You can run it locally or as a CI step after deploy.

## Deploy to Vercel

1. Push this folder to its own GitHub repo.
2. In Vercel: **New Project → import the repo**. Astro is auto-detected
   (build `astro build`, output `dist/`). No env vars needed for the site itself.
3. Add your custom domain in Vercel → Settings → Domains.
4. (Optional) Add `BUTTONDOWN_API_KEY` as a Vercel env var only if you wire the
   notify script into a deploy hook; otherwise run `npm run notify` locally.

Cloudflare Pages / Netlify work the same way (build `npm run build`, output
`dist`).

## Swapping art

Drop new masters in `src/assets/incoming/`, copy the ones you want into
`scenes/` (dawn/dusk/night), `factions/` (herd/pack/chaos), `gallery/`, or
`emblem.png`. Astro optimizes them to responsive WebP at build time. If a PNG has
a baked-in white/checkerboard background, key it out first (the emblem and
banners were processed this way).
