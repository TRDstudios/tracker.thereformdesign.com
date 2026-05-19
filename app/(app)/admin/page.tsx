import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserActions } from "./user-actions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") {
    redirect("/dashboard");
  }

  const allUsers = await db.select().from(users);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-zinc-500">
          Manage users and system settings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users ({allUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <Badge
                  variant={
                    user.role === "super_admin"
                      ? "default"
                      : user.role === "admin"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {user.role}
                </Badge>
                {user.id !== session.user.id && (
                  <UserActions userId={user.id} currentRole={user.role} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
