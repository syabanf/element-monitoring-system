import { prisma } from "@/lib/prisma";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TrendingDown, TrendingUp, Zap, DollarSign, Activity, Gauge } from "lucide-react";

function generateHourlyData(base: number, variance: number) {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: Math.round(base + (Math.sin(i * 0.5) * variance * 0.5) + (i >= 8 && i <= 18 ? variance * 0.5 : -variance * 0.3)),
    value2: Math.round(base * 0.15 + (Math.sin(i * 0.4) * variance * 0.08)),
  }));
}

function generateDailyData(base: number, variance: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((label, i) => ({
    label,
    value: Math.round(base + Math.sin(i * 1.2) * variance),
    value2: Math.round(base * 0.85 + Math.sin(i * 0.9) * variance * 0.85),
  }));
}

export default async function EnergyDashboardPage() {
  const [electricitySensors, sites] = await Promise.all([
    prisma.sensor.findMany({
      where: { asset: { pillar: "ELECTRICITY" }, status: "ONLINE" },
      include: { asset: { select: { name: true, site: { select: { name: true } } } } },
      take: 12,
    }),
    prisma.site.findMany({ where: { isActive: true } }),
  ]);
  void electricitySensors; void sites;

  const hourlyData = generateHourlyData(2850, 800);
  const weeklyData = generateDailyData(142500, 30000);

  const meters = [
    { name: "Main Incomer",      site: "PLTU Suralaya",           kWh: 62840, demand: 1240, pf: 0.91, trend: -2.1 },
    { name: "Production Line A", site: "PLTU Suralaya",           kWh: 28420, demand: 580,  pf: 0.85, trend: +3.4 },
    { name: "Cooling Tower",     site: "Kilang Pertamina Balongan",kWh: 18650, demand: 380,  pf: 0.89, trend: -1.2 },
    { name: "Compressor Room",   site: "Kilang Pertamina Balongan",kWh: 14280, demand: 295,  pf: 0.82, trend: +5.8 },
    { name: "Office Block",      site: "Kawasan Industri MM2100",  kWh: 9840,  demand: 210,  pf: 0.94, trend: -0.8 },
    { name: "Warehouse",         site: "Kawasan Industri MM2100",  kWh: 8470,  demand: 142,  pf: 0.88, trend: +1.1 },
  ];

  const kpis = [
    { label: "Today's Consumption", value: "142,510", unit: "kWh", note: "↓ 3.2% vs yesterday", noteOk: true,  icon: Zap },
    { label: "Peak Demand",         value: "2,847",   unit: "kW",  note: "Near tariff limit",   noteOk: false, icon: Gauge },
    { label: "Power Factor",        value: "0.87",    unit: "avg", note: "Target: > 0.90",       noteOk: false, icon: Activity },
    { label: "Energy Cost",         value: "IDR 24.8M",            note: "↓ 1.8% vs target",    noteOk: true,  icon: DollarSign },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1C1714] text-2xl font-bold">Energy Dashboard</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">Electricity consumption analysis · ISO 50001 monitoring active</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full">
          <TrendingDown className="w-3.5 h-3.5 text-[#166534]" />
          <span className="text-[#166534] text-xs font-semibold">−3.2% vs last week</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, unit, note, noteOk, icon: Icon }) => (
          <div key={label} className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#B8901A]" />
              </div>
            </div>
            <p className="text-[#1C1714] text-2xl font-bold leading-none">
              {value}
              {unit && <span className="text-[#9C9285] text-sm font-normal ml-1">{unit}</span>}
            </p>
            <p className={`text-xs mt-2 font-medium ${noteOk ? "text-[#166534]" : "text-[#B45309]"}`}>{note}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1C1714] font-semibold">Today&apos;s Load Profile</h3>
              <p className="text-[#9C9285] text-xs">kW by hour · actual vs baseline</p>
            </div>
          </div>
          <TrendChart data={hourlyData} color="#B8901A" color2="#E5DDD0" label="Actual kW" label2="Baseline kW" height={200} />
        </div>
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[#1C1714] font-semibold">Weekly Consumption</h3>
              <p className="text-[#9C9285] text-xs">kWh by day · this week vs last week</p>
            </div>
          </div>
          <TrendChart data={weeklyData} color="#B8901A" color2="#1E5FA8" label="This Week" label2="Last Week" height={200} />
        </div>
      </div>

      {/* Sub-meter table */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8E0] bg-[#F5F3EE]">
          <h3 className="text-[#1C1714] font-semibold">Sub-Meter Breakdown</h3>
          <div className="flex items-center gap-1.5 text-[#166534] text-xs font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>ISO 50001 monitoring active</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDE8E0]">
                {["Meter / Asset", "Site", "kWh Today", "Peak kW", "Power Factor", "Trend"].map((h, i) => (
                  <th key={h} className={`text-[#9C9285] text-xs font-bold uppercase tracking-wider px-5 py-3 ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meters.map((m) => (
                <tr key={m.name} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                  <td className="px-5 py-3.5 text-[#1C1714] font-semibold">{m.name}</td>
                  <td className="px-5 py-3.5 text-[#9C9285] text-sm">{m.site}</td>
                  <td className="px-5 py-3.5 text-right text-[#1C1714] font-medium">{m.kWh.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[#1C1714]">{m.demand}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold ${m.pf >= 0.90 ? "text-[#166534]" : "text-[#B45309]"}`}>{m.pf}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-xs font-bold flex items-center justify-end gap-1 ${m.trend <= 0 ? "text-[#166534]" : "text-[#B91C1C]"}`}>
                      {m.trend <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {Math.abs(m.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
