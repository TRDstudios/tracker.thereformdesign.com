import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, User, Mail, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const fields = [
    { label: "Name", value: session.user.name, icon: User },
    { label: "Email", value: session.user.email, icon: Mail },
    { label: "Role", value: session.user.role, icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5eb10]/20">
          <Settings className="h-6 w-6 text-[#1d1d1d]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#1d1d1d]/50">
            Manage your account settings
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b border-[#e5e5e5] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#1d1d1d]">Profile</h2>
        </div>
        <div className="divide-y divide-[#e5e5e5]">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-4 px-6 py-4">
              <field.icon className="h-4 w-4 text-[#a1a1a1]" />
              <div className="flex-1">
                <p className="text-xs font-medium text-[#1d1d1d]/50 uppercase tracking-wider">
                  {field.label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#1d1d1d]">
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
