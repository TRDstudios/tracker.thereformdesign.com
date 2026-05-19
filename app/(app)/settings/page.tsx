import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account settings</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Name: </span>
              {session.user.name}
            </div>
            <div>
              <span className="font-medium">Email: </span>
              {session.user.email}
            </div>
            <div>
              <span className="font-medium">Role: </span>
              {session.user.role}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
