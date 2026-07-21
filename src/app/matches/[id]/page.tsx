import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LobbyView } from "@/components/LobbyView";
import { getMatch } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LobbyPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { invite?: string };
}) {
  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as any)?.id;
  const match = await getMatch(params.id, viewerId, searchParams?.invite);
  if (!match) notFound();
  return (
    <div className="pt-2">
      <LobbyView match={match} />
    </div>
  );
}
