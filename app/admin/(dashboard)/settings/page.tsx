import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getSettings } from "@/lib/admin-data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Election Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminContext();
  const settings = await getSettings();

  return <SettingsForm settings={settings} />;
}
