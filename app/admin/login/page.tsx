import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const context = await getAdminContext();
  if (context) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <LoginForm />
    </main>
  );
}
