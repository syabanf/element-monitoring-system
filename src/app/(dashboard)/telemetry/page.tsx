import { prisma } from "@/lib/prisma";

const pillarColors: Record<string, { text: string; dot: string }> = {
  ELECTRICITY: { text: "#B45309", dot: "#B45309" },
  WATER:       { text: "#1E5FA8", dot: "#1E5FA8" },
  WASTEWATER:  { text: "#6D28D9", dot: "#6D28D9" },
  GAS_AIR:     { text: "#166534", dot: "#166534" },
  ENVIRONMENT: { text: "#0E7490", dot: "#0E7490" },
  THERMAL_HVAC:{ text: "#C2410C", dot: "#C2410C" },
  COMPRESSED_AIR: { text: "#0E7490", dot: "#0E7490" },
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
          <h1 className="text-[#1C1714] text-2xl font-bold">Live Telemetry</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">{sensors.length} online sensors</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E5DDD0] rounded-lg px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
          <span className="text-[#5C5248] text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sensors.map((sensor) => {
          const pc = pillarColors[sensor.asset.pillar] ?? { text: "#9C9285", dot: "#9C9285" };
          return (
            <div key={sensor.id} className="bg-white border border-[#E5DDD0] rounded-xl p-4 space-y-2 hover:shadow-md hover:border-[#D4C8B8] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-2 h-2 rounded-full bg-[#166534]" />
                <span className="text-xs text-[#9C9285] truncate ml-2">{sensor.asset.site.name}</span>
              </div>
              <div>
                <p className="text-[#9C9285] text-xs truncate">{sensor.asset.name}</p>
                <p className="text-[#1C1714] text-xs font-semibold truncate">{sensor.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#9C9285]">{sensor.metricName}</p>
                <p className="font-bold text-lg" style={{ color: pc.text }}>
                  {sensor.lastValue !== null ? sensor.lastValue?.toFixed(2) : "—"}
                  <span className="text-[#9C9285] text-xs font-normal ml-1">{sensor.unit}</span>
                </p>
              </div>
              <p className="text-[#9C9285] text-[10px]">
                {sensor.lastReadingAt ? new Date(sensor.lastReadingAt).toLocaleTimeString() : "No data"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
