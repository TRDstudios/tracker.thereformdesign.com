"use client";

import { usePageTitle } from "@/lib/page-title-context";

export function Navbar({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  const { title } = usePageTitle();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-bold tracking-tight text-[#1d1d1d]">
        {title}
      </h1>
      <div className="flex items-center gap-3 rounded-lg px-3 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5eb10] text-xs font-semibold text-[#1d1d1d]">
          {initials}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium leading-tight text-[#1d1d1d]">
            {name}
          </p>
          <p className="text-[11px] leading-tight text-[#1d1d1d]/50 capitalize">
            {role.replace("_", " ")}
          </p>
        </div>
      </div>
    </header>
  );
}
