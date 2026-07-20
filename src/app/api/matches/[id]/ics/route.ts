import { prisma } from "@/lib/prisma";
import { buildIcs } from "@/lib/share";

export const dynamic = "force-dynamic";

// Serve a real .ics file with proper headers. Unlike a blob download, this
// reliably triggers the calendar app on iOS, Android and desktop.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const m = await prisma.match.findUnique({
    where: { id: params.id },
    include: { participants: { where: { status: "CONFIRMED" } } },
  });
  if (!m) return new Response("Not found", { status: 404 });

  const origin = new URL(req.url).origin;
  const ics = buildIcs({
    title: m.title,
    scheduledAt: m.scheduledAt,
    url: `${origin}/matches/${m.id}`,
    confirmed: m.participants.length,
    capacity: m.capacity,
    discordLink: m.discordLink,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="whencomp-${m.id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
