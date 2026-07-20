import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Toggle the current user's vote for a player. Returns the new count + state.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const voterId = (session?.user as any)?.id;
  if (!voterId) return NextResponse.json({ error: "יש להתחבר כדי להצביע" }, { status: 401 });
  if (voterId === params.id) return NextResponse.json({ error: "אי אפשר להצביע לעצמך 🙂" }, { status: 400 });

  if (!rateLimit(`vote:${voterId}`, 30, 60_000))
    return NextResponse.json({ error: "יותר מדי הצבעות בזמן קצר" }, { status: 429 });

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "השחקן לא נמצא" }, { status: 404 });

  const existing = await prisma.playerVote.findUnique({
    where: { voterId_targetId: { voterId, targetId: params.id } },
  });

  let voted: boolean;
  if (existing) {
    await prisma.playerVote.delete({ where: { id: existing.id } });
    voted = false;
  } else {
    await prisma.playerVote.create({ data: { voterId, targetId: params.id } });
    voted = true;
  }
  const count = await prisma.playerVote.count({ where: { targetId: params.id } });
  return NextResponse.json({ ok: true, voted, count });
}
