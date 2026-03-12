import AdminDashboard from "@/app/admin/AdminDashboard";
import { requireAdminPageSession } from "@/app/lib/admin/auth";

export default async function AdminPage() {
  await requireAdminPageSession("/admin");
  return <AdminDashboard />;
}
