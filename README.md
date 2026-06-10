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
