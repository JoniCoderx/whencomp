import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUsers, systemMessage, participantUserIds } from "@/lib/notify";

export const dynamic = "force-dynamic";

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number) {
  return aStart < bStart + bDur * 60000 && bStart < aStart + aDur * 60000;
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me || me.status === "BANNED") return NextResponse.json({ error: "החשבון חסום" }, { status: 403 });

  const match = await prisma.match.findUnique({ where: { id: params.id } });
  if (!match) return NextResponse.json({ error: "הקומפ לא נמצא" }, { status: 404 });
  if (match.status === "CANCELLED" || match.status === "COMPLETED")
    return NextResponse.json({ error: "הקומפ כבר לא פעיל" }, { status: 409 });
  if (me.isGuest && (match as any).allowGuests === false)
    return NextResponse.json({ error: "הקומפ סגור לאורחים — הירשמו כדי להצטרף" }, { status: 403 });

  // Prevent double-booking at the same time (skip this match itself).
  const others = await prisma.participant.findMany({
    where: { userId, status: "CONFIRMED", matchId: { not: match.id }, match: { status: "UPCOMING" } },
    include: { match: true },
  });
  for (const o of others) {
    if (overlaps(match.scheduledAt.getTime(), match.durationMin, o.match.scheduledAt.getTime(), o.match.durationMin)) {
      return NextResponse.json({ error: "כבר אישרת הגעה לקומפ אחר באותה שעה" }, { status: 409 });
    }
  }

  // Race-safe slot assignment inside a transaction.
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.participant.findUnique({
      where: { userId_matchId: { userId, matchId: match.id } },
    });
    const confirmedCount = await tx.participant.count({
      where: { matchId: match.id, status: "CONFIRMED" },
    });

    if (existing) {
      if (existing.status === "OUT") {
        const status = confirmedCount < match.capacity ? "CONFIRMED" : "WAITLIST";
        await tx.participant.update({
          where: { id: existing.id },
          data: { status, outReason: null, outLate: false },
        });
        return { status, rejoined: true, confirmedCount: status === "CONFIRMED" ? confirmedCount + 1 : confirmedCount };
      }
      return { status: existing.status, already: true, confirmedCount };
    }

    const status = confirmedCount < match.capacity ? "CONFIRMED" : "WAITLIST";
    await tx.participant.create({ data: { userId, matchId: match.id, status } });
    return { status, confirmedCount: status === "CONFIRMED" ? confirmedCount + 1 : confirmedCount };
  });

  // Side effects (chat + notifications) outside the transaction.
  if (!result.already) {
    const name = me.displayName ?? me.username;
    if (result.status === "CONFIRMED") {
      await systemMessage(match.id, `${name} הצטרף/ה לקומפ`);
      const left = match.capacity - result.confirmedCount;
      if (left === 0) {
        const ids = await participantUserIds(match.id);
        await systemMessage(match.id, "הקומפ מלא! 🔒");
        await notifyUsers(ids, "FULL", `הקומפ "${match.title}" התמלא`, match.id);
      } else if (left === 1) {
        await systemMessage(match.id, "נשאר מקום אחד!");
      }
    } else {
      await systemMessage(match.id, `${name} נכנס/ה לרשימת ההמתנה`);
    }
  }

  return NextResponse.json({ ok: true, status: result.status });
}
