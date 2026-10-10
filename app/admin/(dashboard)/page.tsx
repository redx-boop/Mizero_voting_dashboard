import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard";
import { requireAdminContext } from "@/lib/auth";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Always read fresh figures — never cache election statistics.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // The layout already guards, but re-checking here keeps this page safe on
  // its own and gives us the profile for the greeting.
  const { user, profile } = await requireAdminContext();
  const data = await getDashboardData();

  return (
    <DashboardOverview
      data={data}
      adminName={profile.full_name}
      adminEmail={user.email ?? ""}
    />
  );
}
