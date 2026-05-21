import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield } from "lucide-react";
import { UserActions } from "./user-actions";
import { CreateUserDialog } from "./create-user-dialog";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "super_admin" && session.user.role !== "admin")) {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "super_admin";
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    avatar: users.avatar,
    createdAt: users.createdAt,
  }).from(users);

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
        <CreateUserDialog userRole={session.user.role} />
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b border-[#e5e5e5] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#1d1d1d]">
            All Users ({allUsers.length})
          </h2>
        </div>
        <div className="divide-y divide-[#e5e5e5]">
          {allUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 px-6 py-4"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-[#f5eb10]/20 text-[#1d1d1d] font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1d1d1d]">
                  {user.name}
                </p>
                <p className="text-xs text-[#1d1d1d]/50">{user.email}</p>
              </div>
              <Badge
                variant={
                  user.role === "super_admin"
                    ? "default"
                    : user.role === "admin"
                      ? "secondary"
                      : "outline"
                }
                className="rounded-md text-[10px] font-medium"
              >
                {user.role}
              </Badge>
              {user.id !== session.user.id && (
                <UserActions userId={user.id} currentRole={user.role} isSuperAdmin={isSuperAdmin} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
