import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Delete a chat message: the author can delete their own; admins can delete any.
export async function DELETE(_req: Request, { params }: { params: { id: string; msgId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  const [me, msg] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.message.findUnique({ where: { id: params.msgId } }),
  ]);
  if (!msg || msg.matchId !== params.id) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const isAdmin = me?.role === "ADMIN";
  if (msg.userId !== userId && !isAdmin)
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  await prisma.message.delete({ where: { id: params.msgId } });
  return NextResponse.json({ ok: true });
}
