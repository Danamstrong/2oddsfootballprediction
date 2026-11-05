import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/lib/owner";
import { AdminDashboardForm } from "./AdminDashboardForm";

export default async function AdminDashboardPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (email !== OWNER_EMAIL) {
    redirect("/");
  }

  return <AdminDashboardForm />;
}
