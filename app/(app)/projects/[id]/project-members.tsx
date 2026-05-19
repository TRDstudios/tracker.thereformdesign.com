"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus, UserPlus } from "lucide-react";
import { addProjectMember, removeProjectMember } from "@/lib/actions/projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function ProjectMembers({
  members,
  allUsers,
  projectId,
}: {
  members: Member[];
  allUsers: UserOption[];
  projectId: string;
}) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState("");

  const memberUserIds = new Set(members.map((m) => m.userId));
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addProjectMember(projectId, selectedUserId, "member");
      toast.success("Member added");
      router.refresh();
      setSelectedUserId("");
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    try {
      await removeProjectMember(projectId, userId);
      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="space-y-3">
      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg border border-[#e5e5e5] p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-[#f5eb10]/20 text-[#1d1d1d] font-semibold">
                  {initials(member.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1d1d1d]">
                  {member.user.name}
                </p>
                <p className="text-xs text-[#1d1d1d]/50">{member.user.email}</p>
              </div>
              <Badge
                variant="outline"
                className="rounded-md text-[10px] font-medium"
              >
                {member.role}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#a1a1a1] hover:text-red-500 hover:bg-red-50"
                onClick={() => handleRemove(member.userId, member.user.name)}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {availableUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex h-9 flex-1 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
          >
            <option value="">Select a user...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedUserId}
            className="rounded-lg border-[#e5e5e5] text-[#1d1d1d]/60"
          >
            <UserPlus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      )}
      {availableUsers.length === 0 && members.length > 0 && (
        <p className="text-xs text-[#1d1d1d]/40">
          All users are already members.
        </p>
      )}
    </div>
  );
}
