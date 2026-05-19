import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { ProfileDropdownClient } from "./profile-dropdown-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#fafaf9]">
      <Sidebar userRole={session.user.role ?? "user"} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-white px-6 md:px-6 pl-12 md:pl-6">
          <ProfileDropdownClient
            name={session.user.name ?? ""}
            role={session.user.role ?? "user"}
            initials={initials ?? ""}
          />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
