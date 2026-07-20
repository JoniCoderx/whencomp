import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { participants: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (match.participants.some((p) => p.userId === userId)) {
    return NextResponse.json({ ok: true, already: true });
  }
  if (match.participants.length >= match.maxPlayers) {
    return NextResponse.json({ error: "Lobby full" }, { status: 409 });
  }

  // Auto-balance: assign to the smaller team.
  const teamA = match.participants.filter((p) => p.team === "A").length;
  const teamB = match.participants.filter((p) => p.team === "B").length;
  const team = teamA <= teamB ? "A" : "B";

  await prisma.participant.create({
    data: { userId, matchId: match.id, team },
  });

  return NextResponse.json({ ok: true, team });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.participant.deleteMany({
    where: { matchId: params.id, userId },
  });

  return NextResponse.json({ ok: true });
}
