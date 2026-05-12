"use client";

import { Bell, ChevronDown, Wifi } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title: string;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
  systemHealthy?: boolean;
}

export function Topbar({
  title,
  notificationCount = 0,
  userName = "Admin User",
  userRole = "SUPER_ADMIN",
  systemHealthy = true,
}: TopbarProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = userRole
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
        {/* Left — app title */}
        <div className="flex items-center gap-3">
          <h1 className="text-[#0D1B35] font-bold text-sm tracking-tight">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Live status */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: systemHealthy ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
              border: `1px solid ${systemHealthy ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)"}`,
            }}
          >
            <Wifi
              className="w-3 h-3"
              style={{ color: systemHealthy ? "#16A34A" : "#DC2626" }}
            />
            <span
              className="text-[11px] font-semibold"
              style={{ color: systemHealthy ? "#16A34A" : "#DC2626" }}
            >
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

          {/* Divider */}
          <div className="w-px h-6 mx-1" style={{ background: "rgba(13,27,53,0.09)" }} />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all outline-none hover:bg-[#F0F4FA] group">
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
              <ChevronDown className="w-3 h-3 text-[#6378A0] group-hover:text-[#0D1B35] transition-colors" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 border-[#E2E8F4] rounded-2xl overflow-hidden p-1"
              style={{ boxShadow: "0 8px 32px rgba(13,27,53,0.12), 0 2px 8px rgba(13,27,53,0.06)" }}
            >
              <DropdownMenuLabel className="text-[10px] font-bold text-[#98A8C0] uppercase tracking-wider px-3 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#E2E8F4] mx-1" />
              <DropdownMenuItem className="text-[#0D1B35] text-sm rounded-xl px-3 py-2 cursor-pointer focus:bg-[#F0F4FA]">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#0D1B35] text-sm rounded-xl px-3 py-2 cursor-pointer focus:bg-[#F0F4FA]">
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E2E8F4] mx-1" />
              <DropdownMenuItem
                className="text-[#DC2626] text-sm font-semibold rounded-xl px-3 py-2 cursor-pointer focus:bg-[#FEF2F2]"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
