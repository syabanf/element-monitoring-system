"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Activity, ShieldCheck,
  MapPin, Package, Radio, Wifi, Bell, BarChart2,
  Users, Settings, FileText, BookOpen, Cpu, ChevronRight,
} from "lucide-react";

const NAV = [
  {
    section: "OVERVIEW",
    items: [
      { label: "Executive",   href: "/dashboard/executive",  icon: LayoutDashboard },
      { label: "Operations",  href: "/dashboard/operations", icon: Activity },
      { label: "Energy",      href: "/dashboard/energy",     icon: Zap },
      { label: "Compliance",  href: "/dashboard/compliance", icon: ShieldCheck },
    ],
  },
  {
    section: "ASSETS",
    items: [
      { label: "Sites",               href: "/sites",               icon: MapPin },
      { label: "Installation Points", href: "/installation-points", icon: Cpu },
      { label: "Assets",              href: "/assets",              icon: Package },
      { label: "Sensors",             href: "/sensors",             icon: Radio },
      { label: "Gateways",            href: "/gateways",            icon: Wifi },
    ],
  },
  {
    section: "MONITORING",
    items: [
      { label: "Live Telemetry", href: "/telemetry",    icon: BarChart2 },
      { label: "Alerts",         href: "/alerts",       icon: Bell },
      { label: "Alert Rules",    href: "/alert-rules",  icon: Settings },
    ],
  },
  {
    section: "REPORTS & ADMIN",
    items: [
      { label: "Reports",      href: "/reports",      icon: FileText },
      { label: "Users",        href: "/users",        icon: Users },
      { label: "Integrations", href: "/integrations", icon: BookOpen },
      { label: "Audit Log",    href: "/audit-log",    icon: BookOpen },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard/executive"
      ? pathname === href || pathname === "/"
      : pathname.startsWith(href);

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col h-screen bg-[#0F1C3F] border-r border-white/[0.06] sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B8901A] flex items-center justify-center shadow-lg shadow-[#B8901A]/25 flex-shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">E</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">ELEMENT</p>
            <p className="text-[#B8901A] text-[10px] font-semibold tracking-widest uppercase leading-tight">Monitoring System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.14em] px-2 mb-1.5">{section}</p>
            <div className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-white/[0.10] text-white"
                        : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#B8901A] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
                        active ? "text-[#B8901A]" : "text-white/35 group-hover:text-white/65"
                      }`}
                    />
                    <span className="truncate leading-none">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 text-white/25 ml-auto flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <p className="text-white/25 text-[10px] font-medium">WIT.ID © 2026</p>
        <p className="text-white/15 text-[9px] mt-0.5">Element Monitoring v1.0</p>
      </div>
    </aside>
  );
}
