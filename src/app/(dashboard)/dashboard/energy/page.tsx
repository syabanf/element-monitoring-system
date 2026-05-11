import { prisma } from "@/lib/prisma";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TrendingDown } from "lucide-react";

function generateHourlyData(base: number, variance: number) {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    value: Math.round(base + (Math.random() - 0.5) * variance + (i >= 8 && i <= 18 ? variance * 0.5 : -variance * 0.3)),
    value2: Math.round((base * 0.15) + (Math.random() - 0.5) * (variance * 0.15)),
  }));
}

function generateDailyData(base: number, variance: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(label => ({
    label,
    value: Math.round(base + (Math.random() - 0.5) * variance),
    value2: Math.round(base * 0.85 + (Math.random() - 0.5) * variance * 0.85),
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

  // Suppress unused variable warning
  void electricitySensors;
  void sites;

  const hourlyData = generateHourlyData(2850, 800);
  const weeklyData = generateDailyData(142500, 30000);

  const meters = [
    { name: "Main Incomer", site: "Jakarta Industrial Park", kWh: 62840, demand: 1240, pf: 0.91, trend: -2.1 },
    { name: "Production Line A", site: "Jakarta Industrial Park", kWh: 28420, demand: 580, pf: 0.85, trend: +3.4 },
    { name: "Cooling Tower", site: "Surabaya Plant", kWh: 18650, demand: 380, pf: 0.89, trend: -1.2 },
    { name: "Compressor Room", site: "Surabaya Plant", kWh: 14280, demand: 295, pf: 0.82, trend: +5.8 },
    { name: "Office Block", site: "Bandung Factory", kWh: 9840, demand: 210, pf: 0.94, trend: -0.8 },
    { name: "Warehouse", site: "Bandung Factory", kWh: 8470, demand: 142, pf: 0.88, trend: +1.1 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Energy Manager Dashboard</h1>
        <p className="text-[#888888] text-sm mt-0.5">Electricity consumption analysis and optimization</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Today&apos;s Consumption</p>
          <p className="text-white text-2xl font-bold">142,510 <span className="text-[#888888] text-base font-normal">kWh</span></p>
          <p className="text-[#22c55e] text-xs mt-1">↓ 3.2% vs yesterday</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Peak Demand</p>
          <p className="text-white text-2xl font-bold">2,847 <span className="text-[#888888] text-base font-normal">kW</span></p>
          <p className="text-[#f59e0b] text-xs mt-1">↑ Near tariff limit</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Power Factor</p>
          <p className="text-white text-2xl font-bold">0.87 <span className="text-[#888888] text-base font-normal">avg</span></p>
          <p className="text-[#f59e0b] text-xs mt-1">Target: &gt; 0.90</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Energy Cost</p>
          <p className="text-white text-2xl font-bold">IDR 24.8M</p>
          <p className="text-[#22c55e] text-xs mt-1">↓ 1.8% vs target</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Today&apos;s Load Profile</h3>
              <p className="text-[#888888] text-xs">kW by hour (actual vs. baseline)</p>
            </div>
          </div>
          <TrendChart data={hourlyData} color="#e11d48" color2="#2a2a2a" label="Actual kW" label2="Baseline kW" height={200} />
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Weekly Consumption</h3>
              <p className="text-[#888888] text-xs">kWh by day (this week vs. last week)</p>
            </div>
          </div>
          <TrendChart data={weeklyData} color="#f59e0b" color2="#3b82f6" label="This Week" label2="Last Week" height={200} />
        </div>
      </div>

      {/* Sub-meter table */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h3 className="text-white font-semibold">Sub-Meter Breakdown</h3>
          <div className="flex items-center gap-1 text-[#22c55e] text-xs">
            <TrendingDown className="w-3 h-3" />
            <span>ISO 50001 monitoring active</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-5 py-3 font-medium">Meter / Asset</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Site</th>
                <th className="text-right text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">kWh Today</th>
                <th className="text-right text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Peak kW</th>
                <th className="text-right text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Power Factor</th>
                <th className="text-right text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {meters.map((m) => (
                <tr key={m.name} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-[#888888]">{m.site}</td>
                  <td className="px-4 py-3 text-right text-white">{m.kWh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white">{m.demand}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={m.pf >= 0.90 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>{m.pf}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={m.trend <= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                      {m.trend > 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
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
