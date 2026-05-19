"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { updateUserRole, deleteUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const roles = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

export function UserActions({
  userId,
  currentRole,
  isSuperAdmin,
}: {
  userId: string;
  currentRole: string;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();

  const handleRoleChange = async (role: string) => {
    try {
      await updateUserRole(userId, role);
      toast.success(`Role updated to ${role}`);
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#a1a1a1] transition-colors hover:bg-[#f5f5f4] hover:text-[#1d1d1d]">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isSuperAdmin ? (
          <>
            {roles.map((r) => (
              <DropdownMenuItem
                key={r.value}
                disabled={r.value === currentRole}
                onSelect={() => handleRoleChange(r.value)}
              >
                Make {r.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleDelete} className="text-red-500">
              Delete user
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled className="text-[#a1a1a1]">
            Role changes restricted
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
