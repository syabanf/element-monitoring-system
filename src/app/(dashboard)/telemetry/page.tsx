import { prisma } from "@/lib/prisma";

const pillarColors: Record<string, string> = {
  ELECTRICITY: "#f59e0b", WATER: "#3b82f6", WASTEWATER: "#8b5cf6",
  GAS_AIR: "#22c55e", ENVIRONMENT: "#06b6d4", THERMAL_HVAC: "#f97316", COMPRESSED_AIR: "#0891b2",
};

export default async function TelemetryPage() {
  const sensors = await prisma.sensor.findMany({
    where: { status: "ONLINE" },
    include: {
      asset: {
        select: {
          name: true,
          pillar: true,
          site: { select: { name: true } },
        },
      },
    },
    orderBy: { lastReadingAt: "desc" },
    take: 80,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Live Telemetry</h1>
          <p className="text-[#888888] text-sm mt-0.5">{sensors.length} online sensors</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#888888] text-sm">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sensors.map((sensor) => {
          const color = pillarColors[sensor.asset.pillar] ?? "#888888";
          return (
            <div key={sensor.id} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 space-y-2 hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-xs text-[#888888] truncate ml-2">{sensor.asset.site.name}</span>
              </div>
              <div>
                <p className="text-[#888888] text-xs truncate">{sensor.asset.name}</p>
                <p className="text-white text-xs font-medium truncate">{sensor.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#888888]">{sensor.metricName}</p>
                <p className="font-bold text-lg" style={{ color }}>
                  {sensor.lastValue !== null ? sensor.lastValue?.toFixed(2) : "—"}
                  <span className="text-[#888888] text-xs font-normal ml-1">{sensor.unit}</span>
                </p>
              </div>
              <p className="text-[#888888] text-[10px]">
                {sensor.lastReadingAt ? new Date(sensor.lastReadingAt).toLocaleTimeString() : "No data"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
