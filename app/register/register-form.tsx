"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await register(formData);
      if (result?.error) {
        return { error: result.error };
      }
      router.push("/dashboard");
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-zinc-900 underline underline-offset-4">
          Sign in
        </a>
      </p>
    </form>
  );
}
