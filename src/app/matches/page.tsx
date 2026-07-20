import { MatchBoard } from "@/components/MatchBoard";
import { getAllPublicMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const all = await getAllPublicMatches();
  const now = Date.now();
  const upcoming = all.filter((m) => new Date(m.scheduledAt).getTime() > now && m.status !== "CANCELLED" && m.status !== "COMPLETED");
  const past = all.filter((m) => !upcoming.includes(m));

  return (
    <div className="space-y-10 pt-2">
      <MatchBoard matches={upcoming} title="קומפים קרובים" subtitle="בחרו קומפ ואשרו הגעה." />
      {past.length > 0 && (
        <MatchBoard matches={past} title="קומפים קודמים" />
      )}
    </div>
  );
}
