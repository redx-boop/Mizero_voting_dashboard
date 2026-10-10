import { requireAdminContext } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Protected admin layout.
 *
 * The (dashboard) route group does NOT change the URL — /admin renders
 * app/admin/(dashboard)/page.tsx. Keeping it in a group means the login and
 * unauthorized pages (which live outside the group) are NOT wrapped by this
 * guard, so there is no redirect loop.
 *
 * requireAdminContext() redirects:
 *   • logged-out visitors        → /admin/login
 *   • logged-in non-admins       → /admin/unauthorized
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdminContext();

  return (
    <AdminShell
      profile={{
        full_name: profile.full_name,
        class_name: profile.class_name,
        email: user.email ?? "",
      }}
    >
      {children}
    </AdminShell>
  );
}
