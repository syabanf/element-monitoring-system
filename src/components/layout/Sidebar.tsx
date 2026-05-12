"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Activity, ShieldCheck,
  MapPin, Package, Radio, Wifi, Bell, BarChart2,
  Users, Settings, FileText, Cpu, ChevronRight, ChevronLeft,
  Building2, Layers, Plug, ScrollText, MonitorDot, History,
} from "lucide-react";

const NAV = [
  {
    section: "OVERVIEW",
    accent: "#60A5FA",
    items: [
      { label: "Executive",  href: "/dashboard/executive",  icon: LayoutDashboard },
      { label: "Operations", href: "/dashboard/operations", icon: Activity },
      { label: "Energy",     href: "/dashboard/energy",     icon: Zap },
      { label: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck },
    ],
  },
  {
    section: "LOCATIONS",
    accent: "#34D399",
    items: [
      { label: "Sites",           href: "/sites",               icon: MapPin },
      { label: "Departments",     href: "/departments",         icon: Building2 },
      { label: "Bagians",         href: "/bagians",             icon: Layers },
      { label: "Install. Points", href: "/installation-points", icon: Cpu },
    ],
  },
  {
    section: "EQUIPMENT",
    accent: "#A78BFA",
    items: [
      { label: "Assets",   href: "/assets",   icon: Package },
      { label: "Sensors",  href: "/sensors",  icon: Radio },
      { label: "Gateways", href: "/gateways", icon: Wifi },
    ],
  },
  {
    section: "MONITORING",
    accent: "#FBBF24",
    items: [
      { label: "SCADA View",      href: "/scada",       icon: MonitorDot },
      { label: "Live Telemetry",  href: "/telemetry",   icon: BarChart2  },
      { label: "Historical Data", href: "/history",     icon: History    },
      { label: "Alerts",          href: "/alerts",      icon: Bell       },
      { label: "Alert Rules",     href: "/alert-rules", icon: Settings   },
    ],
  },
  {
    section: "ADMIN",
    accent: "#94A3B8",
    items: [
      { label: "Reports",      href: "/reports",      icon: FileText   },
      { label: "Users",        href: "/users",        icon: Users      },
      { label: "Integrations", href: "/integrations", icon: Plug       },
      { label: "Audit Log",    href: "/audit-log",    icon: ScrollText },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard/executive"
      ? pathname === href || pathname === "/"
      : pathname.startsWith(href);

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 64 : 228,
        background: "linear-gradient(180deg, #0C1628 0%, #0E1E3C 55%, #0B1830 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo row */}
      <div className={`pt-5 pb-4 flex items-center ${collapsed ? "justify-center px-0" : "px-4"}`}>
        <Link href="/dashboard/executive" className="flex items-center gap-3 group min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #B8901A 0%, #D4A82A 50%, #9A7814 100%)",
              boxShadow: "0 0 14px rgba(184,144,26,0.35)",
            }}
          >
            <span className="text-white font-black text-sm tracking-tight relative z-10">E</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-white font-black text-[13px] leading-tight tracking-wide whitespace-nowrap">ELEMENT</p>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase leading-tight whitespace-nowrap" style={{ color: "#B8901A" }}>
                Monitoring System
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className={`flex-1 py-3 space-y-3.5 overflow-y-auto overflow-x-hidden ${collapsed ? "px-1.5" : "px-2.5"}`}>
        {NAV.map(({ section, accent, items }) => (
          <div key={section}>
            {collapsed ? (
              /* Divider line in place of section label */
              <div className="mx-1 mb-1.5 h-px" style={{ background: `${accent}33` }} />
            ) : (
              <div className="flex items-center gap-1.5 px-2 mb-1">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
                <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: `${accent}99` }}>
                  {section}
                </p>
              </div>
            )}

            <div className="space-y-0.5">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className="group relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-150"
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "8px" : "7px 12px",
                      ...(active
                        ? { background: `linear-gradient(90deg, ${accent}22 0%, ${accent}08 100%)`, color: "#FFFFFF" }
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "";
                      }
                    }}
                  >
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

                    {!collapsed && (
                      <>
                        <span
                          className="ml-2.5 truncate leading-none"
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
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / toggle */}
      <div
        className="px-3 py-3 flex items-center"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#22C55E" }} />
            <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>
              WIT.ID © 2026 · v1.0
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            : <ChevronLeft  className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
          }
        </button>
      </div>
    </aside>
  );
}
