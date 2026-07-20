import { PlayersView } from "@/components/PlayersView";
import { getRoster } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await getRoster();
  return (
    <div className="pt-2">
      <PlayersView players={players} />
    </div>
  );
}
