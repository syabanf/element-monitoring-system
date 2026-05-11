import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Bell, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import { SensorHealthRing } from "@/components/dashboard/SensorHealthRing";
import { SiteBarChart } from "@/components/dashboard/SiteBarChart";

const severityBadge: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  HIGH:     { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  MEDIUM:   { bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE" },
  LOW:      { bg: "#F5F3EE", text: "#5C5248", border: "#E5DDD0" },
  INFO:     { bg: "#F5F3EE", text: "#5C5248", border: "#E5DDD0" },
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  OPEN:           { bg: "#FEF2F2", text: "#B91C1C" },
  ACKNOWLEDGED:   { bg: "#FFFBEB", text: "#B45309" },
  INVESTIGATING:  { bg: "#EFF6FF", text: "#1E5FA8" },
  RESOLVED:       { bg: "#F0FDF4", text: "#166534" },
  CLOSED:         { bg: "#F5F3EE", text: "#9C9285" },
  FALSE_POSITIVE: { bg: "#F5F3EE", text: "#9C9285" },
};

export default async function OperationsDashboardPage() {
  await auth();

  const [onlineSensors, offlineSensors, faultSensors, calDueSensors, openAlerts, recentAlerts, sites, siteAssetCounts] = await Promise.all([
    prisma.sensor.count({ where: { status: "ONLINE" } }),
    prisma.sensor.count({ where: { status: "OFFLINE" } }),
    prisma.sensor.count({ where: { status: "FAULT" } }),
    prisma.sensor.count({ where: { status: "CALIBRATION_DUE" } }),
    prisma.alert.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
    prisma.alert.findMany({
      where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } },
      include: {
        asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
        assignee: { select: { name: true } },
      },
      orderBy: [{ severity: "asc" }, { openedAt: "desc" }],
      take: 20,
    }),
    prisma.site.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    prisma.site.findMany({
      where: { isActive: true },
      include: { _count: { select: { assets: true } }, assets: { include: { _count: { select: { sensors: true } } } } },
    }),
  ]);

  const siteChartData = siteAssetCounts.map(s => ({
    name: s.name,
    assets: s._count.assets,
    sensors: s.assets.reduce((sum: number, a: { _count: { sensors: number } }) => sum + a._count.sensors, 0),
    alerts: 0,
  }));

  const statCards = [
    { label: "Online Sensors", value: onlineSensors, icon: Wifi,          color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
    { label: "Offline Sensors", value: offlineSensors, icon: WifiOff,     color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
    { label: "Open Alerts",    value: openAlerts,      icon: AlertTriangle,color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Sensor Faults",  value: faultSensors,    icon: Bell,         color: "#1E5FA8", bg: "#EFF6FF", border: "#BFDBFE" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1C1714] text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">Real-time operational status and alert queue</p>
        </div>
        <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#166534] text-xs font-semibold">Live Monitoring</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, border: `1px solid ${border}` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-[#9C9285] text-xs font-medium">{label}</p>
                <p className="text-[#1C1714] text-2xl font-bold leading-none mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor Health + Site Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#1C1714] font-semibold">Sensor Health</h3>
              <p className="text-[#9C9285] text-xs mt-0.5">Real-time status breakdown</p>
            </div>
            <a href="/sensors" className="text-[#B8901A] text-xs font-semibold hover:underline">View all →</a>
          </div>
          <SensorHealthRing online={onlineSensors} offline={offlineSensors} fault={faultSensors} calibrationDue={calDueSensors} />
        </div>
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1C1714] font-semibold">Site Asset Coverage</h3>
              <p className="text-[#9C9285] text-xs mt-0.5">Assets & sensors per site</p>
            </div>
            <a href="/sites" className="text-[#B8901A] text-xs font-semibold hover:underline">View sites →</a>
          </div>
          <SiteBarChart data={siteChartData} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#B8901A]" /><span className="text-[#9C9285] text-xs">Assets</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#E5DDD0]" /><span className="text-[#9C9285] text-xs">Sensors</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert Queue */}
        <div className="lg:col-span-2 bg-white border border-[#E5DDD0] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8E0] bg-[#F5F3EE]">
            <h2 className="text-[#1C1714] font-semibold">Alert Queue</h2>
            <a href="/alerts" className="text-[#B8901A] text-xs font-semibold hover:underline">Manage all →</a>
          </div>
          <div>
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-[#22C55E]" />
                </div>
                <p className="text-[#1C1714] font-semibold">All clear</p>
                <p className="text-[#9C9285] text-sm mt-1">No open alerts at this time</p>
              </div>
            ) : (
              recentAlerts.map((alert) => {
                const sev = severityBadge[alert.severity] ?? severityBadge.LOW;
                const st = statusBadge[alert.status] ?? statusBadge.CLOSED;
                return (
                  <a
                    href={`/alerts/${alert.id}`}
                    key={alert.id}
                    className="flex items-center gap-4 px-5 py-4 border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0"
                  >
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 border"
                      style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}
                    >
                      {alert.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1C1714] text-sm font-semibold truncate">{alert.title}</p>
                      <p className="text-[#9C9285] text-xs mt-0.5">{alert.asset.site.name} · {alert.asset.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium block" style={{ backgroundColor: st.bg, color: st.text }}>
                        {alert.status}
                      </span>
                      <p className="text-[#9C9285] text-[10px] flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Site Status */}
        <div className="bg-white border border-[#E5DDD0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EDE8E0] bg-[#F5F3EE]">
            <h2 className="text-[#1C1714] font-semibold">Site Status</h2>
          </div>
          <div className="p-4 space-y-2">
            {sites.map((site, i) => {
              const isWarn = i % 3 === 2;
              return (
                <a
                  href={`/sites/${site.id}`}
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#EDE8E0] hover:border-[#F5E6B5] hover:bg-[#FEF7E6] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#B8901A]" />
                    </div>
                    <div>
                      <p className="text-[#1C1714] text-sm font-semibold leading-tight">{site.name}</p>
                      <p className="text-[#9C9285] text-xs">Operational</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={isWarn
                      ? { backgroundColor: "#FFFBEB", color: "#B45309" }
                      : { backgroundColor: "#F0FDF4", color: "#166534" }
                    }
                  >
                    {isWarn ? "WARN" : "OK"}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
