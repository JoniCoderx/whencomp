import { MatchBoard } from "@/components/MatchBoard";
import { getAllMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await getAllMatches();
  return (
    <div className="pt-2">
      <MatchBoard matches={matches} showFilter />
    </div>
  );
}
