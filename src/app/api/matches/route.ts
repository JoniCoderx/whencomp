import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchInclude, toMatchDTO } from "@/lib/serialize";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().trim().min(2, "שם קצר מדי").max(80),
  game: z.literal("CS2").default("CS2"),
  scheduledAt: z.string(),
  durationMin: z.number().int().min(30).max(360).optional(),
  discordLink: z.string().url("קישור לא תקין").optional().or(z.literal("")),
  notes: z.string().max(280).optional().or(z.literal("")),
  isPrivate: z.boolean().optional(),
  allowGuests: z.boolean().optional(),
});

export async function GET() {
  const matches = await prisma.match.findMany({
    where: { isPrivate: false },
    orderBy: { scheduledAt: "asc" },
    include: matchInclude,
  });
  return NextResponse.json(matches.map((m) => toMatchDTO(m)));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "יש להתחבר" }, { status: 401 });
  if ((session?.user as any)?.isGuest)
    return NextResponse.json({ error: "אורחים לא יכולים ליצור קומפ — הירשמו כדי ליצור" }, { status: 403 });

  if (!rateLimit(`create:${userId}`, 10, 60_000))
    return NextResponse.json({ error: "יותר מדי קומפים בזמן קצר, נסו שוב עוד רגע" }, { status: 429 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" }, { status: 400 });
  }
  const data = parsed.data;
  const when = new Date(data.scheduledAt);
  if (isNaN(when.getTime())) return NextResponse.json({ error: "תאריך לא תקין" }, { status: 400 });
  if (when.getTime() < Date.now() - 60_000)
    return NextResponse.json({ error: "לא ניתן לקבוע קומפ לתאריך שכבר עבר" }, { status: 400 });

  const match = await prisma.match.create({
    data: {
      title: data.title,
      game: "CS2",
      scheduledAt: when,
      durationMin: data.durationMin ?? 90,
      discordLink: data.discordLink || null,
      notes: data.notes || null,
      isPrivate: !!data.isPrivate,
      allowGuests: data.allowGuests !== false,
      inviteCode: data.isPrivate ? randomBytes(6).toString("hex") : null,
      capacity: 5,
      creatorId: userId,
      participants: { create: { userId, status: "CONFIRMED" } },
    },
    include: matchInclude,
  });

  return NextResponse.json(toMatchDTO(match, true), { status: 201 });
}
