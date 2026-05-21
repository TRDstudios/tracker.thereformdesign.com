import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { AgGridUsers } from "./ag-grid-users";
import { UserCreatePanel } from "./user-create-panel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "super_admin" && session.user.role !== "admin")) {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "super_admin";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5eb10]/20">
            <Shield className="h-6 w-6 text-[#1d1d1d]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
              User Management
            </h1>
            <p className="mt-1 text-sm text-[#1d1d1d]/50">
              Manage user roles and accounts
            </p>
          </div>
        </div>
        <UserCreatePanel userRole={session.user.role} />
      </div>

      <AgGridUsers isSuperAdmin={isSuperAdmin} currentUserId={session.user.id} />
    </div>
  );
}
