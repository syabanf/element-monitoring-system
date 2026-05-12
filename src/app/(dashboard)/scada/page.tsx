import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Activity, Wifi, WifiOff, AlertTriangle, Clock, MonitorDot } from "lucide-react";
import { SensorTile, type SensorTileData } from "@/components/scada/SensorTile";

const PILLAR_CFG: Record<string, { color: string; label: string }> = {
  ELECTRICITY:    { color: "#B45309", label: "Electricity" },
  WATER:          { color: "#1E5FA8", label: "Water" },
  WASTEWATER:     { color: "#7C3AED", label: "Wastewater" },
  GAS_AIR:        { color: "#166534", label: "Gas / Air" },
  ENVIRONMENT:    { color: "#0891B2", label: "Environment" },
  THERMAL_HVAC:   { color: "#B8901A", label: "Thermal / HVAC" },
  COMPRESSED_AIR: { color: "#0E7490", label: "Compressed Air" },
};

export default async function ScadaPage() {
  await auth();

  const [sensors, openAlerts] = await Promise.all([
    prisma.sensor.findMany({
      include: {
        asset: { select: { name: true, code: true, pillar: true, site: { select: { id: true, name: true } } } },
      },
      orderBy: [{ asset: { pillar: "asc" } }, { name: "asc" }],
    }),
    prisma.alert.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
  ]);

  const online = sensors.filter((s) => s.status === "ONLINE").length;
  const offline = sensors.filter((s) => s.status === "OFFLINE").length;
  const fault = sensors.filter((s) => s.status === "FAULT").length;
  const calDue = sensors.filter((s) => s.status === "CALIBRATION_DUE").length;

  // Group: site → pillar → sensors
  const bySite = new Map<string, { siteName: string; byPillar: Map<string, SensorTileData[]> }>();
  for (const s of sensors) {
    const siteId = s.asset.site.id;
    const siteName = s.asset.site.name;
    const pillar = s.asset.pillar as string;
    const pillarColor = PILLAR_CFG[pillar]?.color ?? "#6378A0";

    if (!bySite.has(siteId)) bySite.set(siteId, { siteName, byPillar: new Map() });
    const siteEntry = bySite.get(siteId)!;
    if (!siteEntry.byPillar.has(pillar)) siteEntry.byPillar.set(pillar, []);

    siteEntry.byPillar.get(pillar)!.push({
      id: s.id,
      name: s.name,
      sensorType: s.sensorType,
      metricName: s.metricName,
      unit: s.unit,
      status: s.status as string,
      lastValue: s.lastValue,
      lastReadingAt: s.lastReadingAt ? s.lastReadingAt.toISOString() : null,
      minValue: s.minValue,
      maxValue: s.maxValue,
      assetName: s.asset.name,
      assetCode: s.asset.code,
      pillar,
      pillarColor,
      siteName,
    });
  }

  const sites = [...bySite.entries()];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0D1B35 0%, #1E3A6A 100%)" }}
          >
            <MonitorDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[#0D1B35] text-2xl font-bold">SCADA Monitor</h1>
            <p className="text-[#6378A0] text-sm mt-0.5">
              {sensors.length} sensors across {sites.length} sites
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live badge */}
          <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
            </span>
            <span className="text-[#166534] text-xs font-semibold">Live</span>
          </div>
          {openAlerts > 0 && (
            <a
              href="/alerts"
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {openAlerts} open alert{openAlerts > 1 ? "s" : ""}
            </a>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Online",   value: online,  icon: Wifi,          color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
          { label: "Offline",  value: offline, icon: WifiOff,       color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
          { label: "Fault",    value: fault,   icon: AlertTriangle, color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
          { label: "Cal. Due", value: calDue,  icon: Clock,         color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: bg, border: `1px solid ${border}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: "#0D1B35" }}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Site sections */}
      {sites.map(([siteId, { siteName, byPillar }]) => (
        <section key={siteId} className="space-y-4">
          {/* Site header */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-[#D9E2F0] to-transparent" />
            <a
              href={`/sites/${siteId}`}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ background: "linear-gradient(135deg, #0D1B35, #1E3A6A)", color: "#fff" }}
            >
              <Activity className="w-3 h-3" />
              {siteName}
            </a>
            <div className="h-px flex-1 bg-gradient-to-l from-[#D9E2F0] to-transparent" />
          </div>

          {/* Pillar groups within site */}
          {[...byPillar.entries()].map(([pillar, tileSensors]) => {
            const pcfg = PILLAR_CFG[pillar] ?? { color: "#6378A0", label: pillar };
            const pillarOnline = tileSensors.filter((s) => s.status === "ONLINE").length;
            return (
              <div key={pillar} className="space-y-3">
                {/* Pillar sub-header */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pcfg.color }} />
                  <span className="text-[#0D1B35] text-sm font-bold">{pcfg.label}</span>
                  <span className="text-[#98A8C0] text-xs">
                    {pillarOnline}/{tileSensors.length} online
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: `${pcfg.color}22` }} />
                </div>

                {/* Sensor tile grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {tileSensors.map((sensor) => (
                    <SensorTile key={sensor.id} s={sensor} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      {sensors.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <MonitorDot className="w-12 h-12 text-[#D9E2F0] mb-3" />
          <p className="text-[#0D1B35] font-semibold">No sensors found</p>
          <p className="text-[#6378A0] text-sm mt-1">Add sensors and assets to see them here</p>
        </div>
      )}
    </div>
  );
}
