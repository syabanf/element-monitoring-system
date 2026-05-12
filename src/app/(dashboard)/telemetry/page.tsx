"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type LiveSensor = {
  sensorId: string;
  sensorName: string;
  assetName: string;
  pillar: string;
  siteName: string;
  metricName: string;
  lastValue: number | null;
  unit: string;
  status: string;
  lastReadingAt: string | null;
};

const pillarColors: Record<string, { text: string; dot: string }> = {
  ELECTRICITY:    { text: "#B45309", dot: "#B45309" },
  WATER:          { text: "#1E5FA8", dot: "#1E5FA8" },
  WASTEWATER:     { text: "#6D28D9", dot: "#6D28D9" },
  GAS_AIR:        { text: "#166534", dot: "#166534" },
  ENVIRONMENT:    { text: "#0E7490", dot: "#0E7490" },
  THERMAL_HVAC:   { text: "#C2410C", dot: "#C2410C" },
  COMPRESSED_AIR: { text: "#0E7490", dot: "#0E7490" },
};

const PILLARS = ["ELECTRICITY","WATER","WASTEWATER","GAS_AIR","ENVIRONMENT","THERMAL_HVAC","COMPRESSED_AIR"];

export default function TelemetryPage() {
  const [sensors, setSensors] = useState<LiveSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]         = useState("");
  const [pillarFilter, setPillarFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [siteFilter, setSiteFilter]     = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/telemetry/live").then(r => r.json()).then(d => { setSensors(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const uniqueSites = [...new Set(sensors.map(s => s.siteName))].sort();

  const filtered = sensors.filter(s => {
    const matchSearch = s.sensorName.toLowerCase().includes(search.toLowerCase()) || s.assetName.toLowerCase().includes(search.toLowerCase());
    const matchPillar = !pillarFilter || s.pillar === pillarFilter;
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchSite   = !siteFilter || s.siteName === siteFilter;
    return matchSearch && matchPillar && matchStatus && matchSite;
  });

  const anyFilter = search || pillarFilter || statusFilter || siteFilter;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Live Telemetry</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">{sensors.length} online sensors</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#D9E2F0] rounded-lg px-4 py-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
          <span className="text-[#3D5280] text-sm font-medium">Live</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sensors or assets…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All pillars</option>
          {PILLARS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
        </select>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All sites</option>
          {uniqueSites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All statuses</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="FAULT">Fault</option>
          <option value="CALIBRATION_DUE">Calibration Due</option>
        </select>
        {anyFilter && (
          <button onClick={() => { setSearch(""); setPillarFilter(""); setStatusFilter(""); setSiteFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#6378A0]">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((sensor) => {
            const pc = pillarColors[sensor.pillar] ?? { text: "#6378A0", dot: "#6378A0" };
            return (
              <div key={sensor.sensorId} className="bg-white border border-[#D9E2F0] rounded-xl p-4 space-y-2 hover:shadow-md hover:border-[#C6D0E8] transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-2 h-2 rounded-full bg-[#166534]" />
                  <span className="text-xs text-[#6378A0] truncate ml-2">{sensor.siteName}</span>
                </div>
                <div>
                  <p className="text-[#6378A0] text-xs truncate">{sensor.assetName}</p>
                  <p className="text-[#0D1B35] text-xs font-semibold truncate">{sensor.sensorName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6378A0]">{sensor.metricName}</p>
                  <p className="font-bold text-lg" style={{ color: pc.text }}>
                    {sensor.lastValue !== null ? Number(sensor.lastValue).toFixed(2) : "—"}
                    <span className="text-[#6378A0] text-xs font-normal ml-1">{sensor.unit}</span>
                  </p>
                </div>
                <p className="text-[#6378A0] text-[10px]">
                  {sensor.lastReadingAt ? new Date(sensor.lastReadingAt).toLocaleTimeString() : "No data"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
