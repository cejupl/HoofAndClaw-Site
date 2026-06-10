#!/usr/bin/env node
/**
 * Email subscribers when a new blog post is published.
 *
 * Scans src/content/blog for non-draft posts, and for any post not yet recorded
 * in scripts/.notified.json, creates + sends a Buttondown email, then records it.
 *
 * Usage:
 *   BUTTONDOWN_API_KEY=xxx node scripts/notify-subscribers.mjs        # send
 *   BUTTONDOWN_API_KEY=xxx node scripts/notify-subscribers.mjs --dry-run
 *
 * Run it after deploying a new post (locally, or as a CI step). Commit the
 * updated scripts/.notified.json so the same post is never emailed twice.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const LEDGER = join(__dirname, '.notified.json');

// --- config (keep in sync with src/config.ts) ---
const SITE = process.env.SITE_URL || 'https://hoofandclaw.game';
const FROM_NAME = 'Hoof & Claw';

const DRY = process.argv.includes('--dry-run');
const KEY = process.env.BUTTONDOWN_API_KEY;

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/^["']|["']$/g, '');
    if (v === 'true') v = true;
    else if (v === 'false') v = false;
    data[mm[1]] = v;
  }
  return data;
}

function loadLedger() {
  if (!existsSync(LEDGER)) return [];
  try {
    return JSON.parse(readFileSync(LEDGER, 'utf8'));
  } catch {
    return [];
  }
}

async function sendEmail({ subject, body }) {
  const res = await fetch('https://api.buttondown.email/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Token ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject, body, status: 'about_to_send' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Buttondown ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  if (!existsSync(BLOG_DIR)) {
    console.error('No blog dir at', BLOG_DIR);
    process.exit(1);
  }
  const files = readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));
  const ledger = loadLedger();
  const today = new Date();

  const pending = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '');
    if (ledger.includes(slug)) continue;
    const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
    const fm = parseFrontmatter(raw);
    if (fm.draft === true) continue;
    if (fm.date && new Date(fm.date) > today) continue; // future-dated
    pending.push({ slug, fm });
  }

  if (pending.length === 0) {
    console.log('✓ Nothing new to send.');
    return;
  }

  console.log(`${pending.length} post(s) to announce${DRY ? ' (dry run)' : ''}:`);
  for (const { slug, fm } of pending) {
    const url = `${SITE}/blog/${slug}/`;
    const subject = `${FROM_NAME}: ${fm.title}`;
    const body =
      `${fm.description}\n\n` +
      `[Read the full update →](${url})\n\n` +
      `— The Hoof & Claw team\n\n` +
      `You're getting this because you joined the waitlist. Trust no one. 🦓`;

    console.log(`  • ${slug} → "${subject}"`);
    if (DRY) continue;
    if (!KEY) {
      console.error('  ✗ BUTTONDOWN_API_KEY not set — skipping send.');
      process.exit(1);
    }
    try {
      await sendEmail({ subject, body });
      ledger.push(slug);
      writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
      console.log('    ✓ sent + recorded');
    } catch (e) {
      console.error('    ✗', e.message);
      process.exit(1);
    }
  }
  if (DRY) console.log('\nDry run — no emails sent, ledger unchanged.');
}

main();
