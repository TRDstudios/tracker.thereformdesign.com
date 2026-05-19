"use client";

import { useRouter } from "next/navigation";
import { Settings, ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";

export function ProfileDropdownClient({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-[#f5f5f4]">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-[#f5eb10] text-[#1d1d1d] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-[#1d1d1d]">
            {name}
          </p>
          <p className="text-[11px] leading-tight text-[#1d1d1d]/50 capitalize">
            {role.replace("_", " ")}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-[#a1a1a1]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-[#1d1d1d]">{name}</p>
            <p className="text-xs text-[#1d1d1d]/50 capitalize">
              {role.replace("_", " ")}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/settings")}>
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
