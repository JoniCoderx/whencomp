// 100% local, free, no external APIs.
// "Smart" features (post-match summaries + lobby banter) are generated from
// hand-written funny templates seeded deterministically off the input, so the
// same lobby/match always gets the same line (no randomness needed server-side).

function seedFrom(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ---- Post-match summary ----------------------------------------------------

export interface SummaryInput {
  title: string;
  game: string;
  mvp?: string | null;
  players: string[];
}

const SUMMARY_TEMPLATES = [
  (i: SummaryInput) =>
    `GG! ${i.mvp ?? "the squad"} hard-carried the ${i.game} lobby while everyone else "had a bad angle." History was made — or at least screenshots were.`,
  (i: SummaryInput) =>
    `The ${i.game} gods smiled on ${i.mvp ?? "someone"} tonight. Clutches were clutched, and at least one person definitely blamed their internet.`,
  (i: SummaryInput) =>
    `Another ${i.game} classic in the books. ${i.mvp ?? "The MVP"} popped off; the rest of the lobby is "just warming up."`,
  (i: SummaryInput) =>
    `Scenes in ${i.game}: ${i.mvp ?? "our hero"} went full main-character mode. Somebody's keyboard did not survive the last round.`,
  (i: SummaryInput) =>
    `${i.mvp ?? "The MVP"} said "trust me" and — shockingly — it worked. The rest of the ${i.game} squad is updating their excuses as we speak.`,
];

export function generateSummary(input: SummaryInput): string {
  const seed = seedFrom(input.title + input.game + (input.mvp ?? "") + input.players.join(""));
  return pick(SUMMARY_TEMPLATES, seed)(input);
}

// ---- Lobby banter ----------------------------------------------------------

export interface BanterInput {
  game: string;
  players: string[];
}

const BANTER_TEMPLATES = [
  (names: string, game: string) =>
    `${names} — queue is loaded and the excuses are pre-typed. Let's see who actually shows up in ${game}. 🔥`,
  (names: string, game: string) =>
    `Warning: ${names} entering ${game}. Aim assist not included, ego very much included.`,
  (names: string, game: string) =>
    `${names}, hydration check! One of you is about to hard-carry and the rest will call it a "team effort." Lock in.`,
  (names: string, game: string) =>
    `Breaking: ${names} spotted queuing ${game}. Bookies have suspended betting. 🎯`,
  (names: string, game: string) =>
    `${names} — mics on, egos off. Whoever whiffs the first shot buys the next Discord Nitro.`,
  (names: string, game: string) =>
    `The ${game} lobby has assembled: ${names}. Half of you will clutch, half will "lag." Nobody knows which is which yet.`,
];

export function generateBanter(input: BanterInput): string {
  const names = input.players.length ? input.players.join(", ") : "the lobby";
  const seed = seedFrom(input.game + input.players.join(""));
  return pick(BANTER_TEMPLATES, seed)(names, input.game);
}

// Kept for callers that want to branch UI copy. Always false — no paid AI.
export function aiEnabled(): boolean {
  return false;
}
