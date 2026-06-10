/**
 * Central site config. Swap placeholders (buttondownUsername, links) before launch.
 */
export const site = {
  name: 'Hoof & Claw',
  // Short, evocative hero line.
  tagline: 'Watch the grass. Trust no one. Survival is the only law.',
  // Hero lore (no rules revealed).
  intro: {
    lead: 'Under the relentless heat of the golden sun, an uneasy peace holds at the watering hole. Among the wandering Herd, a hungry Pack has hidden in plain sight.',
    body: 'Hoof & Claw is a battle of power, deception, deduction, and survival — the Herd must unite before the migration ends, while the Pack hunts from within and Chaos waits for the perfect moment.',
    flourish: 'The migration has begun.',
  },
  // One-sentence positioning — catchy + thematic, no rules revealed.
  positioning:
    'A board game & companion app that turns any gathering into a night of hope, fear, and beautiful betrayal.',
  description:
    'Hoof & Claw is a board game + companion app of social deduction on the savanna. Friends by day, predators by night. 6–20 players, 15–45 minutes, ages 13+. Join the waitlist for the Kickstarter.',
  domain: 'https://hoofandclaw.org',

  // Play stats (advertised).
  stats: [
    { value: '6–20', label: 'Players' },
    { value: '15–45', label: 'Minutes' },
    { value: '13+', label: 'Ages' },
  ],

  // Kit (ConvertKit) signup form. Create a Form in Kit, then use its ID — the
  // number in the form's embed URL: app.kit.com/forms/<THIS>/subscriptions.
  kitFormId: '9548265',

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
