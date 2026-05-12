import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { LucideProps } from "lucide-react";
import {
  Zap, Droplets, Wind, Thermometer, FlaskConical, Gauge, Activity,
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Leaf, MapPin,
  CheckCircle, ArrowUpRight, Wrench,
} from "lucide-react";

type IconComponent = React.FC<LucideProps>;
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PillarStatusCard } from "@/components/dashboard/PillarStatusCard";
import { AlertSummaryRow } from "@/components/dashboard/AlertSummaryRow";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SiteBarChart } from "@/components/dashboard/SiteBarChart";
import { SensorHealthRing } from "@/components/dashboard/SensorHealthRing";

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

const utilizationData: Array<{ pillar: string; icon: IconComponent; value: number; label: string; color: string }> = [
  { pillar: "Electricity",    icon: Zap,          value: 71, label: "2,847 / 4,000 kW",       color: "#B45309" },
  { pillar: "Water",          icon: Droplets,     value: 56, label: "8,420 / 15,000 m³",      color: "#1E5FA8" },
  { pillar: "Wastewater",     icon: FlaskConical, value: 78, label: "180 / 230 mg/L COD",     color: "#7C3AED" },
  { pillar: "Gas / Air",      icon: Wind,         value: 21, label: "2.1% / 10% LEL",         color: "#166534" },
  { pillar: "HVAC",           icon: Thermometer,  value: 84, label: "Efficiency 84%",          color: "#B8901A" },
  { pillar: "Compressed Air", icon: Wrench,       value: 72, label: "7.2 / 10 bar",           color: "#0E7490" },
];

export default async function ExecutiveDashboardPage() {
  await auth();

  const [totalSites, totalAssets, onlineSensors, totalSensors, offlineSensors, faultSensors, calDueSensors, openAlerts, criticalAlerts, recentAlerts, siteData] = await Promise.all([
    prisma.site.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { status: "ACTIVE" } }),
    prisma.sensor.count({ where: { status: "ONLINE" } }),
    prisma.sensor.count(),
    prisma.sensor.count({ where: { status: "OFFLINE" } }),
    prisma.sensor.count({ where: { status: "FAULT" } }),
    prisma.sensor.count({ where: { status: "CALIBRATION_DUE" } }),
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
      include: { _count: { select: { assets: true } }, assets: { select: { pillar: true }, take: 999 } },
    }),
  ]);

  const siteChartData = siteData.map(s => ({
    name: s.name,
    assets: (s._count as { assets: number }).assets,
    sensors: Math.round((s._count as { assets: number }).assets * 4.2),
    alerts: 0,
  }));

  const sensorUptime = totalSensors > 0 ? Math.round((onlineSensors / totalSensors) * 100) : 0;
  const energyTrend = generateTrendData(142500, 20000);
  const costTrend = generateTrendData(24800, 4000);

  const highlights = [
    ...(criticalAlerts > 0 ? [{ type: "danger" as const, text: `${criticalAlerts} critical alert${criticalAlerts > 1 ? "s" : ""} open`, href: "/alerts" }] : []),
    { type: "warning" as const, text: "Wastewater pH 7.8 — monitoring", href: "/dashboard/pillar/wastewater" },
    { type: "warning" as const, text: "Compressed air loss 22% — above threshold", href: "/dashboard/pillar/compressed-air" },
    { type: "ok" as const, text: "Energy −3.2% vs last week", href: "/dashboard/energy" },
    { type: "ok" as const, text: `System uptime ${sensorUptime}%`, href: "/sensors" },
    { type: "ok" as const, text: "Water NRW 4.2% — below 5% target", href: "/dashboard/pillar/water" },
  ];

  const highlightStyle = {
    danger:  { bg: "#FEF2F2", border: "#FECACA",  text: "#B91C1C", dot: "#EF4444" },
    warning: { bg: "#FFFBEB", border: "#FDE68A",  text: "#B45309", dot: "#F59E0B" },
    ok:      { bg: "#F0FDF4", border: "#BBF7D0",  text: "#166534", dot: "#22C55E" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">
            Portfolio-level operational intelligence ·{" "}
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[#166534] text-xs font-semibold">Live · Updated now</span>
        </div>
      </div>

      {/* Highlights bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {highlights.map((h, i) => {
          const s = highlightStyle[h.type];
          return (
            <a
              key={i}
              href={h.href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0"
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
        <p className="text-[#6378A0] text-[10px] uppercase tracking-widest font-bold mb-3">Operational KPIs</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/sites" className="block"><KpiCard title="Active Sites" value={totalSites} icon={<MapPin className="w-4 h-4" />} subtitle="All operational" /></a>
          <a href="/assets" className="block"><KpiCard title="Monitored Assets" value={totalAssets} icon={<Gauge className="w-4 h-4" />} subtitle={`${onlineSensors}/${totalSensors} sensors online`} /></a>
          <a href="/sensors" className="block"><KpiCard title="Sensor Uptime" value={sensorUptime} unit="%" status={sensorUptime >= 95 ? "ok" : sensorUptime >= 85 ? "warning" : "danger"} icon={<Activity className="w-4 h-4" />} subtitle={`${totalSensors - onlineSensors} offline`} /></a>
          <a href="/alerts" className="block"><KpiCard title="Open Alerts" value={openAlerts} status={criticalAlerts > 0 ? "danger" : openAlerts > 10 ? "warning" : "ok"} icon={<AlertTriangle className="w-4 h-4" />} subtitle={`${criticalAlerts} critical`} /></a>
        </div>
      </div>

      {/* KPI Row 2 — Financial & Environmental */}
      <div>
        <p className="text-[#6378A0] text-[10px] uppercase tracking-widest font-bold mb-3">Financial & Environmental</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/dashboard/energy" className="block"><KpiCard title="Energy Cost Today" value="IDR 24.8M" trend={-1.8} icon={<DollarSign className="w-4 h-4" />} subtitle="vs yesterday" /></a>
          <a href="/dashboard/pillar/water" className="block"><KpiCard title="Water Cost Today" value="IDR 3.2M" trend={0.4} icon={<Droplets className="w-4 h-4" />} subtitle="vs yesterday" /></a>
          <a href="/dashboard/compliance" className="block"><KpiCard title="Carbon Today" value="68.4" unit="tCO₂e" trend={4.2} status="warning" icon={<Leaf className="w-4 h-4" />} subtitle="↑ over target" /></a>
          <a href="/dashboard/pillar/compressed-air" className="block"><KpiCard title="Compressed Air Loss" value={22} unit="%" status="warning" icon={<Gauge className="w-4 h-4" />} subtitle="est. IDR 2.1M/day" /></a>
        </div>
      </div>

      {/* Utility Pillars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#6378A0] text-[10px] uppercase tracking-widest font-bold">Utility Pillars</p>
          <span className="text-[#6378A0] text-xs">Click a pillar to drill down →</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PillarStatusCard href="/dashboard/pillar/electricity" pillar="Electricity" icon={<Zap className="w-4 h-4" />} status="NORMAL" primaryMetric="Today's Consumption" primaryValue="142,500 kWh" secondaryMetrics={[{ label: "Peak Demand", value: "2,847 kW" }, { label: "Power Factor", value: "0.87" }]} color="#B45309" />
          <PillarStatusCard href="/dashboard/pillar/water" pillar="Water" icon={<Droplets className="w-4 h-4" />} status="NORMAL" primaryMetric="Today's Consumption" primaryValue="8,420 m³" secondaryMetrics={[{ label: "Leak Risk", value: "LOW" }, { label: "NRW Rate", value: "4.2%" }]} color="#1E5FA8" />
          <PillarStatusCard href="/dashboard/pillar/wastewater" pillar="Wastewater" icon={<FlaskConical className="w-4 h-4" />} status="WARNING" primaryMetric="pH Level" primaryValue="7.8" secondaryMetrics={[{ label: "COD", value: "180 mg/L" }, { label: "TSS", value: "42 mg/L" }]} color="#7C3AED" />
          <PillarStatusCard href="/dashboard/pillar/gas-air" pillar="Gas / Air" icon={<Wind className="w-4 h-4" />} status="NORMAL" primaryMetric="LEL Level" primaryValue="2.1%" secondaryMetrics={[{ label: "CO", value: "12 ppm" }, { label: "CH₄", value: "0.8%" }]} color="#166534" />
          <PillarStatusCard href="/dashboard/pillar/thermal-hvac" pillar="Thermal / HVAC" icon={<Thermometer className="w-4 h-4" />} status="NORMAL" primaryMetric="HVAC Efficiency" primaryValue="84 COP%" secondaryMetrics={[{ label: "Chiller kW", value: "420 kW" }, { label: "Zone Temp", value: "22°C avg" }]} color="#B8901A" />
          <PillarStatusCard href="/dashboard/pillar/compressed-air" pillar="Compressed Air" icon={<Gauge className="w-4 h-4" />} status="WARNING" primaryMetric="Header Pressure" primaryValue="7.2 bar" secondaryMetrics={[{ label: "Leak Loss", value: "22%" }, { label: "Spec. Power", value: "6.8 kW/m³/min" }]} color="#0E7490" />
          <PillarStatusCard href="/dashboard/pillar/environment" pillar="Environment" icon={<Activity className="w-4 h-4" />} status="NORMAL" primaryMetric="PM2.5 Level" primaryValue="18 µg/m³" secondaryMetrics={[{ label: "CO₂", value: "420 ppm" }, { label: "Humidity", value: "62%" }]} color="#166534" />
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[#0D1B35] font-semibold">Resource Utilization</h2>
            <p className="text-[#6378A0] text-xs mt-0.5">% of capacity / operational limit</p>
          </div>
        </div>
        <div className="space-y-4">
          {utilizationData.map((u) => {
            const pct = u.value;
            const barColor = pct >= 80 ? "#B91C1C" : pct >= 65 ? "#B45309" : u.color;
            return (
              <div key={u.pillar} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <u.icon className="w-4 h-4 flex-shrink-0" style={{ color: u.color }} />
                    <span className="text-[#0D1B35] text-sm font-semibold">{u.pillar}</span>
                    <span className="text-[#6378A0] text-xs">{u.label}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#E4EAF5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#0D1B35] font-semibold">Energy Consumption Trend</h3>
              <p className="text-[#6378A0] text-xs">kWh actual vs. last period · 14 days</p>
            </div>
            <div className="flex items-center gap-1 text-[#166534] text-xs font-semibold">
              <TrendingDown className="w-3 h-3" />
              <span>−3.2% vs last period</span>
            </div>
          </div>
          <TrendChart data={energyTrend} color="#B8901A" color2="#D9E2F0" label="This Period" label2="Last Period" height={180} />
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0D1B35] font-semibold">Active Alerts</h3>
            <a href="/alerts" className="text-[#B8901A] text-xs font-semibold hover:underline">View all →</a>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-[#22C55E]" />
              </div>
              <p className="text-[#0D1B35] text-sm font-semibold">All clear</p>
              <p className="text-[#6378A0] text-xs mt-0.5">No open alerts</p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentAlerts.map((alert) => (
                <AlertSummaryRow key={alert.id} alert={alert as any} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cost + Carbon + Site Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#0D1B35] font-semibold">Daily Cost Trend</h3>
              <p className="text-[#6378A0] text-xs">IDR thousands · 14 days</p>
            </div>
            <DollarSign className="w-4 h-4 text-[#6378A0]" />
          </div>
          <TrendChart data={costTrend} color="#B8901A" label="IDR K" height={140} />
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#0D1B35] font-semibold">Carbon Estimate</h3>
              <p className="text-[#6378A0] text-xs">Scope 2 · tCO₂e</p>
            </div>
            <a href="/dashboard/compliance" className="text-[#B8901A] text-xs font-semibold hover:underline">Details →</a>
          </div>
          <div className="space-y-3 mt-2">
            {[
              { label: "Today",      value: "68.4 tCO₂e", big: true },
              { label: "This Month", value: "1,842 tCO₂e", big: false },
              { label: "YTD",        value: "8,204 tCO₂e", big: false },
            ].map(({ label, value, big }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">{label}</span>
                <span className={big ? "font-bold text-lg text-[#0D1B35]" : "font-semibold text-[#0D1B35] text-sm"}>{value}</span>
              </div>
            ))}
            <div className="h-px bg-[#E4EAF5]" />
            <div className="flex items-center justify-between">
              <span className="text-[#6378A0] text-sm">vs. Target</span>
              <span className="text-[#B45309] text-sm font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 4.2% over
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#0D1B35] font-semibold">Site Ranking</h3>
            <a href="/sites" className="text-[#B8901A] text-xs font-semibold hover:underline">View all →</a>
          </div>
          <div className="space-y-2">
            {siteData.map((site, i) => {
              const pillarCount = (site.assets as { pillar: string }[]).reduce(
                (a, b) => { a[b.pillar] = (a[b.pillar] ?? 0) + 1; return a; },
                {} as Record<string, number>,
              );
              const topPillar = Object.entries(pillarCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
              const dotColor = i === 0 ? "#22C55E" : i === siteData.length - 1 ? "#B45309" : "#B8901A";
              return (
                <a href={`/sites/${site.id}`} key={site.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F2F5FB] transition-colors">
                  <span className="text-[#6378A0] text-sm w-5 font-bold font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0D1B35] text-sm font-semibold truncate">{site.name}</p>
                    <p className="text-[#6378A0] text-xs">{(site._count as { assets: number }).assets} assets · {topPillar.replace(/_/g, " ").toLowerCase()}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#6378A0]" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sensor Health + Site Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#0D1B35] font-semibold">Sensor Health Overview</h3>
              <p className="text-[#6378A0] text-xs mt-0.5">Fleet-wide status breakdown</p>
            </div>
            <a href="/sensors" className="text-[#B8901A] text-xs font-semibold hover:underline">View sensors →</a>
          </div>
          <SensorHealthRing online={onlineSensors} offline={offlineSensors} fault={faultSensors} calibrationDue={calDueSensors} />
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#0D1B35] font-semibold">Site Asset Coverage</h3>
              <p className="text-[#6378A0] text-xs mt-0.5">Assets & estimated sensors per site</p>
            </div>
            <a href="/sites" className="text-[#B8901A] text-xs font-semibold hover:underline">View sites →</a>
          </div>
          <SiteBarChart data={siteChartData} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#B8901A]" /><span className="text-[#6378A0] text-xs">Assets</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#D9E2F0]" /><span className="text-[#6378A0] text-xs">Sensors (est.)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
