"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  Zap,
  ClipboardCheck,
  MapPin,
  Package,
  Radio,
  Wifi,
  Gauge,
  Bell,
  FileText,
  Users,
  Settings,
  Shield,
  BookOpen,
  ChevronRight,
  Navigation,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Executive Dashboard", href: "/dashboard/executive", icon: LayoutDashboard },
      { label: "Operations Dashboard", href: "/dashboard/operations", icon: Activity },
      { label: "Energy Dashboard", href: "/dashboard/energy", icon: Zap },
      { label: "Compliance Dashboard", href: "/dashboard/compliance", icon: ClipboardCheck },
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
    title: "Reports",
    items: [
      { label: "Report Center", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Alert Rules", href: "/alert-rules", icon: Settings },
      { label: "Integrations", href: "/integrations", icon: Shield },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Audit Log", href: "/audit-log", icon: BookOpen },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen bg-[#0a0a0a] border-r border-[#2a2a2a] overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[#2a2a2a]">
        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-xl tracking-wider">ELEMENT</span>
          <span className="text-[#e11d48] text-[10px] font-semibold tracking-[0.2em] uppercase">
            Monitoring
          </span>
        </div>
        <div className="ml-auto">
          <ChevronRight className="text-[#2a2a2a] w-4 h-4" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#888888]">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20"
                          : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#2a2a2a]">
        <p className="text-[10px] text-[#888888]">WIT.ID &copy; {new Date().getFullYear()}</p>
        <p className="text-[10px] text-[#2a2a2a]">v1.0.0</p>
      </div>
    </aside>
  );
}
