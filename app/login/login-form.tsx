"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        await login(formData);
        router.push("/dashboard");
      } catch {
        return { error: "Invalid email or password" };
      }
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-[#1d1d1d]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="hello@example.com"
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-[#1d1d1d]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <Button
        type="submit"
        className="w-full h-10 rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 transition-all"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-[#1d1d1d]/50">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="font-semibold text-[#1d1d1d] underline underline-offset-4 hover:text-[#f5eb10] transition-colors"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}
