import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Zap, Droplets, Wind, Thermometer, FlaskConical, Gauge, Activity,
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Leaf, MapPin,
  CheckCircle, ArrowUpRight,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PillarStatusCard } from "@/components/dashboard/PillarStatusCard";
import { AlertSummaryRow } from "@/components/dashboard/AlertSummaryRow";
import { TrendChart } from "@/components/dashboard/TrendChart";

function seededRand(seed: number, base: number, variance: number) {
  const x = Math.sin(seed) * 10000;
  return Math.round(base + (x - Math.floor(x) - 0.5) * variance);
}

function generateTrendData(base: number, variance: number, days = 14) {
  return Array.from({ length: days }, (_, i) => ({
    label: `D-${days - i}`,
    value: seededRand(i * 7 + base, base, variance),
    value2: seededRand(i * 7 + base + 1, base * 0.95, variance * 0.9),
  }));
}

const utilizationData = [
  { pillar: "Electricity", icon: "⚡", value: 71, label: "2,847 / 4,000 kW", color: "#f59e0b", status: "NORMAL" },
  { pillar: "Water", icon: "💧", value: 56, label: "8,420 / 15,000 m³", color: "#3b82f6", status: "NORMAL" },
  { pillar: "Wastewater", icon: "🧪", value: 78, label: "180 / 230 mg/L COD", color: "#8b5cf6", status: "WARNING" },
  { pillar: "Gas / Air", icon: "💨", value: 21, label: "2.1% / 10% LEL", color: "#22c55e", status: "NORMAL" },
  { pillar: "HVAC", icon: "🌡️", value: 84, label: "Efficiency 84%", color: "#f97316", status: "NORMAL" },
  { pillar: "Compressed Air", icon: "🔧", value: 72, label: "7.2 / 10 bar", color: "#06b6d4", status: "WARNING" },
];

export default async function ExecutiveDashboardPage() {
  await auth();

  const [
    totalSites,
    totalAssets,
    onlineSensors,
    totalSensors,
    openAlerts,
    criticalAlerts,
    recentAlerts,
    siteData,
  ] = await Promise.all([
    prisma.site.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { status: "ACTIVE" } }),
    prisma.sensor.count({ where: { status: "ONLINE" } }),
    prisma.sensor.count(),
    prisma.alert.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
    prisma.alert.count({ where: { severity: "CRITICAL", status: { in: ["OPEN", "ACKNOWLEDGED"] } } }),
    prisma.alert.findMany({
      where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } },
      include: { asset: { select: { name: true, pillar: true, site: { select: { name: true } } } } },
      orderBy: [{ severity: "asc" }, { openedAt: "desc" }],
      take: 8,
    }),
    prisma.site.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { assets: true } },
        assets: { select: { pillar: true }, take: 999 },
      },
    }),
  ]);

  const sensorUptime = totalSensors > 0 ? Math.round((onlineSensors / totalSensors) * 100) : 0;
  const energyTrend = generateTrendData(142500, 20000);
  const costTrend = generateTrendData(24800, 4000);

  const highlights = [
    ...(criticalAlerts > 0
      ? [{ type: "danger" as const, text: `${criticalAlerts} critical alert${criticalAlerts > 1 ? "s" : ""} open`, href: "/alerts" }]
      : []),
    { type: "warning" as const, text: "Wastewater pH 7.8 — monitoring", href: "/dashboard/pillar/wastewater" },
    { type: "warning" as const, text: "Compressed air loss 22% — above threshold", href: "/dashboard/pillar/compressed-air" },
    { type: "ok" as const, text: "Energy −3.2% vs last week", href: "/dashboard/energy" },
    { type: "ok" as const, text: `System uptime ${sensorUptime}%`, href: "/sensors" },
    { type: "ok" as const, text: "Water NRW 4.2% — below 5% target", href: "/dashboard/pillar/water" },
  ];

  const highlightStyle = {
    danger: { bg: "#ef444415", border: "#ef444430", text: "#ef4444", dot: "#ef4444" },
    warning: { bg: "#f59e0b15", border: "#f59e0b30", text: "#f59e0b", dot: "#f59e0b" },
    ok: { bg: "#22c55e15", border: "#22c55e30", text: "#22c55e", dot: "#22c55e" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-[#888888] text-sm mt-0.5">
            Portfolio-level operational intelligence ·{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#888888] text-sm">Live · Updated now</span>
        </div>
      </div>

      {/* Highlights bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {highlights.map((h, i) => {
          const s = highlightStyle[h.type];
          return (
            <a
              key={i}
              href={h.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
              {h.text}
            </a>
          );
        })}
      </div>

      {/* KPI Row 1 — Operational */}
      <div>
        <p className="text-[#888888] text-xs uppercase tracking-widest font-semibold mb-3">Operational</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/sites" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Active Sites"
              value={totalSites}
              icon={<MapPin className="w-4 h-4" />}
              subtitle="All operational"
            />
          </a>
          <a href="/assets" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Monitored Assets"
              value={totalAssets}
              icon={<Gauge className="w-4 h-4" />}
              subtitle={`${onlineSensors}/${totalSensors} sensors online`}
            />
          </a>
          <a href="/sensors" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Sensor Uptime"
              value={sensorUptime}
              unit="%"
              status={sensorUptime >= 95 ? "ok" : sensorUptime >= 85 ? "warning" : "danger"}
              icon={<Activity className="w-4 h-4" />}
              subtitle={`${totalSensors - onlineSensors} offline`}
            />
          </a>
          <a href="/alerts" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Open Alerts"
              value={openAlerts}
              status={criticalAlerts > 0 ? "danger" : openAlerts > 10 ? "warning" : "ok"}
              icon={<AlertTriangle className="w-4 h-4" />}
              subtitle={`${criticalAlerts} critical`}
            />
          </a>
        </div>
      </div>

      {/* KPI Row 2 — Financial & Environmental */}
      <div>
        <p className="text-[#888888] text-xs uppercase tracking-widest font-semibold mb-3">Financial & Environmental</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/dashboard/energy" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Energy Cost Today"
              value="IDR 24.8M"
              trend={-1.8}
              icon={<DollarSign className="w-4 h-4" />}
              subtitle="vs yesterday"
            />
          </a>
          <a href="/dashboard/pillar/water" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Water Cost Today"
              value="IDR 3.2M"
              trend={0.4}
              icon={<Droplets className="w-4 h-4" />}
              subtitle="vs yesterday"
            />
          </a>
          <a href="/dashboard/compliance" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Carbon Today"
              value="68.4"
              unit="tCO₂e"
              trend={4.2}
              status="warning"
              icon={<Leaf className="w-4 h-4" />}
              subtitle="↑ over target"
            />
          </a>
          <a href="/dashboard/pillar/compressed-air" className="block hover:opacity-90 transition-opacity">
            <KpiCard
              title="Compressed Air Loss"
              value={22}
              unit="%"
              status="warning"
              icon={<Gauge className="w-4 h-4" />}
              subtitle="est. IDR 2.1M/day"
            />
          </a>
        </div>
      </div>

      {/* Utility Pillars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Utility Pillars</h2>
          <span className="text-[#888888] text-xs">Click a pillar to drill down →</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PillarStatusCard
            href="/dashboard/pillar/electricity"
            pillar="Electricity"
            icon={<Zap className="w-4 h-4" />}
            status="NORMAL"
            primaryMetric="Today's Consumption"
            primaryValue="142,500 kWh"
            secondaryMetrics={[{ label: "Peak Demand", value: "2,847 kW" }, { label: "Power Factor", value: "0.87" }]}
            color="#f59e0b"
          />
          <PillarStatusCard
            href="/dashboard/pillar/water"
            pillar="Water"
            icon={<Droplets className="w-4 h-4" />}
            status="NORMAL"
            primaryMetric="Today's Consumption"
            primaryValue="8,420 m³"
            secondaryMetrics={[{ label: "Leak Risk", value: "LOW" }, { label: "NRW Rate", value: "4.2%" }]}
            color="#3b82f6"
          />
          <PillarStatusCard
            href="/dashboard/pillar/wastewater"
            pillar="Wastewater"
            icon={<FlaskConical className="w-4 h-4" />}
            status="WARNING"
            primaryMetric="pH Level"
            primaryValue="7.8"
            secondaryMetrics={[{ label: "COD", value: "180 mg/L" }, { label: "TSS", value: "42 mg/L" }]}
            color="#8b5cf6"
          />
          <PillarStatusCard
            href="/dashboard/pillar/gas-air"
            pillar="Gas / Air"
            icon={<Wind className="w-4 h-4" />}
            status="NORMAL"
            primaryMetric="LEL Level"
            primaryValue="2.1%"
            secondaryMetrics={[{ label: "CO", value: "12 ppm" }, { label: "CH₄", value: "0.8%" }]}
            color="#22c55e"
          />
          <PillarStatusCard
            href="/dashboard/pillar/thermal-hvac"
            pillar="Thermal / HVAC"
            icon={<Thermometer className="w-4 h-4" />}
            status="NORMAL"
            primaryMetric="HVAC Efficiency"
            primaryValue="84 COP%"
            secondaryMetrics={[{ label: "Chiller kW", value: "420 kW" }, { label: "Zone Temp", value: "22°C avg" }]}
            color="#f97316"
          />
          <PillarStatusCard
            href="/dashboard/pillar/compressed-air"
            pillar="Compressed Air"
            icon={<Gauge className="w-4 h-4" />}
            status="WARNING"
            primaryMetric="Header Pressure"
            primaryValue="7.2 bar"
            secondaryMetrics={[{ label: "Leak Loss", value: "22%" }, { label: "Specific Power", value: "6.8 kW/m³/min" }]}
            color="#06b6d4"
          />
          <PillarStatusCard
            href="/dashboard/pillar/environment"
            pillar="Environment"
            icon={<Activity className="w-4 h-4" />}
            status="NORMAL"
            primaryMetric="PM2.5 Level"
            primaryValue="18 µg/m³"
            secondaryMetrics={[{ label: "CO₂", value: "420 ppm" }, { label: "Humidity", value: "62%" }]}
            color="#10b981"
          />
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Resource Utilization</h2>
          <span className="text-[#888888] text-xs">% of capacity / limit</span>
        </div>
        <div className="space-y-4">
          {utilizationData.map((u) => (
            <div key={u.pillar} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{u.icon}</span>
                  <span className="text-white text-sm font-medium">{u.pillar}</span>
                  <span className="text-[#888888] text-xs">{u.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold text-sm"
                    style={{ color: u.value >= 80 ? "#ef4444" : u.value >= 65 ? "#f59e0b" : "#22c55e" }}
                  >
                    {u.value}%
                  </span>
                  {u.status === "WARNING" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b20] text-[#f59e0b]">WARN</span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${u.value}%`,
                    backgroundColor: u.value >= 80 ? "#ef4444" : u.value >= 65 ? "#f59e0b" : u.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Energy Consumption Trend</h3>
              <p className="text-[#888888] text-xs">kWh actual vs. last period · 14 days</p>
            </div>
            <div className="flex items-center gap-1 text-[#22c55e] text-xs font-medium">
              <TrendingDown className="w-3 h-3" />
              <span>−3.2% vs last period</span>
            </div>
          </div>
          <TrendChart data={energyTrend} color="#e11d48" color2="#2a2a2a" label="This Period" label2="Last Period" height={180} />
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Active Alerts</h3>
            <a href="/alerts" className="text-[#e11d48] text-xs hover:underline">View all →</a>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="w-8 h-8 text-[#22c55e] mb-2" />
              <p className="text-white text-sm font-medium">All clear</p>
            </div>
          ) : (
            <div>
              {recentAlerts.map((alert) => (
                <AlertSummaryRow key={alert.id} alert={alert as any} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cost + Carbon + Site Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Daily Cost Trend</h3>
              <p className="text-[#888888] text-xs">IDR thousands · 14 days</p>
            </div>
            <DollarSign className="w-4 h-4 text-[#888888]" />
          </div>
          <TrendChart data={costTrend} color="#22c55e" label="IDR K" height={140} />
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Carbon Estimate</h3>
              <p className="text-[#888888] text-xs">Scope 2 · tCO₂e</p>
            </div>
            <a href="/dashboard/compliance" className="text-[#e11d48] text-xs hover:underline">Details →</a>
          </div>
          <div className="space-y-3 mt-2">
            {[
              { label: "Today", value: "68.4 tCO₂e", highlight: true },
              { label: "This Month", value: "1,842 tCO₂e", highlight: false },
              { label: "YTD", value: "8,204 tCO₂e", highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[#888888] text-sm">{label}</span>
                <span className={highlight ? "font-bold text-lg text-white" : "font-semibold text-white"}>{value}</span>
              </div>
            ))}
            <div className="h-px bg-[#2a2a2a]" />
            <div className="flex items-center justify-between">
              <span className="text-[#888888] text-sm">vs. Target</span>
              <span className="text-[#f59e0b] text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 4.2% over
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Site Ranking</h3>
            <a href="/sites" className="text-[#e11d48] text-xs hover:underline">View all →</a>
          </div>
          <div className="space-y-3">
            {siteData.map((site, i) => {
              const pillarCount = site.assets.reduce(
                (a, b) => { a[b.pillar] = (a[b.pillar] ?? 0) + 1; return a; },
                {} as Record<string, number>
              );
              const topPillar = Object.entries(pillarCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
              return (
                <a
                  href={`/sites/${site.id}`}
                  key={site.id}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <span className="text-[#888888] text-sm w-5 font-mono">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{site.name}</p>
                    <p className="text-[#888888] text-xs">
                      {site._count.assets} assets · {topPillar.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        i === 0
                          ? "bg-[#22c55e]"
                          : i === siteData.length - 1
                          ? "bg-[#f59e0b]"
                          : "bg-[#3b82f6]"
                      }`}
                    />
                    <ArrowUpRight className="w-3 h-3 text-[#888888]" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
