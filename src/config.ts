/**
 * Central site config. Swap placeholders (buttondownUsername, links) before launch.
 */
export const site = {
  name: 'Hoof & Claw',
  // Short, evocative hero line.
  tagline: 'Watch the grass. Trust no one. Survival is the only law.',
  // Hero lore (no rules revealed).
  intro: {
    body: 'Hoof & Claw is a battle of power, deception, and survival - the Herd must unite before the migration ends, while the Pack hunts from within and Chaos waits for the perfect moment.',
    flourish: 'The migration has begun.',
  },
  // One-sentence positioning - catchy + thematic, no rules revealed.
  positioning:
    'A board game & companion app that turns any gathering into a night of hope, fear, and beautiful betrayal.',
  description:
    'Hoof & Claw is a board game + companion app of social deduction on the savanna. Friends by day, predators by night. 6-20 players, 15-45 minutes, ages 13+. Join the waitlist for the Kickstarter.',
  domain: 'https://hoofandclaw.org',

  // Play stats (advertised).
  stats: [
    { value: '6-20', label: 'Players' },
    { value: '15-45', label: 'Minutes' },
    { value: '13+', label: 'Ages' },
  ],

  // Kit (ConvertKit) signup form. Create a Form in Kit, then use its ID - the
  // number in the form's embed URL: app.kit.com/forms/<THIS>/subscriptions.
  kitFormId: '9548265',

  // Community / social links - empty strings are hidden.
  links: {
    kickstarter: '',
    discord: '',
    instagram: '',
    twitter: '',
    bgg: '',
  },
};

/**
 * "Which Animal Are You?" quiz. The questions/options are public (rendered in the
 * UI and used to validate submissions server-side). The mapping from answers to a
 * Hoof & Claw role - and the dramatic write-up - is done by Claude in
 * `src/pages/api/quiz.ts`, where the role roster lives server-side.
 */
export type QuizOption = { id: string; label: string };
export type QuizQuestion = { id: string; prompt: string; options: QuizOption[] };

export const quiz: { questions: QuizQuestion[] } = {
  questions: [
    {
      id: 'q1',
      prompt: 'Dawn breaks at the watering hole. Where are you?',
      options: [
        { id: 'a', label: 'Front and center, rallying everyone together' },
        { id: 'b', label: 'On the edge, watching who watches whom' },
        { id: 'c', label: 'Already three moves ahead of the herd' },
        { id: 'd', label: 'Wherever the food is - politics can wait' },
      ],
    },
    {
      id: 'q2',
      prompt: 'Someone accuses you of being a predator. You…',
      options: [
        { id: 'a', label: 'Calmly turn the suspicion back on them' },
        { id: 'b', label: 'Laugh it off and make them look paranoid' },
        { id: 'c', label: 'Go very still and let others defend you' },
        { id: 'd', label: 'Double down - loudly, fearlessly' },
      ],
    },
    {
      id: 'q3',
      prompt: 'Night falls. Your first instinct is to…',
      options: [
        { id: 'a', label: 'Protect someone you trust' },
        { id: 'b', label: 'Hunt - quietly, precisely' },
        { id: 'c', label: 'Gather information no one else has' },
        { id: 'd', label: 'Wait. Patience is a weapon.' },
      ],
    },
    {
      id: 'q4',
      prompt: 'Your real strength in a group is…',
      options: [
        { id: 'a', label: 'Brute resilience - you outlast everyone' },
        { id: 'b', label: 'Reading people like open books' },
        { id: 'c', label: 'Speed and timing - you strike first' },
        { id: 'd', label: "You're impossible to pin down" },
      ],
    },
    {
      id: 'q5',
      prompt: 'When the game is on the line, you would rather…',
      options: [
        { id: 'a', label: 'Win together, as a team' },
        { id: 'b', label: 'Win alone, entirely by your own design' },
        { id: 'c', label: 'Watch it all burn - and survive the ashes' },
        { id: 'd', label: 'Be the one nobody ever saw coming' },
      ],
    },
  ],
};

export type Faction = {
  id: 'herd' | 'pack' | 'chaos';
  name: string;
  accent: string;
  blurb: string;
};

// High-level theme only - no mechanics.
export const factions: Faction[] = [
  {
    id: 'herd',
    name: 'The Herd',
    accent: 'var(--color-herd-light)',
    blurb:
      'The many, grazing in the open, bound by fragile trust. Their only strength is each other - if they can tell friend from fang before the light fails.',
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
      'Neither prey nor pack. The wild cards play a game all their own - and the savanna bends to whoever is still standing when the telling ends.',
  },
];
