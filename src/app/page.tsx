import { Hero } from "@/components/Hero";
import { MatchBoard } from "@/components/MatchBoard";
import { getUpcomingMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const matches = await getUpcomingMatches(6);
  return (
    <div className="space-y-12">
      <Hero />
      <MatchBoard matches={matches} title="קומפים קרובים" subtitle="בחרו קומפ ואשרו הגעה." showMore />
    </div>
  );
}
