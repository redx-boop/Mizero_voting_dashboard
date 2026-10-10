import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getCategories } from "@/lib/admin-data";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdminContext();
  const categories = await getCategories();

  return <CategoriesManager categories={categories} />;
}
