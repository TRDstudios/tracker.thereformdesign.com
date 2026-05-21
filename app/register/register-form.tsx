"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    if (result?.success) {
      await signIn("credentials", {
        email: result.email,
        password: result.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-[#1d1d1d]">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Your name"
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
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
          autoComplete="new-password"
          placeholder="Create a password"
          className="h-10 rounded-lg border-[#e5e5e5] bg-white text-[#1d1d1d] placeholder:text-[#a1a1a1] focus:border-[#f5eb10] focus:ring-[#f5eb10]"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full h-10 rounded-lg bg-[#f5eb10] text-[#1d1d1d] font-semibold hover:bg-[#f5eb10]/90 transition-all"
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-[#1d1d1d]/50">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold text-[#1d1d1d] underline underline-offset-4 hover:text-[#f5eb10] transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
