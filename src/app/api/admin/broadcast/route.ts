import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/admin";
import { notifyUsers } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({ body: z.string().trim().min(2).max(300) });

// Send a system notification to every active user.
export async function POST(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "הודעה קצרה מדי" }, { status: 400 });

  const users = await prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  await notifyUsers(users.map((u) => u.id), "SYSTEM", parsed.data.body);
  await audit(adminId, "BROADCAST", parsed.data.body);
  return NextResponse.json({ ok: true, sent: users.length });
}
