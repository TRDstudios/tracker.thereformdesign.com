"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <>
      <button
        className="fixed left-4 top-3.5 z-50 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? (
          <X className="h-5 w-5 text-zinc-600" />
        ) : (
          <Menu className="h-5 w-5 text-zinc-600" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r bg-zinc-50 transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="text-sm font-semibold">
            Tracker
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {userRole === "super_admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
              onClick={() => setOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
