import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTrophies, getNemesis } from "@/lib/queries";
import { ProfileView } from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const trophies = computeTrophies(user);
  const nemesis = await getNemesis(userId);

  return (
    <div className="pt-2">
      <ProfileView
        user={{
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarColor: user.avatarColor,
          elo: user.elo,
          mvpCount: user.mvpCount,
          matchesPlayed: user.matchesPlayed,
        }}
        trophies={trophies}
        nemesis={nemesis}
      />
    </div>
  );
}
