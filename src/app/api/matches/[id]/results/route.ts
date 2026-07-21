import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeEloDelta } from "@/lib/elo";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  happened: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  mvpVoteId: z.string().optional(),
  note: z.string().max(280).optional().or(z.literal("")),
});

// Short post-match survey. Finalizes the match + awards stats once enough
// confirmed players have responded.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  if (!rateLimit(`results:${userId}`, 10, 30_000))
    return NextResponse.json({ error: "לאט יותר 🙂" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  const { rating, mvpVoteId, note, happened } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "הקומפ לא נמצא" }, { status: 404 });

  const me = await prisma.participant.findUnique({
    where: { userId_matchId: { userId, matchId: match.id } },
  });
  if (!me) return NextResponse.json({ error: "לא השתתפת בקומפ הזה" }, { status: 403 });

  const confirmed = await prisma.participant.findMany({
    where: { matchId: match.id, status: "CONFIRMED" },
  });
  const confirmedIds = new Set(confirmed.map((p) => p.userId));
  // Only accept an MVP vote for an actual confirmed player of THIS match.
  const validMvp = mvpVoteId && confirmedIds.has(mvpVoteId) ? mvpVoteId : undefined;

  await prisma.participant.update({
    where: { id: me.id },
    data: { mvpVoteId: validMvp ?? me.mvpVoteId, fpsRating: rating ?? me.fpsRating },
  });
  if (rating) {
    await prisma.rating.create({
      data: { kind: "MATCH", value: rating, matchId: match.id, fromUserId: userId, comment: note || null, toUserId: validMvp ?? null },
    });
  }

  // If the reporter says the comp didn't happen, void it — never award stats.
  if (happened === false && match.status !== "COMPLETED") {
    const res = await prisma.match.updateMany({
      where: { id: match.id, status: { not: "COMPLETED" } },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ ok: true, finalized: false, cancelled: res.count === 1 });
  }

  // Re-read votes (this request's write is now included).
  const responders = await prisma.participant.findMany({ where: { matchId: match.id, status: "CONFIRMED" } });
  const voted = responders.filter((p) => p.mvpVoteId || p.fpsRating).length;
  const threshold = Math.max(1, Math.ceil(responders.length / 2));

  let finalized = false;
  if (match.status !== "COMPLETED" && voted >= threshold) {
    const tally = new Map<string, number>();
    for (const p of responders) if (p.mvpVoteId) tally.set(p.mvpVoteId, (tally.get(p.mvpVoteId) ?? 0) + 1);
    let mvpUserId: string | null = null;
    let best = -1;
    for (const [uid, n] of tally) if (n > best) { best = n; mvpUserId = uid; }

    await prisma.$transaction(async (tx) => {
      // Guarded transition: only the ONE request that flips UPCOMING→COMPLETED
      // awards stats, so concurrent submissions can't double-credit ELO.
      const flip = await tx.match.updateMany({
        where: { id: match.id, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED" },
      });
      if (flip.count !== 1) return;
      finalized = true;
      for (const p of responders) {
        const isMvp = p.userId === mvpUserId;
        await tx.user.update({
          where: { id: p.userId },
          data: {
            elo: { increment: computeEloDelta({ isMvp }) },
            matchesPlayed: { increment: 1 },
            mvpCount: isMvp ? { increment: 1 } : undefined,
          },
        });
      }
    });
  }

  return NextResponse.json({ ok: true, finalized });
}
