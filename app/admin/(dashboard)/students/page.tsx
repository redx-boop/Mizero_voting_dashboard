import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { getStudents } from "@/lib/admin-data";
import { StudentsView } from "@/components/admin/StudentsView";

export const metadata: Metadata = { title: "Students" };
export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  await requireAdminContext();
  const students = await getStudents();

  return <StudentsView students={students} />;
}
