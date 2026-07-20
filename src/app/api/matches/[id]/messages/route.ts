import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMessageDTO } from "@/lib/serialize";
import { rateLimit } from "@/lib/ratelimit";
import { notifyUsers, participantUserIds } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Poll chat messages. `after` returns only messages newer than a given id-time.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const sinceIso = url.searchParams.get("since");
  const where: any = { matchId: params.id };
  if (sinceIso) {
    const since = new Date(sinceIso);
    if (!isNaN(since.getTime())) where.createdAt = { gt: since };
  }
  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 300,
    include: { user: true },
  });
  return NextResponse.json(messages.map(toMessageDTO));
}

const schema = z.object({ body: z.string().trim().min(1).max(500) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר כדי לכתוב" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me || me.status === "BANNED") return NextResponse.json({ error: "החשבון חסום" }, { status: 403 });
  if (me.chatBanned) return NextResponse.json({ error: "הושתקת בצ׳אט ע״י מנהל" }, { status: 403 });

  if (!rateLimit(`chat:${userId}`, 20, 20_000))
    return NextResponse.json({ error: "לאט יותר 🙂" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "הודעה ריקה" }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!match) return NextResponse.json({ error: "הקומפ לא נמצא" }, { status: 404 });

  // Body stored raw; it is always rendered as text (React escapes) — never HTML.
  const msg = await prisma.message.create({
    data: { matchId: params.id, userId, body: parsed.data.body, kind: "USER" },
    include: { user: true },
  });

  // Notify other participants of new chat activity (best-effort).
  const ids = await participantUserIds(params.id);
  await notifyUsers(ids, "CHAT", `הודעה חדשה בקומפ "${match.title}"`, params.id, userId);

  return NextResponse.json(toMessageDTO(msg), { status: 201 });
}
