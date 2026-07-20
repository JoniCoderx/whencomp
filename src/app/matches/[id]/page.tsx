import { notFound } from "next/navigation";
import { LobbyView } from "@/components/LobbyView";
import { getMatch } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LobbyPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);
  if (!match) notFound();
  return (
    <div className="pt-2">
      <LobbyView match={match} />
    </div>
  );
}
