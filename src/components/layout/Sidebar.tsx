"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Activity, ShieldCheck,
  MapPin, Package, Radio, Wifi, Bell, BarChart2,
  Users, Settings, FileText, Cpu, ChevronRight,
  Building2, Layers, Plug, ScrollText,
} from "lucide-react";

const NAV = [
  {
    section: "OVERVIEW",
    items: [
      { label: "Executive",  href: "/dashboard/executive",  icon: LayoutDashboard },
      { label: "Operations", href: "/dashboard/operations", icon: Activity },
      { label: "Energy",     href: "/dashboard/energy",     icon: Zap },
      { label: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck },
    ],
  },
  {
    section: "LOCATIONS",
    items: [
      { label: "Sites",           href: "/sites",               icon: MapPin },
      { label: "Departments",     href: "/departments",         icon: Building2 },
      { label: "Bagians",         href: "/bagians",             icon: Layers },
      { label: "Install. Points", href: "/installation-points", icon: Cpu },
    ],
  },
  {
    section: "EQUIPMENT",
    items: [
      { label: "Assets",   href: "/assets",   icon: Package },
      { label: "Sensors",  href: "/sensors",  icon: Radio },
      { label: "Gateways", href: "/gateways", icon: Wifi },
    ],
  },
  {
    section: "MONITORING",
    items: [
      { label: "Live Telemetry", href: "/telemetry",   icon: BarChart2 },
      { label: "Alerts",         href: "/alerts",      icon: Bell },
      { label: "Alert Rules",    href: "/alert-rules", icon: Settings },
    ],
  },
  {
    section: "ADMIN",
    items: [
      { label: "Reports",      href: "/reports",      icon: FileText },
      { label: "Users",        href: "/users",        icon: Users },
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "Audit Log",    href: "/audit-log",    icon: ScrollText },
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
    <aside
      className="w-[228px] flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0B1526 0%, #0F1D3A 60%, #0D1830 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard/executive" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-gold relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B8901A 0%, #D4A82A 50%, #9A7814 100%)" }}
          >
            <span className="text-white font-black text-sm tracking-tight relative z-10">E</span>
          </div>
          <div>
            <p className="text-white font-black text-[13px] leading-tight tracking-wide">ELEMENT</p>
            <p
              className="text-[9px] font-bold tracking-[0.18em] uppercase leading-tight"
              style={{ color: "#B8901A" }}
            >
              Monitoring System
            </p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p
              className="px-2 mb-1 text-[9px] font-black uppercase tracking-[0.16em]"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              {section}
            </p>
            <div className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="group relative flex items-center gap-2.5 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all duration-150"
                    style={
                      active
                        ? {
                            background: "linear-gradient(90deg, rgba(184,144,26,0.18) 0%, rgba(184,144,26,0.06) 100%)",
                            color: "#FFFFFF",
                          }
                        : {}
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "";
                        (e.currentTarget as HTMLElement).style.color = "";
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
                        style={{ background: "linear-gradient(180deg, #D4A82A 0%, #B8901A 100%)" }}
                      />
                    )}

                    <Icon
                      className="w-[15px] h-[15px] flex-shrink-0 transition-colors"
                      style={{
                        color: active
                          ? "#D4A82A"
                          : "rgba(255,255,255,0.30)",
                      }}
                    />

                    <span
                      className="truncate leading-none"
                      style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.48)" }}
                    >
                      {label}
                    </span>

                    {active && (
                      <ChevronRight
                        className="w-3 h-3 ml-auto flex-shrink-0"
                        style={{ color: "rgba(212,168,42,0.5)" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "#22C55E" }}
          />
          <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>
            WIT.ID © 2026 · v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
