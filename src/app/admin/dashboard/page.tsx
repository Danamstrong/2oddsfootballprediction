import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDashboardForm } from "./AdminDashboardForm";

/** Only this email may reach the admin dashboard. */
const ADMIN_EMAIL = "danielokereke2018@gmail.com";

export default async function AdminDashboardPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? null;

  if (email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return <AdminDashboardForm />;
}
