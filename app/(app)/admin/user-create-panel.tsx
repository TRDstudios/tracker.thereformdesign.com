"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SlidePanel } from "@/components/ui/slide-panel";
import { UserPlus } from "lucide-react";
import { CreateUserForm } from "./create-user-form";

export function UserCreatePanel({
  userRole,
  onSuccess: externalOnSuccess,
}: {
  userRole: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
      >
        <UserPlus className="mr-1 h-4 w-4" /> Create User
      </Button>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="Create User">
        <CreateUserForm userRole={userRole} onSuccess={() => { setOpen(false); externalOnSuccess?.(); }} />
      </SlidePanel>
    </>
  );
}
