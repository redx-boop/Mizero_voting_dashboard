import { redirect } from "next/navigation";

// This app is the administration portal only — the student-facing site lives
// in the separate mizero-voting-main application.
export default function Home() {
  redirect("/admin");
}
