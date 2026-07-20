// 100% local, no APIs. Hebrew post-match summary from hand-written templates,
// seeded deterministically so the same match always gets the same line.

function seedFrom(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export interface SummaryInput {
  title: string;
  game: string;
  mvp?: string | null;
  players: string[];
}

const TEMPLATES = [
  (i: SummaryInput) =>
    `קומפ מעולה! ${i.mvp ?? "מישהו"} סחב את כל ה-${i.game} וכולם כבר מתאמנים על תירוצים לפעם הבאה. 🎯`,
  (i: SummaryInput) =>
    `אלופים של ${i.game}. ${i.mvp ?? "ה-MVP"} עשה את ההבדל, והשאר "היו בזווית לא טובה". GG.`,
  (i: SummaryInput) =>
    `עוד קלאסיקה ב-${i.game}. ${i.mvp ?? "המנצח"} פוצץ, וכבר יש בקשות לריווינץ׳.`,
  (i: SummaryInput) =>
    `${i.mvp ?? "מישהו"} נכנס למצב מיין-קרקטר. המקלדת לא שרדה את הסיבוב האחרון. 🔥`,
];

export function generateSummary(input: SummaryInput): string {
  const seed = seedFrom(input.title + input.game + (input.mvp ?? "") + input.players.join(""));
  return pick(TEMPLATES, seed)(input);
}
