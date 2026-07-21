import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/admin";
import { getAdminUsers } from "@/lib/queries";
import { isSafeHttpOrEmpty } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  return NextResponse.json(await getAdminUsers());
}

const patchSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BANNED"]).optional(),
  chatBanned: z.boolean().optional(),
  suspendDays: z.number().int().min(0).max(365).optional(),
  avatarUrl: z.string().trim().max(400).refine(isSafeHttpOrEmpty, "קישור לא בטוח").optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  const { userId, role, status, chatBanned, suspendDays, avatarUrl } = parsed.data;

  if (userId === adminId && (role === "USER" || status === "BANNED"))
    return NextResponse.json({ error: "לא ניתן לשנות את ההרשאה של עצמך" }, { status: 400 });

  const data: any = {};
  if (role) data.role = role;
  if (status) data.status = status;
  if (typeof chatBanned === "boolean") data.chatBanned = chatBanned;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;
  if (typeof suspendDays === "number")
    data.suspendedUntil = suspendDays > 0 ? new Date(Date.now() + suspendDays * 86400000) : null;

  const target = await prisma.user.update({ where: { id: userId }, data });
  await audit(adminId, "UPDATE_USER", `${target.username}: ${JSON.stringify(data)}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  if (userId === adminId) return NextResponse.json({ error: "לא ניתן למחוק את עצמך" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.user.delete({ where: { id: userId } });
  await audit(adminId, "DELETE_USER", target?.username);
  return NextResponse.json({ ok: true });
}
