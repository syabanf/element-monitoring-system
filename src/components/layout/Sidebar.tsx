"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Activity, Zap, ClipboardCheck,
  MapPin, Package, Radio, Wifi, Gauge, Bell,
  FileText, Users, Settings, Shield, BookOpen, Navigation,
} from "lucide-react";

interface NavItem { label: string; href: string; icon: React.ElementType }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Executive", href: "/dashboard/executive", icon: LayoutDashboard },
      { label: "Operations", href: "/dashboard/operations", icon: Activity },
      { label: "Energy", href: "/dashboard/energy", icon: Zap },
      { label: "Compliance", href: "/dashboard/compliance", icon: ClipboardCheck },
    ],
  },
  {
    title: "Assets",
    items: [
      { label: "Sites", href: "/sites", icon: MapPin },
      { label: "Installation Points", href: "/installation-points", icon: Navigation },
      { label: "Assets", href: "/assets", icon: Package },
      { label: "Sensors", href: "/sensors", icon: Radio },
      { label: "Gateways", href: "/gateways", icon: Wifi },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { label: "Live Telemetry", href: "/telemetry", icon: Gauge },
      { label: "Alerts", href: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Reports & Admin",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Users", href: "/users", icon: Users },
      { label: "Alert Rules", href: "/alert-rules", icon: Settings },
      { label: "Integrations", href: "/integrations", icon: Shield },
      { label: "Audit Log", href: "/audit-log", icon: BookOpen },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 h-screen bg-white border-r border-[#E5DDD0] overflow-y-auto flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5DDD0]">
        <div className="w-8 h-8 rounded-lg bg-[#B8901A] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-xs tracking-widest">E</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[#1C1714] font-bold text-sm tracking-wider">ELEMENT</span>
          <span className="text-[#B8901A] text-[9px] font-semibold tracking-[0.15em] uppercase mt-0.5">
            Monitoring System
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#9C9285]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#FEF7E6] text-[#B8901A] shadow-sm"
                          : "text-[#5C5248] hover:text-[#1C1714] hover:bg-[#F5F3EE]"
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#B8901A]" : "text-[#9C9285]")}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B8901A] flex-shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#E5DDD0] bg-[#F5F3EE]">
        <p className="text-[10px] text-[#9C9285] font-medium">WIT.ID &copy; {new Date().getFullYear()}</p>
        <p className="text-[9px] text-[#D4C8B8] mt-0.5">Element Monitoring v1.0</p>
      </div>
    </aside>
  );
}
