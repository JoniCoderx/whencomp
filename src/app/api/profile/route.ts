import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSafeHttpOrEmpty } from "@/lib/url";

export const dynamic = "force-dynamic";

const safeUrl = (max: number) =>
  z.string().trim().max(max).refine(isSafeHttpOrEmpty, "קישור חייב להתחיל ב-http(s)").optional().or(z.literal(""));

const schema = z.object({
  // Empty display name = "leave unchanged" (handled below), so it must not 400.
  displayName: z.string().trim().max(40).optional(),
  steamProfile: safeUrl(300),
  discordName: z.string().trim().max(60).optional().or(z.literal("")),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  avatarUrl: safeUrl(400),
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
      ...(d.avatarUrl !== undefined ? { avatarUrl: d.avatarUrl || null } : {}),
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
