"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/lib/actions/admin";
import { Eye, EyeOff } from "lucide-react";

export function CreateUserForm({ userRole, onSuccess }: { userRole: string; onSuccess?: () => void }) {
  const isSuperAdmin = userRole === "super_admin";
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createUser(formData);
      if (result?.error) return { error: result.error };
      onSuccess?.();
      return { success: true };
    },
    null,
  );

  return (
    <>
      {state?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 text-center">
          User created successfully.
        </div>
      )}
      {!state?.success && (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#1d1d1d]">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Full name"
              className="h-10 rounded-lg border-[#e5e5e5] text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#1d1d1d]">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="hello@example.com"
              className="h-10 rounded-lg border-[#e5e5e5] text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium text-[#1d1d1d]">
              User ID
            </Label>
            <Input
              id="userId"
              name="userId"
              type="text"
              required
              placeholder="SRIVANI or USER001"
              className="h-10 rounded-lg border-[#e5e5e5] text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-sm font-medium text-[#1d1d1d]">
              Profession
            </Label>
            <select
              id="profession"
              name="profession"
              required
              defaultValue="Developer"
              className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
              <option value="Testing">Testing</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-[#1d1d1d]">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Set a password"
                className="h-10 rounded-lg border-[#e5e5e5] text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a1] hover:text-[#1d1d1d] cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-[#1d1d1d]">
              Role
            </Label>
            <select
              id="role"
              name="role"
              defaultValue="user"
              className="flex h-10 w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-1 text-sm text-[#1d1d1d] transition-colors focus:border-[#f5eb10] focus:ring-[#f5eb10] focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              {isSuperAdmin && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 shadow-sm"
            >
              {pending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
