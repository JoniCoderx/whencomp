import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/admin";
import { matchInclude, toMatchDTO } from "@/lib/serialize";
import { notifyUsers, systemMessage, participantUserIds } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  const matches = await prisma.match.findMany({ orderBy: { scheduledAt: "desc" }, include: matchInclude });
  return NextResponse.json(matches.map((m) => toMatchDTO(m, true)));
}

const patchSchema = z.object({ matchId: z.string(), action: z.enum(["cancel"]) });

export async function PATCH(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });

  const match = await prisma.match.findUnique({ where: { id: parsed.data.matchId } });
  if (!match) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  await prisma.match.update({ where: { id: match.id }, data: { status: "CANCELLED" } });
  const ids = await participantUserIds(match.id);
  await systemMessage(match.id, "הקומפ בוטל ע״י מנהל ❌");
  await notifyUsers(ids, "CANCELLED", `הקומפ "${match.title}" בוטל`, match.id);
  await audit(adminId, "CANCEL_MATCH", match.title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { matchId } = (await req.json().catch(() => ({}))) as { matchId?: string };
  if (!matchId) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  await prisma.match.delete({ where: { id: matchId } });
  await audit(adminId, "DELETE_MATCH", match?.title);
  return NextResponse.json({ ok: true });
}
