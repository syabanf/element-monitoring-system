import { prisma } from "@/lib/prisma";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE: { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  OFFLINE: { bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
  FAULT: { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  CALIBRATION_DUE: { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
};

export default async function SensorsPage() {
  const sensors = await prisma.sensor.findMany({
    include: {
      asset: {
        select: {
          name: true,
          pillar: true,
          site: { select: { name: true } },
        },
      },
      gateway: { select: { name: true } },
    },
    orderBy: [{ asset: { site: { name: "asc" } } }, { name: "asc" }],
    take: 200,
  });

  const onlineCount = sensors.filter(s => s.status === "ONLINE").length;
  const offlineCount = sensors.filter(s => s.status === "OFFLINE").length;
  const faultCount = sensors.filter(s => s.status === "FAULT").length;
  const calDueCount = sensors.filter(s => s.status === "CALIBRATION_DUE").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#1C1714] text-2xl font-bold">Sensor Registry</h1>
        <p className="text-[#9C9285] text-sm mt-0.5">{sensors.length} sensors across all sites</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Online", count: onlineCount, bg: "#F0FDF4", text: "#166534", dot: "#166534" },
          { label: "Offline", count: offlineCount, bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
          { label: "Fault", count: faultCount, bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
          { label: "Calibration Due", count: calDueCount, bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
        ].map(({ label, count, bg, text, dot }) => (
          <div key={label} className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
            <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
              <p className="text-[#1C1714] text-2xl font-bold" style={{ color: text }}>{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor table */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F3EE] border-b border-[#E5DDD0]">
                {["Sensor", "Asset / Site", "Metric", "Unit", "Protocol", "Gateway", "Last Value", "Last Read", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#9C9285] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => {
                const sc = statusConfig[sensor.status] ?? statusConfig.OFFLINE;
                return (
                  <tr key={sensor.id} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <p className="text-[#1C1714] text-sm font-medium">{sensor.name}</p>
                      <p className="text-[#9C9285] text-xs">{sensor.sensorType}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#1C1714] text-sm">{sensor.asset.name}</p>
                      <p className="text-[#9C9285] text-xs">{sensor.asset.site.name}</p>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{sensor.metricName}</td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{sensor.unit}</td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{sensor.protocol}</td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{sensor.gateway?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-[#1C1714] text-sm font-mono font-medium">
                      {sensor.lastValue !== null ? `${sensor.lastValue?.toFixed(2)} ${sensor.unit}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-[#9C9285] text-xs">
                      {sensor.lastReadingAt ? new Date(sensor.lastReadingAt).toLocaleTimeString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                        <span className="text-xs font-medium" style={{ color: sc.text }}>{sensor.status.replace("_", " ")}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
