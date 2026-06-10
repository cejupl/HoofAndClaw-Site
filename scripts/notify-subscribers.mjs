#!/usr/bin/env node
/**
 * Turn a newly-published blog post into a Kit (ConvertKit) broadcast to your
 * subscribers.
 *
 * Scans src/content/blog for non-draft posts. For any post not yet in
 * scripts/.notified.json it creates a Kit broadcast, then records the slug.
 *
 * By default it creates the broadcast as a DRAFT — you review and hit send in
 * Kit (recommended for a newsletter). Pass --send to schedule it immediately.
 *
 * Usage:
 *   KIT_API_KEY=xxx node scripts/notify-subscribers.mjs            # create draft
 *   KIT_API_KEY=xxx node scripts/notify-subscribers.mjs --send     # send now
 *   node scripts/notify-subscribers.mjs --dry-run                  # preview only
 *
 * Get an API key: Kit → Settings → Advanced → API (v4 key). Commit the updated
 * scripts/.notified.json so a post is never announced twice.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const LEDGER = join(__dirname, '.notified.json');

const SITE = process.env.SITE_URL || 'https://hoofandclaw.game';
const KEY = process.env.KIT_API_KEY;
const DRY = process.argv.includes('--dry-run');
const SEND = process.argv.includes('--send');

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

const loadLedger = () => {
  if (!existsSync(LEDGER)) return [];
  try { return JSON.parse(readFileSync(LEDGER, 'utf8')); } catch { return []; }
};

async function createBroadcast({ subject, html }) {
  const body = {
    subject,
    content: html,
    public: false,
    // Setting send_at schedules the broadcast; omitting it leaves a draft.
    ...(SEND ? { send_at: new Date().toISOString() } : {}),
  };
  const res = await fetch('https://api.kit.com/v4/broadcasts', {
    method: 'POST',
    headers: { 'X-Kit-Api-Key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Kit ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!existsSync(BLOG_DIR)) { console.error('No blog dir at', BLOG_DIR); process.exit(1); }
  const ledger = loadLedger();
  const today = new Date();
  const pending = [];
  for (const file of readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f))) {
    const slug = file.replace(/\.mdx?$/, '');
    if (ledger.includes(slug)) continue;
    const fm = parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf8'));
    if (fm.draft === true) continue;
    if (fm.date && new Date(fm.date) > today) continue;
    pending.push({ slug, fm });
  }

  if (pending.length === 0) { console.log('✓ Nothing new to announce.'); return; }

  console.log(`${pending.length} post(s)${DRY ? ' (dry run)' : SEND ? ' → SEND NOW' : ' → draft'}:`);
  for (const { slug, fm } of pending) {
    const url = `${SITE}/blog/${slug}/`;
    const subject = `${site_name()}: ${fm.title}`;
    const html =
      `<p>${escapeHtml(fm.description)}</p>` +
      `<p><a href="${url}">Read the full update →</a></p>` +
      `<p>— The Hoof &amp; Claw team</p>` +
      `<p style="color:#888;font-size:13px">You're getting this because you joined the waitlist. Trust no one. 🦓</p>`;

    console.log(`  • ${slug} → "${subject}"`);
    if (DRY) continue;
    if (!KEY) { console.error('  ✗ KIT_API_KEY not set.'); process.exit(1); }
    try {
      await createBroadcast({ subject, html });
      ledger.push(slug);
      writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n');
      console.log(SEND ? '    ✓ broadcast scheduled + recorded' : '    ✓ draft created in Kit + recorded (review & send there)');
    } catch (e) { console.error('    ✗', e.message); process.exit(1); }
  }
  if (DRY) console.log('\nDry run — nothing created, ledger unchanged.');
}

const site_name = () => 'Hoof & Claw';
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

main();
