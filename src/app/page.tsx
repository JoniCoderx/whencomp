import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { MatchBoard } from "@/components/MatchBoard";
import { getUpcomingMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const matches = await getUpcomingMatches(6);

  return (
    <div className="space-y-14">
      <Hero />
      <MatchBoard matches={matches} compact />
      <Features />
    </div>
  );
}
