import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ListTodo, FolderKanban, Users, Clock } from "lucide-react";
import {
  getTaskCount,
  getProjectCount,
  getUserCount,
  getInProgressTaskCount,
} from "@/lib/data";

const kpiCards = [
  { label: "Total Tasks", icon: ListTodo, key: "tasks" as const },
  { label: "Projects", icon: FolderKanban, key: "projects" as const },
  { label: "Team Members", icon: Users, key: "users" as const },
  { label: "In Progress", icon: Clock, key: "inProgress" as const },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const counts = {
    tasks: await getTaskCount(),
    projects: await getProjectCount(),
    users: await getUserCount(),
    inProgress: await getInProgressTaskCount(),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1d]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#1d1d1d]/50">
          Welcome back, {session.user.name}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1d1d1d]/60">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-[#f5eb10]" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[#1d1d1d]">
              {counts[card.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
