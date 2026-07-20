import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PlayersView } from "@/components/PlayersView";
import { getRoster } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as any)?.id;
  const players = await getRoster(viewerId);
  return (
    <div className="pt-2">
      <PlayersView players={players} />
    </div>
  );
}
