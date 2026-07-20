import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminCancellations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  return NextResponse.json(await getAdminCancellations());
}
