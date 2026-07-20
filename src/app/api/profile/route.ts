import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  steamProfile: z.string().trim().max(200).optional().or(z.literal("")),
  discordName: z.string().trim().max(60).optional().or(z.literal("")),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  const d = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(d.displayName ? { displayName: d.displayName } : {}),
      ...(d.steamProfile !== undefined ? { steamProfile: d.steamProfile || null } : {}),
      ...(d.discordName !== undefined ? { discordName: d.discordName || null } : {}),
      ...(d.avatarColor ? { avatarColor: d.avatarColor } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

// Delete own account.
export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
