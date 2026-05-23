import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageTitleSetter } from "@/lib/page-title-context";
import { AdminPageClient } from "./admin-page-client";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "super_admin" && session.user.role !== "admin")) {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "super_admin";

  return (
    <>
      <PageTitleSetter title="User Management" />
      <AdminPageClient
        isSuperAdmin={isSuperAdmin}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />
    </>
  );
}
