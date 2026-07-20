import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the current user's id if they are an active ADMIN, else null. */
export async function requireAdmin(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") return null;
  return userId;
}

export async function audit(adminId: string, action: string, detail?: string) {
  await prisma.auditLog.create({ data: { adminId, action, detail: detail ?? null } });
}
