import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUsers, systemMessage, participantUserIds } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().trim().max(200).optional().or(z.literal("")) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "הקומפ לא נמצא" }, { status: 404 });

  const p = await prisma.participant.findUnique({
    where: { userId_matchId: { userId, matchId: match.id } },
  });
  if (!p || p.status === "OUT") return NextResponse.json({ ok: true });

  const late = match.scheduledAt.getTime() - Date.now() < 60 * 60 * 1000;
  const wasConfirmed = p.status === "CONFIRMED";

  const me = await prisma.user.findUnique({ where: { id: userId } });
  const name = me?.displayName ?? me?.username ?? "שחקן";

  // Promote the first waitlisted player if a confirmed seat opened up.
  let promotedUserId: string | null = null;
  await prisma.$transaction(async (tx) => {
    await tx.participant.update({
      where: { id: p.id },
      data: { status: "OUT", outReason: parsed.data.reason || null, outLate: late },
    });
    if (wasConfirmed) {
      const next = await tx.participant.findFirst({
        where: { matchId: match.id, status: "WAITLIST" },
        orderBy: { joinedAt: "asc" },
      });
      if (next) {
        await tx.participant.update({ where: { id: next.id }, data: { status: "CONFIRMED" } });
        promotedUserId = next.userId;
      }
    }
  });

  await systemMessage(match.id, `${name} ביטל/ה הגעה`);
  if (promotedUserId) {
    const promoted = await prisma.user.findUnique({ where: { id: promotedUserId } });
    await systemMessage(match.id, `${promoted?.displayName ?? promoted?.username} עלה/תה מרשימת ההמתנה 🎉`);
    await notifyUsers([promotedUserId], "SPOT_OPEN", `התפנה מקום בקומפ "${match.title}" — אתה בפנים!`, match.id);
  }

  return NextResponse.json({ ok: true, late });
}
