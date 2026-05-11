"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Activity, ChevronRight } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const demoUsers = [
  { email: "admin@wit.id",      role: "Super Admin",           color: "#B8901A" },
  { email: "executive@wit.id",  role: "Executive",             color: "#1E5FA8" },
  { email: "energymgr@wit.id",  role: "Energy Manager",        color: "#166534" },
  { email: "opsup@wit.id",      role: "Operations Supervisor", color: "#B45309" },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard/executive");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F5FB] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-[#0D1B35] p-10 relative overflow-hidden">
        {/* Decorative gold circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#B8901A]/10" />
        <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-[#B8901A]/08" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#B8901A] flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-widest">E</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wider leading-none">ELEMENT</div>
              <div className="text-[#B8901A] text-[9px] font-semibold tracking-[0.2em] uppercase mt-0.5">Monitoring System</div>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Industrial Utility<br />
            <span className="text-[#B8901A]">Intelligence</span>
          </h2>
          <p className="text-[#6378A0] text-sm leading-relaxed">
            Real-time monitoring for electricity, water, wastewater, gas, environment, thermal, and compressed air systems.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {["7 Utility Pillars", "Real-time Telemetry", "Compliance Reporting", "RBAC Access Control"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8901A]" />
              <span className="text-[#6378A0] text-xs">{f}</span>
            </div>
          ))}
          <p className="text-[#3D5280] text-xs mt-4 pt-3 border-t border-[#2a2520]">
            WIT.ID &copy; {new Date().getFullYear()} · v1.0.0
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#B8901A] flex items-center justify-center">
              <span className="text-white font-black text-xs">E</span>
            </div>
            <div>
              <div className="text-[#0D1B35] font-bold text-base tracking-wider">ELEMENT</div>
              <div className="text-[#B8901A] text-[9px] font-semibold tracking-widest uppercase">Monitoring System</div>
            </div>
          </div>

          <div>
            <h1 className="text-[#0D1B35] text-2xl font-bold">Welcome back</h1>
            <p className="text-[#6378A0] text-sm mt-1">Sign in to your monitoring account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D5280] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@wit.id"
                className="w-full bg-white border border-[#D9E2F0] rounded-xl px-4 py-3 text-[#0D1B35] text-sm placeholder-[#C4B9AD] focus:outline-none focus:border-[#B8901A] focus:ring-2 focus:ring-[#B8901A]/15 transition"
              />
              {errors.email && <p className="text-[#B91C1C] text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D5280] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-white border border-[#D9E2F0] rounded-xl px-4 py-3 text-[#0D1B35] text-sm placeholder-[#C4B9AD] focus:outline-none focus:border-[#B8901A] focus:ring-2 focus:ring-[#B8901A]/15 transition"
              />
              {errors.password && <p className="text-[#B91C1C] text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B8901A] hover:bg-[#9A7A14] active:bg-[#7A6110] disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
              ) : (
                <>Sign in <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#B8901A]" />
              <p className="text-[#3D5280] text-xs font-bold uppercase tracking-wider">Demo Accounts</p>
            </div>
            <div className="space-y-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setValue("email", u.email); setValue("password", "password123"); }}
                  className="w-full text-left flex items-center justify-between bg-[#F2F5FB] hover:bg-[#FEF7E6] border border-[#E4EAF5] hover:border-[#F5E6B5] rounded-lg px-3 py-2 transition-all group"
                >
                  <div>
                    <div className="text-[#0D1B35] text-xs font-semibold">{u.email}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color: u.color }}>{u.role}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4C8B8] group-hover:text-[#B8901A] transition-colors" />
                </button>
              ))}
            </div>
            <p className="text-[#C4B9AD] text-[10px]">Password for all accounts: <strong className="text-[#6378A0]">password123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
