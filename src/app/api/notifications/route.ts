import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [], unread: 0 });

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = items.filter((n) => !n.read).length;
  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      kind: n.kind,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      matchId: n.matchId,
    })),
    unread,
  });
}

// Mark all (or one) as read.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  await prisma.notification.updateMany({
    where: { userId, ...(body.id ? { id: body.id } : {}) },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
