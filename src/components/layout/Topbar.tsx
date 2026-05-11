"use client";

import { Bell, ChevronDown, Circle, Search } from "lucide-react";
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
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-[#E5DDD0] flex-shrink-0">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-[#1C1714] font-semibold text-base">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* System status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F3EE] border border-[#E5DDD0]">
          <Circle
            className={systemHealthy ? "text-[#166534] fill-[#166534]" : "text-[#B91C1C] fill-[#B91C1C]"}
            style={{ width: 7, height: 7 }}
          />
          <span className="text-xs text-[#5C5248] font-medium">
            {systemHealthy ? "All Systems Normal" : "System Alert"}
          </span>
        </div>

        {/* Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#9C9285] hover:text-[#1C1714] hover:bg-[#F5F3EE] w-9 h-9"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B8901A] text-[9px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#E5DDD0]" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#5C5248] hover:text-[#1C1714] hover:bg-[#F5F3EE] transition-colors outline-none">
            <Avatar className="w-7 h-7 border-2 border-[#F5E6B5]">
              <AvatarFallback className="bg-[#FEF7E6] text-[#B8901A] text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-[#1C1714]">{userName}</span>
              <span className="text-[9px] text-[#B8901A] font-medium mt-0.5">{roleLabel}</span>
            </div>
            <ChevronDown className="w-3 h-3 ml-0.5 text-[#9C9285]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border-[#E5DDD0] shadow-lg">
            <DropdownMenuLabel className="text-[#9C9285] text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#EDE8E0]" />
            <DropdownMenuItem className="text-[#1C1714] hover:bg-[#F5F3EE] cursor-pointer text-sm">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#1C1714] hover:bg-[#F5F3EE] cursor-pointer text-sm">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#EDE8E0]" />
            <DropdownMenuItem
              className="text-[#B91C1C] hover:bg-[#FEF2F2] cursor-pointer text-sm font-medium"
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
