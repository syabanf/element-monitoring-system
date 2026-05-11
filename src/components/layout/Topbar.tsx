"use client";

import { Bell, ChevronDown, Circle } from "lucide-react";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = userRole
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-[#0a0a0a] border-b border-[#2a2a2a] flex-shrink-0">
      {/* Page title */}
      <h1 className="text-white font-semibold text-base truncate">{title}</h1>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="flex items-center gap-1.5">
          <Circle
            className={systemHealthy ? "text-green-500 fill-green-500" : "text-red-500 fill-red-500"}
            style={{ width: 8, height: 8 }}
          />
          <span className="text-xs text-[#888888]">
            {systemHealthy ? "System Healthy" : "System Alert"}
          </span>
        </div>

        <div className="w-px h-5 bg-[#2a2a2a]" />

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e11d48] text-[9px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <Avatar className="w-7 h-7 border border-[#2a2a2a]">
              <AvatarFallback className="bg-[#e11d48]/20 text-[#e11d48] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-medium text-white">{userName}</span>
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 h-3.5 border-[#e11d48]/40 text-[#e11d48] mt-0.5"
              >
                {roleLabel}
              </Badge>
            </div>
            <ChevronDown className="w-3 h-3 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#1a1a1a] border-[#2a2a2a] text-white"
          >
            <DropdownMenuLabel className="text-[#888888] text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem className="hover:bg-[#2a2a2a] cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#2a2a2a] cursor-pointer">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            <DropdownMenuItem
              className="text-[#e11d48] hover:bg-[#2a2a2a] cursor-pointer"
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
