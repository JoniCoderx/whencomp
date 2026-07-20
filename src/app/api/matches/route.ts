import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchInclude, toMatchDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(2).max(80),
  game: z.enum(["CS2", "Valorant", "COD"]),
  scheduledAt: z.string(),
  discordLink: z.string().url().optional().or(z.literal("")),
  maxPlayers: z.number().int().min(2).max(64).optional(),
  notes: z.string().max(280).optional().or(z.literal("")),
});

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { scheduledAt: "asc" },
    include: matchInclude,
  });
  return NextResponse.json(matches.map(toMatchDTO));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const when = new Date(data.scheduledAt);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      title: data.title,
      game: data.game,
      scheduledAt: when,
      discordLink: data.discordLink || null,
      maxPlayers: data.maxPlayers ?? 10,
      notes: data.notes || null,
      creatorId: userId,
      participants: {
        create: { userId, team: "A" },
      },
    },
    include: matchInclude,
  });

  return NextResponse.json(toMatchDTO(match), { status: 201 });
}
