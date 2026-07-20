import { Hero } from "@/components/Hero";
import { MatchBoard } from "@/components/MatchBoard";
import { RosterStrip } from "@/components/RosterStrip";
import { getUpcomingMatches, getRoster } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, roster] = await Promise.all([getUpcomingMatches(6), getRoster()]);
  return (
    <div className="space-y-12">
      <Hero />
      <MatchBoard matches={matches} title="קומפים קרובים" subtitle="בחרו קומפ ואשרו הגעה." showMore />
      <RosterStrip players={roster} />
    </div>
  );
}
