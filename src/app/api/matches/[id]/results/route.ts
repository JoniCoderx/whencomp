import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeEloDelta } from "@/lib/elo";

export const dynamic = "force-dynamic";

const schema = z.object({
  mvpVoteId: z.string().optional(), // participant.userId being voted MVP
  fpsRating: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { mvpVoteId, fpsRating } = parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { participants: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const me = match.participants.find((p) => p.userId === userId);
  if (!me) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

  // Record this player's vote + rating.
  await prisma.participant.update({
    where: { id: me.id },
    data: {
      mvpVoteId: mvpVoteId ?? me.mvpVoteId,
      fpsRating: fpsRating ?? me.fpsRating,
    },
  });

  if (mvpVoteId) {
    await prisma.rating.create({
      data: {
        kind: "MVP",
        value: 1,
        matchId: match.id,
        fromUserId: userId,
        toUserId: mvpVoteId,
      },
    });
  }
  if (fpsRating) {
    await prisma.rating.create({
      data: { kind: "FPS", value: fpsRating, matchId: match.id, fromUserId: userId },
    });
  }

  // Decide whether to finalize (award Elo once).
  const fresh = await prisma.participant.findMany({ where: { matchId: match.id } });
  const voted = fresh.filter((p) => p.mvpVoteId).length;
  const threshold = Math.max(1, Math.ceil(fresh.length / 2));

  let finalized = false;
  let mvpUserId: string | null = null;

  if (match.status !== "COMPLETED" && voted >= threshold) {
    // Tally MVP votes.
    const tally = new Map<string, number>();
    for (const p of fresh) {
      if (p.mvpVoteId) tally.set(p.mvpVoteId, (tally.get(p.mvpVoteId) ?? 0) + 1);
    }
    let best = -1;
    for (const [uid, count] of tally) {
      if (count > best) {
        best = count;
        mvpUserId = uid;
      }
    }

    // Award Elo / counts once, transactionally.
    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: match.id },
        data: { status: "COMPLETED" },
      });
      for (const p of fresh) {
        const isMvp = p.userId === mvpUserId;
        const delta = computeEloDelta({ isMvp, fpsRating: p.fpsRating });
        await tx.user.update({
          where: { id: p.userId },
          data: {
            elo: { increment: delta },
            matchesPlayed: { increment: 1 },
            mvpCount: isMvp ? { increment: 1 } : undefined,
          },
        });
      }
    });
    finalized = true;
  }

  return NextResponse.json({ ok: true, finalized, mvpUserId });
}
