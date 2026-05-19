"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Shield,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
];

interface SidebarProps {
  userRole: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="fixed left-4 top-3.5 z-50 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? (
          <X className="h-5 w-5 text-[#1d1d1d]" />
        ) : (
          <Menu className="h-5 w-5 text-[#1d1d1d]" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-sidebar transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-14 items-center border-b border-sidebar-border px-5">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-[#1d1d1d]"
          >
            Tracker
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#f5eb10] text-[#1d1d1d]"
                    : "text-[#1d1d1d]/60 hover:bg-[#f5eb10]/20 hover:text-[#1d1d1d]"
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {(userRole === "super_admin" || userRole === "admin") && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                pathname === "/admin"
                  ? "bg-[#f5eb10] text-[#1d1d1d]"
                  : "text-[#1d1d1d]/60 hover:bg-[#f5eb10]/20 hover:text-[#1d1d1d]"
              }`}
              onClick={() => setOpen(false)}
            >
              <Shield className="h-4 w-4" />
              User Management
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
