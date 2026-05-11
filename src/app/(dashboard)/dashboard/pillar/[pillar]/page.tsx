import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Zap, Droplets, Wind, Thermometer, FlaskConical, Gauge,
  Activity, AlertTriangle, ArrowLeft, CheckCircle
} from "lucide-react";
import { TrendChart } from "@/components/dashboard/TrendChart";

type PillarSlug = "electricity" | "water" | "wastewater" | "gas-air" | "environment" | "thermal-hvac" | "compressed-air";

interface PillarKpi {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  status?: "ok" | "warning" | "danger";
}

interface PillarParameter {
  label: string;
  value: string;
  limit?: string;
  status: "ok" | "warning" | "danger";
}

interface PillarConfig {
  title: string;
  description: string;
  color: string;
  dbPillar: string;
  icon: React.ReactNode;
  kpis: PillarKpi[];
  parameters: PillarParameter[];
  complianceNote: string;
}

const PILLAR_CONFIG: Record<PillarSlug, PillarConfig> = {
  electricity: {
    title: "Electricity Monitoring",
    description: "Sub-meter feeders, PDUs, lighting circuits, kWh, kVAR, power factor, demand peaks",
    color: "#f59e0b",
    dbPillar: "ELECTRICITY",
    icon: <Zap className="w-5 h-5" />,
    kpis: [
      { label: "Today's Consumption", value: "142,500", unit: "kWh", trend: -3.2, status: "ok" },
      { label: "Peak Demand", value: "2,847", unit: "kW", trend: 1.4, status: "warning" },
      { label: "Power Factor", value: "0.87", trend: 0, status: "warning" },
      { label: "Total Cost Today", value: "IDR 24.8M", trend: -1.8, status: "ok" },
      { label: "Active Sub-meters", value: "24", unit: "meters", status: "ok" },
      { label: "THD Average", value: "4.2", unit: "%", trend: 0.3, status: "ok" },
    ],
    parameters: [
      { label: "Voltage L1-N", value: "228 V", limit: "220–240 V", status: "ok" },
      { label: "Voltage L2-N", value: "231 V", limit: "220–240 V", status: "ok" },
      { label: "Voltage L3-N", value: "226 V", limit: "220–240 V", status: "ok" },
      { label: "Current L1", value: "412 A", limit: "< 500 A", status: "ok" },
      { label: "Frequency", value: "49.98 Hz", limit: "49.5–50.5 Hz", status: "ok" },
      { label: "Power Factor", value: "0.87", limit: "> 0.90", status: "warning" },
      { label: "Peak Demand", value: "2,847 kW", limit: "< 3,000 kW tariff", status: "warning" },
      { label: "Harmonic Distortion", value: "4.2%", limit: "< 5% THD", status: "ok" },
    ],
    complianceNote: "ISO 50001 monitoring active. Peak demand approaching 95% of tariff threshold — consider load shifting.",
  },
  water: {
    title: "Water Monitoring",
    description: "Smart meters, zone meters, process lines, flow, pressure, leak detection, NRW tracking",
    color: "#3b82f6",
    dbPillar: "WATER",
    icon: <Droplets className="w-5 h-5" />,
    kpis: [
      { label: "Today's Consumption", value: "8,420", unit: "m³", trend: -1.2, status: "ok" },
      { label: "Current Flow Rate", value: "142", unit: "m³/h", trend: 0.8, status: "ok" },
      { label: "System Pressure", value: "4.2", unit: "bar", trend: 0, status: "ok" },
      { label: "NRW Rate", value: "4.2", unit: "%", trend: -0.5, status: "ok" },
      { label: "Active Meters", value: "18", unit: "meters", status: "ok" },
      { label: "Leak Risk Score", value: "LOW", status: "ok" },
    ],
    parameters: [
      { label: "Inlet Flow Rate", value: "142 m³/h", limit: "< 200 m³/h", status: "ok" },
      { label: "System Pressure", value: "4.2 bar", limit: "3.5–6.0 bar", status: "ok" },
      { label: "Water Temperature", value: "28°C", limit: "< 40°C", status: "ok" },
      { label: "NRW Rate", value: "4.2%", limit: "< 5% target", status: "ok" },
      { label: "Daily Volume", value: "8,420 m³", limit: "< 12,000 m³/day quota", status: "ok" },
      { label: "Cooling Tower Makeup", value: "320 m³", limit: "< 400 m³/day", status: "ok" },
    ],
    complianceNote: "Non-revenue water at 4.2% — below 5% target. Continuous-flow alarm active on all critical lines.",
  },
  wastewater: {
    title: "Wastewater Monitoring",
    description: "pH, TSS, COD, flow, conductivity, effluent streams, automated compliance reporting",
    color: "#8b5cf6",
    dbPillar: "WASTEWATER",
    icon: <FlaskConical className="w-5 h-5" />,
    kpis: [
      { label: "pH Level", value: "7.8", trend: 0.2, status: "warning" },
      { label: "COD", value: "180", unit: "mg/L", trend: 5.1, status: "warning" },
      { label: "TSS", value: "42", unit: "mg/L", trend: -2.3, status: "ok" },
      { label: "Discharge Flow", value: "48", unit: "m³/h", trend: 1.0, status: "ok" },
      { label: "Conductivity", value: "1,240", unit: "µS/cm", trend: 0, status: "ok" },
      { label: "Turbidity", value: "8.4", unit: "NTU", trend: 1.2, status: "ok" },
    ],
    parameters: [
      { label: "pH", value: "7.8", limit: "6.5–8.5 (permit)", status: "warning" },
      { label: "COD", value: "180 mg/L", limit: "< 200 mg/L (permit)", status: "warning" },
      { label: "TSS", value: "42 mg/L", limit: "< 100 mg/L (permit)", status: "ok" },
      { label: "BOD₅", value: "62 mg/L", limit: "< 80 mg/L (permit)", status: "ok" },
      { label: "Conductivity", value: "1,240 µS/cm", limit: "< 2,500 µS/cm", status: "ok" },
      { label: "Turbidity", value: "8.4 NTU", limit: "< 50 NTU", status: "ok" },
      { label: "Flow Rate", value: "48 m³/h", limit: "< 60 m³/h (permit)", status: "ok" },
    ],
    complianceNote: "⚠ COD at 180 mg/L — approaching 200 mg/L permit limit. pH 7.8 within range. BAPEDAL reporting due monthly.",
  },
  "gas-air": {
    title: "Gas & Air Monitoring",
    description: "Methane, LEL, CO, CO₂, H₂S, combustion efficiency, plume tracking, LDAR compliance",
    color: "#22c55e",
    dbPillar: "GAS_AIR",
    icon: <Wind className="w-5 h-5" />,
    kpis: [
      { label: "LEL Level", value: "2.1", unit: "%", trend: 0.1, status: "ok" },
      { label: "CO Concentration", value: "12", unit: "ppm", trend: -1.0, status: "ok" },
      { label: "CH₄ Level", value: "0.8", unit: "%", trend: 0.05, status: "ok" },
      { label: "H₂S Level", value: "1.4", unit: "ppm", trend: 0, status: "ok" },
      { label: "Gas Detectors Active", value: "32", unit: "sensors", status: "ok" },
      { label: "Last Calibration", value: "8 days ago", status: "ok" },
    ],
    parameters: [
      { label: "LEL (CH₄)", value: "2.1%", limit: "< 10% LEL alarm", status: "ok" },
      { label: "CO", value: "12 ppm", limit: "< 25 ppm TWA (OSHA)", status: "ok" },
      { label: "H₂S", value: "1.4 ppm", limit: "< 1.0 ppm TWA (OSHA)", status: "warning" },
      { label: "O₂ Level", value: "20.8%", limit: "19.5–23.5%", status: "ok" },
      { label: "CH₄", value: "0.8%", limit: "< 1% (LFL alarm)", status: "ok" },
      { label: "Combustion O₂", value: "3.2%", limit: "2–4% (optimal)", status: "ok" },
      { label: "Flue Temp", value: "284°C", limit: "< 350°C", status: "ok" },
    ],
    complianceNote: "⚠ H₂S at 1.4 ppm — slightly above 1.0 ppm TWA. Plume dispersion model active. Next LDAR survey: 2026-09-15.",
  },
  environment: {
    title: "Environmental Monitoring",
    description: "Temperature, humidity, PM2.5, CO₂, noise, indoor air quality, ESG indicators",
    color: "#10b981",
    dbPillar: "ENVIRONMENT",
    icon: <Activity className="w-5 h-5" />,
    kpis: [
      { label: "PM2.5", value: "18", unit: "µg/m³", trend: -2.1, status: "ok" },
      { label: "CO₂ (Indoor)", value: "420", unit: "ppm", trend: 5.0, status: "ok" },
      { label: "Avg Temperature", value: "28.4", unit: "°C", trend: 0.3, status: "ok" },
      { label: "Avg Humidity", value: "62", unit: "%", trend: 1.2, status: "ok" },
      { label: "Noise Level", value: "72", unit: "dB(A)", trend: 0, status: "ok" },
      { label: "Air Quality Index", value: "GOOD", status: "ok" },
    ],
    parameters: [
      { label: "PM2.5", value: "18 µg/m³", limit: "< 35 µg/m³ (24h avg)", status: "ok" },
      { label: "PM10", value: "32 µg/m³", limit: "< 75 µg/m³", status: "ok" },
      { label: "CO₂ Indoor", value: "420 ppm", limit: "< 1,000 ppm (ASHRAE)", status: "ok" },
      { label: "VOC Total", value: "0.12 mg/m³", limit: "< 0.3 mg/m³", status: "ok" },
      { label: "Noise (Day)", value: "72 dB(A)", limit: "< 85 dB(A) (OSHA)", status: "ok" },
      { label: "Temperature", value: "28.4°C", limit: "18–30°C (comfort)", status: "ok" },
      { label: "Relative Humidity", value: "62%", limit: "40–70%", status: "ok" },
    ],
    complianceNote: "All environmental parameters within regulatory limits. ESG reporting data is being collected. ISO 14001 readiness: 87%.",
  },
  "thermal-hvac": {
    title: "Thermal & HVAC Monitoring",
    description: "Zone temperatures, chiller/boiler kW, AHU airflow, refrigerant pressures, COP, occupancy",
    color: "#f97316",
    dbPillar: "THERMAL_HVAC",
    icon: <Thermometer className="w-5 h-5" />,
    kpis: [
      { label: "HVAC Efficiency (COP)", value: "84", unit: "%", trend: -1.0, status: "ok" },
      { label: "Chiller Power", value: "420", unit: "kW", trend: 2.4, status: "ok" },
      { label: "Zone Avg Temp", value: "22.4", unit: "°C", trend: 0.2, status: "ok" },
      { label: "AHU Airflow", value: "28,400", unit: "m³/h", trend: 0, status: "ok" },
      { label: "Cooling Load", value: "1,240", unit: "kWh", trend: 1.8, status: "ok" },
      { label: "Active AHUs", value: "8", unit: "units", status: "ok" },
    ],
    parameters: [
      { label: "Chiller COP", value: "3.84", limit: "> 3.5 (design)", status: "ok" },
      { label: "Supply Air Temp", value: "14.2°C", limit: "12–16°C", status: "ok" },
      { label: "Return Air Temp", value: "24.8°C", limit: "< 27°C", status: "ok" },
      { label: "Chilled Water Δt", value: "8.6°C", limit: "7–10°C", status: "ok" },
      { label: "Zone Setpoint", value: "22°C", limit: "21–24°C (comfort)", status: "ok" },
      { label: "Filter Pressure Drop", value: "42 Pa", limit: "< 80 Pa", status: "ok" },
      { label: "Damper Position", value: "38%", limit: "Variable (DCV)", status: "ok" },
    ],
    complianceNote: "Condition-based maintenance active. Chiller COP 3.84 — above minimum 3.5 design. Next service: 2026-06-01.",
  },
  "compressed-air": {
    title: "Compressed Air & Process Gases",
    description: "Compressor kW, m³/min, header pressure, dew point, leak detection, specific power",
    color: "#06b6d4",
    dbPillar: "COMPRESSED_AIR",
    icon: <Gauge className="w-5 h-5" />,
    kpis: [
      { label: "Header Pressure", value: "7.2", unit: "bar", trend: -0.3, status: "warning" },
      { label: "Compressor Power", value: "184", unit: "kW", trend: 2.1, status: "ok" },
      { label: "Flow Rate", value: "28.4", unit: "m³/min", trend: 0, status: "ok" },
      { label: "Estimated Leak Loss", value: "22", unit: "%", trend: 1.0, status: "warning" },
      { label: "Specific Power", value: "6.8", unit: "kW/m³/min", trend: 0.4, status: "warning" },
      { label: "Dew Point", value: "−8", unit: "°C", trend: 0, status: "ok" },
    ],
    parameters: [
      { label: "Header Pressure", value: "7.2 bar", limit: "7.0–8.0 bar", status: "warning" },
      { label: "Compressor Load", value: "84%", limit: "< 90%", status: "ok" },
      { label: "Dew Point", value: "−8°C", limit: "< −10°C (ISO 8573-1)", status: "warning" },
      { label: "Oil Carryover", value: "0.08 mg/m³", limit: "< 0.1 mg/m³ (Class 2)", status: "ok" },
      { label: "Estimated Leakage", value: "22%", limit: "< 10% target", status: "danger" },
      { label: "Specific Power", value: "6.8 kW/m³/min", limit: "< 6.5 benchmark", status: "warning" },
    ],
    complianceNote: "⚠ Leak loss at 22% — significantly above 10% target. Ultrasonic survey scheduled 2026-05-20. Reducing header to 7.0 bar could save 7% energy.",
  },
};

const statusStyle = {
  ok: { color: "#22c55e", bg: "#22c55e20" },
  warning: { color: "#f59e0b", bg: "#f59e0b20" },
  danger: { color: "#ef4444", bg: "#ef444420" },
};

function seededRand(seed: number, base: number, variance: number) {
  const x = Math.sin(seed) * 10000;
  return Math.round(base + (x - Math.floor(x) - 0.5) * variance);
}

export default async function PillarDrilldownPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const slug = pillar as PillarSlug;
  const config = PILLAR_CONFIG[slug];

  if (!config) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbPillar = config.dbPillar as any;

  const [assets, activeAlerts, allAlerts] = await Promise.all([
    prisma.asset.findMany({
      where: { pillar: dbPillar, status: "ACTIVE" },
      include: {
        site: { select: { name: true } },
        sensors: { select: { id: true, name: true, status: true, lastValue: true, unit: true, metricName: true, lastReadingAt: true } },
        _count: { select: { alerts: true } },
      },
      orderBy: { site: { name: "asc" } },
    }),
    prisma.alert.count({
      where: { asset: { pillar: dbPillar }, status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } },
    }),
    prisma.alert.findMany({
      where: { asset: { pillar: dbPillar } },
      include: { asset: { select: { name: true, site: { select: { name: true } } } } },
      orderBy: { openedAt: "desc" },
      take: 6,
    }),
  ]);

  const trendData = Array.from({ length: 14 }, (_, i) => ({
    label: `D-${13 - i}`,
    value: seededRand(i * 17 + config.color.charCodeAt(1), 100, 40),
    value2: seededRand(i * 17 + config.color.charCodeAt(2), 95, 35),
  }));

  const totalSensors = assets.flatMap((a) => a.sensors).length;
  const onlineSensors = assets.flatMap((a) => a.sensors).filter((s) => s.status === "ONLINE").length;

  const severityConfig: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: "#ef444420", text: "#ef4444" },
    HIGH: { bg: "#f59e0b20", text: "#f59e0b" },
    MEDIUM: { bg: "#3b82f620", text: "#3b82f6" },
    LOW: { bg: "#88888820", text: "#888888" },
    INFO: { bg: "#6366f120", text: "#6366f1" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="space-y-3">
        <a href="/dashboard/executive" className="inline-flex items-center gap-1.5 text-[#888888] hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Executive Dashboard
        </a>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
              {config.icon}
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">{config.title}</h1>
              <p className="text-[#888888] text-sm mt-0.5">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#888888]">
              {assets.length} assets
            </span>
            <span className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#888888]">
              {onlineSensors}/{totalSensors} sensors
            </span>
            {activeAlerts > 0 && (
              <span className="bg-[#ef444415] border border-[#ef444430] rounded-lg px-3 py-1.5 text-[#ef4444]">
                {activeAlerts} active alert{activeAlerts > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {config.kpis.map((kpi) => {
          const s = statusStyle[kpi.status ?? "ok"];
          return (
            <div key={kpi.label} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 space-y-2 hover:border-[#3a3a3a] transition-colors">
              <p className="text-[#888888] text-[10px] uppercase tracking-wider leading-tight">{kpi.label}</p>
              <div>
                <span className="text-white text-xl font-bold">{kpi.value}</span>
                {kpi.unit && <span className="text-[#888888] text-xs ml-1">{kpi.unit}</span>}
              </div>
              {kpi.trend !== undefined && (
                <span className={`text-xs font-medium ${kpi.trend > 0 ? "text-[#ef4444]" : kpi.trend < 0 ? "text-[#22c55e]" : "text-[#888888]"}`}>
                  {kpi.trend > 0 ? "↑" : kpi.trend < 0 ? "↓" : "→"} {Math.abs(kpi.trend)}%
                </span>
              )}
              {kpi.status && kpi.status !== "ok" && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">14-Day Trend</h3>
              <p className="text-[#888888] text-xs">Normalized index — actual vs. baseline</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#888888]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                Actual
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                Baseline
              </div>
            </div>
          </div>
          <TrendChart data={trendData} color={config.color} color2="#444444" label="Actual" label2="Baseline" height={200} />
        </div>

        {/* Parameter table */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="p-4 border-b border-[#2a2a2a]">
            <h3 className="text-white font-semibold">Live Parameters</h3>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {config.parameters.map((p) => {
              const s = statusStyle[p.status];
              return (
                <div key={p.label} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-white text-xs font-medium">{p.label}</p>
                    {p.limit && <p className="text-[#888888] text-[10px]">Limit: {p.limit}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-mono font-bold">{p.value}</span>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compliance note */}
      <div className="bg-[#111111] border rounded-xl p-4" style={{ borderColor: `${config.color}30` }}>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
            <AlertTriangle className="w-3 h-3" />
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-0.5">Compliance & Operations Note</p>
            <p className="text-[#888888] text-sm">{config.complianceNote}</p>
          </div>
        </div>
      </div>

      {/* Assets + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
            <h3 className="text-white font-semibold">Assets ({assets.length})</h3>
            <a href="/assets" className="text-[#e11d48] text-xs hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-[#1a1a1a] max-h-72 overflow-y-auto">
            {assets.slice(0, 10).map((asset) => {
              const onlineCount = asset.sensors.filter((s) => s.status === "ONLINE").length;
              return (
                <div key={asset.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1a1a1a] transition-colors">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        onlineCount === asset.sensors.length
                          ? "#22c55e"
                          : onlineCount > 0
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-[#888888] text-xs">
                      {asset.site.name} · {asset.sensors.length} sensor{asset.sensors.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#888888] text-xs">{onlineCount}/{asset.sensors.length} online</p>
                    {asset._count.alerts > 0 && (
                      <p className="text-[#ef4444] text-xs">
                        {asset._count.alerts} alert{asset._count.alerts > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {assets.length === 0 && (
              <div className="py-8 text-center text-[#888888] text-sm">No assets found for this pillar</div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
            <h3 className="text-white font-semibold">Recent Alerts</h3>
            <a href="/alerts" className="text-[#e11d48] text-xs hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {allAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <CheckCircle className="w-8 h-8 text-[#22c55e] mb-2" />
                <p className="text-white text-sm font-medium">No alerts</p>
                <p className="text-[#888888] text-xs">This pillar is operating normally</p>
              </div>
            ) : (
              allAlerts.map((alert) => {
                const sc = severityConfig[alert.severity] ?? severityConfig.INFO;
                return (
                  <a
                    key={alert.id}
                    href={`/alerts/${alert.id}`}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-[#1a1a1a] transition-colors block"
                  >
                    <span
                      className="text-xs px-2 py-0.5 rounded mt-0.5 font-medium flex-shrink-0"
                      style={{ backgroundColor: sc.bg, color: sc.text }}
                    >
                      {alert.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{alert.title}</p>
                      <p className="text-[#888888] text-xs">
                        {alert.asset.site.name} · {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Live sensor readings */}
      {assets.flatMap((a) => a.sensors).length > 0 && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
            <h3 className="text-white font-semibold">Sensor Readings</h3>
            <a href="/telemetry" className="text-[#e11d48] text-xs hover:underline">Live telemetry →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {["Sensor", "Asset", "Metric", "Last Value", "Last Read", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#888888] text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {assets
                  .flatMap((a) => a.sensors.map((s) => ({ ...s, assetName: a.name })))
                  .slice(0, 15)
                  .map((sensor) => {
                    const isOnline = sensor.status === "ONLINE";
                    return (
                      <tr key={sensor.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-5 py-2.5 text-white text-xs font-medium">{sensor.name}</td>
                        <td className="px-5 py-2.5 text-[#888888] text-xs">{sensor.assetName}</td>
                        <td className="px-5 py-2.5 text-[#888888] text-xs">{sensor.metricName}</td>
                        <td className="px-5 py-2.5 font-mono text-xs" style={{ color: config.color }}>
                          {sensor.lastValue !== null ? `${sensor.lastValue?.toFixed(2)} ${sensor.unit}` : "—"}
                        </td>
                        <td className="px-5 py-2.5 text-[#888888] text-xs">
                          {sensor.lastReadingAt
                            ? formatDistanceToNow(new Date(sensor.lastReadingAt), { addSuffix: true })
                            : "—"}
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: isOnline ? "#22c55e" : "#ef4444" }}
                            />
                            <span className="text-xs" style={{ color: isOnline ? "#22c55e" : "#ef4444" }}>
                              {sensor.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
