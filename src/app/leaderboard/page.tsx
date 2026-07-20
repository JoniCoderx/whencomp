import { LeaderboardView } from "@/components/LeaderboardView";
import { getLeaderboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard(25);
  return (
    <div className="pt-2">
      <LeaderboardView rows={rows} />
    </div>
  );
}
