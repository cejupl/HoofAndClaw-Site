/**
 * Central site config. Swap placeholders (buttondownUsername, links) before launch.
 */
export const site = {
  name: 'Hoof & Claw',
  // Short, evocative hero line.
  tagline: 'Trust is the rarest prey.',
  // One-sentence positioning — catchy + thematic, no rules revealed.
  positioning:
    'A board game and companion app that turns any gathering into a night of hope, fear, and beautiful betrayal.',
  description:
    'Hoof & Claw is a board game + companion app of social deduction on the savanna. Friends by day, predators by night. 6–20 players, 15–45 minutes, ages 13+. Join the waitlist for the Kickstarter.',
  domain: 'https://hoofandclaw.game',

  // Play stats (advertised).
  stats: [
    { value: '6–20', label: 'Players' },
    { value: '15–45', label: 'Minutes' },
    { value: '13+', label: 'Ages' },
  ],

  // Kit (ConvertKit) signup form. Create a Form in Kit, then use its ID — the
  // number in the form's embed URL: app.kit.com/forms/<THIS>/subscriptions.
  kitFormId: 'YOUR_FORM_ID',

  // Community / social links — empty strings are hidden.
  links: {
    kickstarter: '',
    discord: '',
    instagram: '',
    twitter: '',
    bgg: '',
  },
};

export type Faction = {
  id: 'herd' | 'pack' | 'chaos';
  name: string;
  accent: string;
  blurb: string;
};

// High-level theme only — no mechanics.
export const factions: Faction[] = [
  {
    id: 'herd',
    name: 'The Herd',
    accent: 'var(--color-herd-light)',
    blurb:
      'The many, grazing in the open, bound by fragile trust. Their only strength is each other — if they can tell friend from fang before the light fails.',
  },
  {
    id: 'pack',
    name: 'The Pack',
    accent: 'var(--color-pack-light)',
    blurb:
      'Hunters wearing familiar faces. They move with the dark, patient and coordinated, thinning the herd one quiet night at a time.',
  },
  {
    id: 'chaos',
    name: 'Chaos',
    accent: 'var(--color-chaos-teal)',
    blurb:
      'Neither prey nor pack. The wild cards play a game all their own — and the savanna bends to whoever is still standing when the telling ends.',
  },
];
