"use client";

import { Bell, ChevronDown, Circle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-[#D9E2F0] flex-shrink-0 shadow-sm shadow-[#D9E2F0]/40">
      {/* Page title */}
      <h1 className="text-[#0D1B35] font-semibold text-base tracking-tight">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* System status pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F5FB] border border-[#D9E2F0]">
          <Circle
            className={systemHealthy ? "fill-[#166534] text-[#166534]" : "fill-[#B91C1C] text-[#B91C1C]"}
            style={{ width: 7, height: 7 }}
          />
          <span className="text-[11px] text-[#3D5280] font-semibold">
            {systemHealthy ? "All Systems Normal" : "System Alert"}
          </span>
        </div>

        {/* Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#6378A0] hover:text-[#0D1B35] hover:bg-[#F2F5FB] w-9 h-9"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B8901A] text-[9px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>

        <div className="w-px h-5 bg-[#D9E2F0]" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#3D5280] hover:text-[#0D1B35] hover:bg-[#F2F5FB] transition-colors outline-none">
            <Avatar className="w-7 h-7 border-2 border-[#B8901A]/30">
              <AvatarFallback className="bg-[#FFF8E6] text-[#B8901A] text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-[#0D1B35]">{userName}</span>
              <span className="text-[9px] text-[#B8901A] font-semibold mt-0.5">{roleLabel}</span>
            </div>
            <ChevronDown className="w-3 h-3 ml-0.5 text-[#6378A0]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-[#D9E2F0] shadow-lg rounded-xl">
            <DropdownMenuLabel className="text-[#6378A0] text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#D9E2F0]" />
            <DropdownMenuItem className="text-[#0D1B35] hover:bg-[#F2F5FB] cursor-pointer text-sm rounded-lg">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-[#0D1B35] hover:bg-[#F2F5FB] cursor-pointer text-sm rounded-lg">Preferences</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#D9E2F0]" />
            <DropdownMenuItem
              className="text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer text-sm font-medium rounded-lg"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
