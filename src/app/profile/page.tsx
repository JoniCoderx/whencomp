import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileBundle } from "@/lib/queries";
import { ProfileView } from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const bundle = await getProfileBundle(userId);
  if (!bundle) redirect("/login");

  return (
    <div className="pt-2">
      <ProfileView
        user={bundle.user as any}
        upcoming={bundle.upcoming}
        history={bundle.history}
        stats={bundle.stats}
        reliability={bundle.reliability}
      />
    </div>
  );
}
