import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ListTodo, FolderKanban, Users, Clock } from "lucide-react";
import {
  getTaskCount,
  getProjectCount,
  getUserCount,
  getInProgressTaskCount,
  getPerPersonStats,
} from "@/lib/data";
import { PageTitleSetter } from "@/lib/page-title-context";

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

  const personStats = await getPerPersonStats();

  return (
    <>
      <PageTitleSetter title="Dashboard" />
      <div className="space-y-8">
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5eb10]/20">
                  <card.icon className="h-4 w-4 text-[#1d1d1d]" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#1d1d1d]">
                {counts[card.key]}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b border-[#e5e5e5] px-6 py-4">
            <h2 className="text-sm font-semibold text-[#1d1d1d]">
              Person-wise Tasks
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafaf9]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1d1d1d]/60">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1d1d1d]/60">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1d1d1d]/60">Profession</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#22c55e]">Completed</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#f97316]">Pending</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#1d1d1d]/60">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {personStats.map((person) => (
                  <tr key={person.name} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-3 font-medium text-[#1d1d1d]">{person.name}</td>
                    <td className="px-6 py-3 text-[#1d1d1d]/60 capitalize">{person.role?.replace("_", " ") || "—"}</td>
                    <td className="px-6 py-3 text-[#1d1d1d]/60">{person.profession || "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22c55e]">
                        {person.completed}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f97316]">
                        {person.pending}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center font-medium text-[#1d1d1d]">{person.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
