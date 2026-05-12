"use client";

import { useRef, useState, useEffect } from "react";
import { Bell, ChevronDown, Wifi, User, Settings, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopbarProps {
  title: string;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
  systemHealthy?: boolean;
}

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  "Super Admin": { bg: "rgba(184,144,26,0.12)", text: "#B8901A" },
  "Admin":       { bg: "rgba(30,95,168,0.12)",  text: "#1E5FA8" },
  "Operator":    { bg: "rgba(22,163,74,0.12)",   text: "#166534" },
  "Viewer":      { bg: "rgba(99,120,160,0.12)",  text: "#6378A0" },
};

export function Topbar({
  title,
  notificationCount = 0,
  userName = "Admin User",
  userRole = "SUPER_ADMIN",
  systemHealthy = true,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials  = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = userRole.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const roleStyle = ROLE_COLOR[roleLabel] ?? ROLE_COLOR["Viewer"];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <header className="flex-shrink-0 relative">
      {/* Gold gradient top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, #B8901A 0%, #D4A82A 40%, transparent 100%)" }}
      />

      <div
        className="h-14 flex items-center justify-between px-6"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(13,27,53,0.07)",
          boxShadow: "0 1px 12px rgba(13,27,53,0.06)",
        }}
      >
        {/* Left */}
        <h1 className="text-[#0D1B35] font-bold text-sm tracking-tight">{title}</h1>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* System status */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: systemHealthy ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
              border: `1px solid ${systemHealthy ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
            }}
          >
            <Wifi className="w-3 h-3" style={{ color: systemHealthy ? "#16A34A" : "#DC2626" }} />
            <span className="text-[11px] font-semibold" style={{ color: systemHealthy ? "#16A34A" : "#DC2626" }}>
              {systemHealthy ? "All Systems Normal" : "System Alert"}
            </span>
          </div>

          {/* Bell */}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-[#F0F4FA]"
            aria-label="Notifications"
          >
            <Bell className="w-[17px] h-[17px] text-[#6378A0]" />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full text-[9px] font-black text-white px-0.5"
                style={{ background: "linear-gradient(135deg, #D4A82A 0%, #B8901A 100%)" }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <div className="w-px h-6 mx-1" style={{ background: "rgba(13,27,53,0.09)" }} />

          {/* User button + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all outline-none hover:bg-[#F0F4FA]"
              style={{ background: open ? "#F0F4FA" : undefined }}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #B8901A 0%, #D4A82A 100%)",
                  boxShadow: "0 2px 8px rgba(184,144,26,0.35)",
                }}
              >
                {initials}
              </div>
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-[12px] font-bold text-[#0D1B35]">{userName}</span>
                <span className="text-[9px] font-semibold" style={{ color: "#B8901A" }}>{roleLabel}</span>
              </div>
              <ChevronDown
                className="w-3 h-3 text-[#6378A0] transition-transform duration-200"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Dropdown panel */}
            {open && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 8px 32px rgba(13,27,53,0.14), 0 2px 8px rgba(13,27,53,0.08)",
                  border: "1px solid rgba(13,27,53,0.07)",
                }}
              >
                {/* Profile header */}
                <div
                  className="px-4 py-4"
                  style={{ background: "linear-gradient(135deg, rgba(13,27,53,0.03) 0%, rgba(184,144,26,0.04) 100%)", borderBottom: "1px solid rgba(13,27,53,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    {/* Larger avatar */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-black text-white flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #B8901A 0%, #D4A82A 100%)",
                        boxShadow: "0 4px 12px rgba(184,144,26,0.35)",
                      }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#0D1B35] font-bold text-sm leading-tight truncate">{userName}</p>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                        style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  {[
                    { icon: User,     label: "Profile",     sub: "View your account",    href: "/profile"  },
                    { icon: Settings, label: "Preferences", sub: "Theme & notifications", href: "/settings" },
                  ].map(({ icon: Icon, label, sub, href }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[#F2F5FB] group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(13,27,53,0.05)" }}>
                        <Icon className="w-4 h-4 text-[#6378A0] group-hover:text-[#0D1B35] transition-colors" />
                      </div>
                      <div>
                        <p className="text-[#0D1B35] text-sm font-semibold leading-tight">{label}</p>
                        <p className="text-[#98A8C0] text-[10px] leading-tight">{sub}</p>
                      </div>
                    </a>
                  ))}

                  {/* Divider */}
                  <div className="h-px mx-2 my-1" style={{ background: "rgba(13,27,53,0.06)" }} />

                  {/* Sign out */}
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-[#FEF2F2] group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(185,28,28,0.06)" }}>
                      <LogOut className="w-4 h-4 text-[#B91C1C]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[#B91C1C] text-sm font-semibold leading-tight">Sign Out</p>
                      <p className="text-[#98A8C0] text-[10px] leading-tight">End your session</p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(13,27,53,0.05)", background: "rgba(240,244,250,0.5)" }}>
                  <p className="text-[#C0CCDE] text-[9px] font-semibold">Element Monitoring System · WIT.ID</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
