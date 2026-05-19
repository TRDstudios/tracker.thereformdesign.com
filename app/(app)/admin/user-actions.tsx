"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { updateUserRole, deleteUser } from "@/lib/actions/admin";
import { toast } from "sonner";

const roles = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

export function UserActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const handleRoleChange = async (role: string) => {
    try {
      await updateUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((r) => (
          <DropdownMenuItem
            key={r.value}
            disabled={r.value === currentRole}
            onSelect={() => handleRoleChange(r.value)}
          >
            Make {r.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={handleDelete} className="text-red-600">
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
