import { prisma } from "@/lib/prisma";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE: { bg: "#22c55e20", text: "#22c55e", dot: "#22c55e" },
  OFFLINE: { bg: "#ef444420", text: "#ef4444", dot: "#ef4444" },
  FAULT: { bg: "#f59e0b20", text: "#f59e0b", dot: "#f59e0b" },
  CALIBRATION_DUE: { bg: "#6366f120", text: "#6366f1", dot: "#6366f1" },
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
        <h1 className="text-white text-2xl font-bold">Sensor Registry</h1>
        <p className="text-[#888888] text-sm mt-0.5">{sensors.length} sensors across all sites</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Online", count: onlineCount, color: "#22c55e" },
          { label: "Offline", count: offlineCount, color: "#ef4444" },
          { label: "Fault", count: faultCount, color: "#f59e0b" },
          { label: "Calibration Due", count: calDueCount, color: "#6366f1" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div>
              <p className="text-white font-bold text-xl">{count}</p>
              <p className="text-[#888888] text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor table */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Sensor", "Asset / Site", "Metric", "Unit", "Protocol", "Gateway", "Last Value", "Last Read", "Status"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {sensors.map((sensor) => {
                const sc = statusConfig[sensor.status] ?? statusConfig.OFFLINE;
                return (
                  <tr key={sensor.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-xs">{sensor.name}</p>
                      <p className="text-[#888888] text-xs">{sensor.sensorType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs">{sensor.asset.name}</p>
                      <p className="text-[#888888] text-xs">{sensor.asset.site.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{sensor.metricName}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{sensor.unit}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{sensor.protocol}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{sensor.gateway?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white text-xs font-mono">
                      {sensor.lastValue !== null ? `${sensor.lastValue?.toFixed(2)} ${sensor.unit}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">
                      {sensor.lastReadingAt ? new Date(sensor.lastReadingAt).toLocaleTimeString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                        <span className="text-xs" style={{ color: sc.text }}>{sensor.status.replace("_", " ")}</span>
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
