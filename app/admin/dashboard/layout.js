import { requireAdminPage } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

/** Every /admin/dashboard/* page passes through this server-side session check. */
export default async function DashboardLayout({ children }) {
  const session = await requireAdminPage();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
