"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Zap } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard/executive");
      router.refresh();
    }
  }

  const demoUsers = [
    { email: "admin@wit.id", role: "Super Admin" },
    { email: "executive@wit.id", role: "Executive" },
    { email: "energymgr@wit.id", role: "Energy Manager" },
    { email: "opsup@wit.id", role: "Operations Supervisor" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#e11d48] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-xl tracking-wider leading-none">ELEMENT</div>
              <div className="text-[#e11d48] text-[10px] font-semibold tracking-[0.2em] uppercase">Monitoring System</div>
            </div>
          </div>
          <p className="text-[#888888] text-sm">WIT.ID Industrial Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 space-y-6">
          <div>
            <h1 className="text-white font-semibold text-xl">Sign in</h1>
            <p className="text-[#888888] text-sm mt-1">Access the monitoring dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@wit.id"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/50 transition"
              />
              {errors.email && <p className="text-[#ef4444] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#888888] mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/50 transition"
              />
              {errors.password && <p className="text-[#ef4444] text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e11d48] hover:bg-[#be123c] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
          <p className="text-[#888888] text-xs font-semibold uppercase tracking-wider">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                  const passInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                  if (emailInput) emailInput.value = u.email;
                  if (passInput) passInput.value = "password123";
                }}
                className="text-left bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-white text-xs font-medium truncate">{u.email}</div>
                <div className="text-[#e11d48] text-[10px]">{u.role}</div>
              </button>
            ))}
          </div>
          <p className="text-[#444] text-xs">All passwords: password123</p>
        </div>
      </div>
    </div>
  );
}
