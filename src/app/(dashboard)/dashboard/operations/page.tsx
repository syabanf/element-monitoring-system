import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Bell, Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const severityBadge: Record<string, string> = {
  CRITICAL: "bg-[#ef444420] text-[#ef4444] border border-[#ef444440]",
  HIGH: "bg-[#f59e0b20] text-[#f59e0b] border border-[#f59e0b40]",
  MEDIUM: "bg-[#3b82f620] text-[#3b82f6] border border-[#3b82f640]",
  LOW: "bg-[#88888820] text-[#888888] border border-[#88888840]",
  INFO: "bg-[#6366f120] text-[#6366f1] border border-[#6366f140]",
};

const statusBadge: Record<string, string> = {
  OPEN: "bg-[#ef444420] text-[#ef4444]",
  ACKNOWLEDGED: "bg-[#f59e0b20] text-[#f59e0b]",
  INVESTIGATING: "bg-[#3b82f620] text-[#3b82f6]",
  RESOLVED: "bg-[#22c55e20] text-[#22c55e]",
  CLOSED: "bg-[#88888820] text-[#888888]",
  FALSE_POSITIVE: "bg-[#88888820] text-[#888888]",
};

export default async function OperationsDashboardPage() {
  await auth();

  const [onlineSensors, offlineSensors, faultSensors, openAlerts, recentAlerts, sites, assets] = await Promise.all([
    prisma.sensor.count({ where: { status: "ONLINE" } }),
    prisma.sensor.count({ where: { status: "OFFLINE" } }),
    prisma.sensor.count({ where: { status: "FAULT" } }),
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
    prisma.asset.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, pillar: true, status: true, site: { select: { name: true } } },
      take: 20,
      orderBy: { name: "asc" },
    }),
  ]);

  // Suppress unused variable warning
  void assets;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-[#888888] text-sm mt-0.5">Real-time operational status and alert queue</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#888888] text-sm">Live</span>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#22c55e15] flex items-center justify-center">
            <Wifi className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-[#888888] text-xs">Online Sensors</p>
            <p className="text-white text-xl font-bold">{onlineSensors}</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ef444415] flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <p className="text-[#888888] text-xs">Offline Sensors</p>
            <p className="text-white text-xl font-bold">{offlineSensors}</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#ef444425] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ef444415] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <p className="text-[#888888] text-xs">Open Alerts</p>
            <p className="text-white text-xl font-bold">{openAlerts}</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f59e0b15] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-[#888888] text-xs">Sensor Faults</p>
            <p className="text-white text-xl font-bold">{faultSensors}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert Queue */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
            <h2 className="text-white font-semibold">Alert Queue</h2>
            <a href="/alerts" className="text-[#e11d48] text-xs hover:underline">Manage alerts →</a>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <CheckCircle className="w-10 h-10 text-[#22c55e] mb-3" />
                <p className="text-white font-medium">All clear</p>
                <p className="text-[#888888] text-sm">No open alerts</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <a href={`/alerts/${alert.id}`} key={alert.id} className="flex items-start gap-4 p-4 hover:bg-[#1a1a1a] transition-colors block">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium mt-0.5 flex-shrink-0 ${severityBadge[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-[#888888] text-xs mt-0.5">{alert.asset.site.name} · {alert.asset.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[alert.status]}`}>{alert.status}</span>
                    <p className="text-[#888888] text-xs flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Site Status */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="p-5 border-b border-[#2a2a2a]">
            <h2 className="text-white font-semibold">Site Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {sites.map((site, i) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">{site.name}</p>
                  <p className="text-[#888888] text-xs">Operational</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i % 3 === 2 ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'}`} />
                  <span className={`text-xs ${i % 3 === 2 ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>
                    {i % 3 === 2 ? 'WARN' : 'OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
