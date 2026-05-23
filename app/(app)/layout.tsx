import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { PageTitleProvider } from "@/lib/page-title-context";

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
    <PageTitleProvider>
      <div className="flex min-h-screen bg-[#fafaf9]">
        <Sidebar userRole={session.user.role ?? "user"} />
        <div className="flex flex-1 flex-col">
          <Navbar
            name={session.user.name ?? ""}
            role={session.user.role ?? "user"}
            initials={initials ?? ""}
          />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
