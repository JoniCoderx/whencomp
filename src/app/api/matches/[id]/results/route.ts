import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeEloDelta } from "@/lib/elo";

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

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  const { rating, mvpVoteId, note, happened } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "הקומפ לא נמצא" }, { status: 404 });

  const me = await prisma.participant.findUnique({
    where: { userId_matchId: { userId, matchId: match.id } },
  });
  if (!me) return NextResponse.json({ error: "לא השתתפת בקומפ הזה" }, { status: 403 });

  await prisma.participant.update({
    where: { id: me.id },
    data: { mvpVoteId: mvpVoteId ?? me.mvpVoteId, fpsRating: rating ?? me.fpsRating },
  });
  if (rating) {
    await prisma.rating.create({
      data: { kind: "MATCH", value: rating, matchId: match.id, fromUserId: userId, comment: note || null, toUserId: mvpVoteId ?? null },
    });
  }

  const confirmed = await prisma.participant.findMany({
    where: { matchId: match.id, status: "CONFIRMED" },
  });
  const voted = confirmed.filter((p) => p.mvpVoteId || p.fpsRating).length;
  const threshold = Math.max(1, Math.ceil(confirmed.length / 2));

  let finalized = false;
  if (match.status !== "COMPLETED" && (voted >= threshold || happened === false)) {
    const tally = new Map<string, number>();
    for (const p of confirmed) if (p.mvpVoteId) tally.set(p.mvpVoteId, (tally.get(p.mvpVoteId) ?? 0) + 1);
    let mvpUserId: string | null = null;
    let best = -1;
    for (const [uid, n] of tally) if (n > best) { best = n; mvpUserId = uid; }

    await prisma.$transaction(async (tx) => {
      await tx.match.update({ where: { id: match.id }, data: { status: "COMPLETED" } });
      for (const p of confirmed) {
        const isMvp = p.userId === mvpUserId;
        await tx.user.update({
          where: { id: p.userId },
          data: {
            elo: { increment: computeEloDelta({ isMvp, fpsRating: p.fpsRating }) },
            matchesPlayed: { increment: 1 },
            mvpCount: isMvp ? { increment: 1 } : undefined,
          },
        });
      }
    });
    finalized = true;
  }

  return NextResponse.json({ ok: true, finalized });
}
