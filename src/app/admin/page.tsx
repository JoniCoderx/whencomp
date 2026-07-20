import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminPanel } from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminId = await requireAdmin();
  if (!adminId) redirect("/"); // server-side guard

  return (
    <div className="pt-2">
      <AdminPanel />
    </div>
  );
}
