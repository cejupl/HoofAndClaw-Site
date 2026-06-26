import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { quiz } from '../../config';

// On-demand (serverless) route — NOT prerendered — so the API key stays server-side.
export const prerender = false;

/**
 * The Hoof & Claw roster. Kept server-side: the browser only ever sees the role
 * the visitor is assigned, never the full list or these identity hints. Each
 * `identity` is a one-line steer for Claude, not marketing copy.
 */
const ROLES: { name: string; faction: 'herd' | 'pack' | 'chaos'; identity: string }[] = [
  // Herd — the many, surviving by trust.
  { name: 'Elephant', faction: 'herd', identity: 'The Titan — immovable and protective, the herd\'s living wall.' },
  { name: 'Hippo', faction: 'herd', identity: 'The Retaliator — placid until provoked, strikes back even from death.' },
  { name: 'Rhino', faction: 'herd', identity: 'The Shield — stands guard over a neighbor through the night.' },
  { name: 'Cape Buffalo', faction: 'herd', identity: 'The Iron Horn — silences and subdues through sheer presence.' },
  { name: 'Giraffe', faction: 'herd', identity: 'The High Watch — sees danger coming before anyone else.' },
  { name: 'Zebra', faction: 'herd', identity: 'The Unpredictable — survival on a coin-flip, chaos as camouflage.' },
  { name: 'Boar', faction: 'herd', identity: 'The Informant — even in death, drags the truth into the light.' },
  { name: 'Honey Badger', faction: 'herd', identity: 'The Wall — fearless, nearly unkillable, gives no ground.' },
  { name: 'Pangolin', faction: 'herd', identity: 'The Witness — curls away from one fatal blow, then bears the cost.' },
  { name: 'Meerkat', faction: 'herd', identity: 'The Investigator — one careful look that reveals friend or fang.' },
  { name: 'Rabbit', faction: 'herd', identity: 'The Spreader — small, but tips the vote from beyond the grave.' },
  // Pack — hunters wearing familiar faces.
  { name: 'Lion', faction: 'pack', identity: 'The Enforcer — leads the hunt; their word counts double.' },
  { name: 'Black Panther', faction: 'pack', identity: 'The Assassin — strikes alone from the shadows.' },
  { name: 'Cheetah', faction: 'pack', identity: 'The Escape Artist — too fast to catch, slips a death.' },
  { name: 'Wild Dog', faction: 'pack', identity: 'The Brawler — stronger in numbers, relentless.' },
  { name: 'Hyena', faction: 'pack', identity: 'The Echo — learns the night\'s secrets and laughs last.' },
  // Chaos — neither prey nor pack.
  { name: 'Crocodile', faction: 'chaos', identity: 'The Apex — patient, unaligned, outlasts them all.' },
  { name: 'Black Mamba', faction: 'chaos', identity: 'The Trap — kill it and its venom takes you too.' },
  { name: 'Vulture', faction: 'chaos', identity: 'The Opportunist — profits from the fallen, wins by surviving the carnage.' },
];

const ROLE_NAMES = ROLES.map((r) => r.name);

const SYSTEM = `You are the Monkey, the all-seeing narrator of the savanna board game "Hoof & Claw" — a game of social deduction, trust, and beautiful betrayal. Your voice is dramatic, vivid, and a little ominous, like a storyteller around a fire.

A visitor has answered five personality questions. Assign them the ONE animal role from the roster below that best matches their answers, then write their reveal.

ROSTER (choose exactly one):
${ROLES.map((r) => `- ${r.name} (${r.faction}): ${r.identity}`).join('\n')}

Rules:
- Pick the single best-fitting role. Spread your picks across all three factions depending on the answers — don't default to the Herd.
- "faction" MUST be the roster faction of the role you chose.
- "tagline": at most 8 words, punchy, title-case-ish, no period.
- "description": 2–3 sentences, second person ("You are..."), dramatic and flattering-but-honest, in the savanna voice. Capture why this animal fits them. Do NOT explain game rules or mechanics — evoke character, not instructions.
- "shareText": ONE first-person sentence the visitor would post on social media, e.g. "I'm the Crocodile in Hoof & Claw 🐊 — patient, unaligned, the last one standing." Include a fitting emoji.
- Keep it PG-13 and inclusive.`;

const SCHEMA = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ROLE_NAMES },
    faction: { type: 'string', enum: ['herd', 'pack', 'chaos'] },
    tagline: { type: 'string' },
    description: { type: 'string' },
    shareText: { type: 'string' },
  },
  required: ['role', 'faction', 'tagline', 'description', 'shareText'],
  additionalProperties: false,
} as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  // On Cloudflare Pages the secret lives on the runtime env (set in the Pages
  // dashboard, or in .dev.vars locally via platformProxy). Fall back to
  // import.meta.env / process.env so it also works under a plain Node dev server.
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string | undefined> } })
    .runtime?.env;
  const apiKey =
    runtimeEnv?.ANTHROPIC_API_KEY ??
    import.meta.env.ANTHROPIC_API_KEY ??
    (typeof process !== 'undefined' ? process.env?.ANTHROPIC_API_KEY : undefined);
  if (!apiKey) {
    return json({ ok: false, error: 'The savanna is quiet right now. Please try again later.' }, 503);
  }

  // Parse + validate the submission strictly against the known quiz. This bounds
  // input (no arbitrary prompt injection / cost abuse): every answer must match a
  // real question + option id, and all questions must be answered exactly once.
  let answers: { questionId: string; optionId: string }[];
  try {
    const body = (await request.json()) as { answers?: unknown };
    if (!Array.isArray(body.answers)) throw new Error('answers must be an array');
    answers = body.answers as { questionId: string; optionId: string }[];
  } catch {
    return json({ ok: false, error: 'Invalid submission.' }, 400);
  }

  if (answers.length !== quiz.questions.length) {
    return json({ ok: false, error: 'Please answer all questions.' }, 400);
  }

  const transcript: string[] = [];
  for (const q of quiz.questions) {
    const a = answers.find((x) => x && x.questionId === q.id);
    const opt = a && q.options.find((o) => o.id === a.optionId);
    if (!opt) {
      return json({ ok: false, error: 'Please answer all questions.' }, 400);
    }
    transcript.push(`Q: ${q.prompt}\nA: ${opt.label}`);
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 800,
      system: SYSTEM,
      // `effort: medium` keeps this fast and cost-controlled for a public endpoint;
      // bump to `high` for richer prose, or swap the model to `claude-haiku-4-5`
      // for the cheapest/fastest option.
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [
        {
          role: 'user',
          content: `Here are the visitor's answers:\n\n${transcript.join('\n\n')}\n\nAssign their Hoof & Claw animal.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in response');
    }
    const result = JSON.parse(textBlock.text);
    return json({ ok: true, result });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Quiz Claude error ${err.status}:`, err.message);
    } else {
      console.error('Quiz error:', err);
    }
    return json({ ok: false, error: 'The Monkey could not read the grass. Please try again.' }, 502);
  }
};
