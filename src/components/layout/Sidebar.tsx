"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Activity, ShieldCheck,
  MapPin, Package, Radio, Wifi, Bell, BarChart2,
  Users, Settings, FileText, Cpu, ChevronRight,
  Building2, Layers, Plug, ScrollText, MonitorDot, History,
} from "lucide-react";

// Each section can have its own accent color
const NAV = [
  {
    section: "OVERVIEW",
    accent: "#60A5FA",   // blue-400
    items: [
      { label: "Executive",  href: "/dashboard/executive",  icon: LayoutDashboard },
      { label: "Operations", href: "/dashboard/operations", icon: Activity },
      { label: "Energy",     href: "/dashboard/energy",     icon: Zap },
      { label: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck },
    ],
  },
  {
    section: "LOCATIONS",
    accent: "#34D399",   // emerald-400
    items: [
      { label: "Sites",           href: "/sites",               icon: MapPin },
      { label: "Departments",     href: "/departments",         icon: Building2 },
      { label: "Bagians",         href: "/bagians",             icon: Layers },
      { label: "Install. Points", href: "/installation-points", icon: Cpu },
    ],
  },
  {
    section: "EQUIPMENT",
    accent: "#A78BFA",   // violet-400
    items: [
      { label: "Assets",   href: "/assets",   icon: Package },
      { label: "Sensors",  href: "/sensors",  icon: Radio },
      { label: "Gateways", href: "/gateways", icon: Wifi },
    ],
  },
  {
    section: "MONITORING",
    accent: "#FBBF24",   // amber-400
    items: [
      { label: "SCADA View",      href: "/scada",     icon: MonitorDot },
      { label: "Live Telemetry",  href: "/telemetry", icon: BarChart2  },
      { label: "Historical Data", href: "/history",   icon: History    },
      { label: "Alerts",          href: "/alerts",    icon: Bell       },
      { label: "Alert Rules",     href: "/alert-rules", icon: Settings },
    ],
  },
  {
    section: "ADMIN",
    accent: "#94A3B8",   // slate-400
    items: [
      { label: "Reports",      href: "/reports",      icon: FileText   },
      { label: "Users",        href: "/users",        icon: Users      },
      { label: "Integrations", href: "/integrations", icon: Plug       },
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
        background: "linear-gradient(180deg, #0C1628 0%, #0E1E3C 55%, #0B1830 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard/executive" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B8901A 0%, #D4A82A 50%, #9A7814 100%)", boxShadow: "0 0 14px rgba(184,144,26,0.35)" }}
          >
            <span className="text-white font-black text-sm tracking-tight relative z-10">E</span>
          </div>
          <div>
            <p className="text-white font-black text-[13px] leading-tight tracking-wide">ELEMENT</p>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-tight" style={{ color: "#B8901A" }}>
              Monitoring System
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-3.5 overflow-y-auto">
        {NAV.map(({ section, accent, items }) => (
          <div key={section}>
            {/* Section label with accent dot */}
            <div className="flex items-center gap-1.5 px-2 mb-1">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
              <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: `${accent}99` }}>
                {section}
              </p>
            </div>

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
                            background: `linear-gradient(90deg, ${accent}22 0%, ${accent}08 100%)`,
                            color: "#FFFFFF",
                          }
                        : {}
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
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
                    {/* Active left bar — uses section accent */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
                        style={{ backgroundColor: accent }}
                      />
                    )}

                    <Icon
                      className="w-[15px] h-[15px] flex-shrink-0 transition-colors"
                      style={{ color: active ? accent : "rgba(255,255,255,0.28)" }}
                    />

                    <span
                      className="truncate leading-none"
                      style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.52)" }}
                    >
                      {label}
                    </span>

                    {active && (
                      <ChevronRight
                        className="w-3 h-3 ml-auto flex-shrink-0"
                        style={{ color: `${accent}66` }}
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
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#22C55E" }} />
          <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>
            WIT.ID © 2026 · v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
