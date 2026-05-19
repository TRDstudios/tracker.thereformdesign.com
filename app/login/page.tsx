import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf9] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1d]">
            Tracker
          </h1>
          <p className="text-sm text-[#1d1d1d]/50">
            Sign in to your account
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
