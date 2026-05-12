"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Search, Filter, Download, TrendingUp, TrendingDown,
  Minus, Activity, AlertTriangle, CheckCircle, Clock,
} from "lucide-react";
import { format } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────

interface SensorOption { id: string; name: string; assetName: string; pillar: string; siteName: string; metricName: string; unit: string; }
interface Reading     { id: string; timestamp: string; value: number; unit: string; quality: string; }
interface HistoryData {
  sensor: { id: string; name: string; metricName: string; unit: string; minValue: number | null; maxValue: number | null; assetName: string; pillar: string; siteName: string };
  stats:  { min: number; max: number; avg: number; last: number } | null;
  readings: Reading[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const PILLAR_CFG: Record<string, { color: string; label: string }> = {
  ELECTRICITY:    { color: "#B45309", label: "Electricity"    },
  WATER:          { color: "#1E5FA8", label: "Water"          },
  WASTEWATER:     { color: "#7C3AED", label: "Wastewater"     },
  GAS_AIR:        { color: "#166534", label: "Gas / Air"      },
  ENVIRONMENT:    { color: "#0891B2", label: "Environment"    },
  THERMAL_HVAC:   { color: "#B8901A", label: "Thermal / HVAC" },
  COMPRESSED_AIR: { color: "#0E7490", label: "Compressed Air" },
};

const QUALITY_CFG: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  GOOD:          { color: "#166534", bg: "#F0FDF4", border: "#BBF7D0", icon: CheckCircle   },
  UNCERTAIN:     { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", icon: AlertTriangle },
  BAD:           { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", icon: AlertTriangle },
  SUBSTITUTED:   { color: "#6378A0", bg: "#F2F5FB", border: "#D9E2F0", icon: Minus         },
  NOT_INDICATED: { color: "#6378A0", bg: "#F2F5FB", border: "#D9E2F0", icon: Minus         },
};

const CARD = { background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" } as const;

// ── Custom tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: "#0D1B35", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[#98A8C0] mb-1">{label}</p>
      <p className="font-bold text-sm">{payload[0].value.toFixed(3)} <span className="text-[#98A8C0] font-normal">{unit}</span></p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [sensors,        setSensors       ] = useState<SensorOption[]>([]);
  const [selectedId,     setSelectedId    ] = useState<string>("");
  const [pillarFilter,   setPillarFilter  ] = useState<string>("");
  const [sensorSearch,   setSensorSearch  ] = useState<string>("");
  const [dateFrom,       setDateFrom      ] = useState<string>("");
  const [dateTo,         setDateTo        ] = useState<string>("");
  const [qualityFilter,  setQualityFilter ] = useState<string>("");
  const [data,           setData          ] = useState<HistoryData | null>(null);
  const [loading,        setLoading       ] = useState(false);
  const [page,           setPage          ] = useState(1);
  const PAGE_SIZE = 20;

  // Fetch sensor list
  useEffect(() => {
    fetch("/api/telemetry/live")
      .then((r) => r.json())
      .then((rows: SensorOption[]) => {
        setSensors(rows);
        if (rows.length) setSelectedId(rows[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch history when sensor / filters change
  const fetchHistory = useCallback(() => {
    if (!selectedId) return;
    setLoading(true);
    const p = new URLSearchParams({ sensorId: selectedId, limit: "500" });
    if (dateFrom) p.set("from", dateFrom);
    if (dateTo)   p.set("to", dateTo);
    if (qualityFilter) p.set("quality", qualityFilter);
    fetch(`/api/telemetry/history?${p}`)
      .then((r) => r.json())
      .then((d: HistoryData) => { setData(d); setPage(1); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedId, dateFrom, dateTo, qualityFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredSensors = sensors.filter((s) => {
    if (pillarFilter && s.pillar !== pillarFilter) return false;
    const q = sensorSearch.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.assetName.toLowerCase().includes(q) || s.siteName.toLowerCase().includes(q);
  });

  const readings = data?.readings ?? [];
  const pagedReadings = readings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(readings.length / PAGE_SIZE);

  const pillarColor = data ? (PILLAR_CFG[data.sensor.pillar]?.color ?? "#6378A0") : "#B8901A";

  const chartData = readings.map((r) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    value: r.value,
  }));

  // Stats
  const stats = data?.stats;
  const trend = stats && readings.length >= 2
    ? ((readings[readings.length - 1].value - readings[0].value) / Math.abs(readings[0].value || 1)) * 100
    : null;

  function exportCsv() {
    if (!data) return;
    const lines = ["timestamp,value,unit,quality", ...readings.map((r) => `${r.timestamp},${r.value},${r.unit},${r.quality}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${data.sensor.name}_history.csv`; a.click();
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Historical Data</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">Sensor telemetry readings over time</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #0D1B35, #1E3A6A)", color: "#fff" }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filter + Sensor list */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Left panel: sensor picker */}
        <div className="lg:col-span-1 rounded-2xl overflow-hidden flex flex-col" style={CARD}>
          <div className="px-4 py-3 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(13,27,53,0.06)", background: "rgba(240,244,250,0.6)" }}>
            <p className="text-[#0D1B35] text-xs font-bold uppercase tracking-widest">Sensors</p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
              <input
                value={sensorSearch}
                onChange={(e) => setSensorSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
                style={{ background: "#fff", border: "1px solid rgba(13,27,53,0.1)" }}
              />
            </div>

            {/* Pillar filter */}
            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none"
              style={{ background: "#fff", border: "1px solid rgba(13,27,53,0.1)" }}
            >
              <option value="">All pillars</option>
              {Object.entries(PILLAR_CFG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Sensor list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F0F4FA]" style={{ maxHeight: 420 }}>
            {filteredSensors.length === 0 && (
              <p className="text-[#98A8C0] text-xs text-center py-8">No sensors</p>
            )}
            {filteredSensors.map((s) => {
              const pc = PILLAR_CFG[s.pillar];
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="w-full text-left px-4 py-3 transition-colors hover:bg-[#F2F5FB]"
                  style={{ background: active ? `${pc?.color ?? "#B8901A"}10` : undefined }}
                >
                  <div className="flex items-center gap-2">
                    {active && <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: pc?.color ?? "#B8901A" }} />}
                    <div className="min-w-0">
                      <p className="text-[#0D1B35] text-xs font-bold truncate">{s.name}</p>
                      <p className="text-[#98A8C0] text-[10px] truncate">{s.assetName} · {s.siteName}</p>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 inline-block"
                        style={{ backgroundColor: `${pc?.color ?? "#6378A0"}14`, color: pc?.color ?? "#6378A0" }}
                      >
                        {pc?.label ?? s.pillar}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: chart + table */}
        <div className="lg:col-span-3 space-y-4">

          {/* Date / quality filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ ...CARD }}>
              <Filter className="w-3.5 h-3.5 text-[#98A8C0]" />
              <span className="text-[#6378A0] text-xs font-semibold">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-xs text-[#0D1B35] outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ ...CARD }}>
              <span className="text-[#6378A0] text-xs font-semibold">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-xs text-[#0D1B35] outline-none bg-transparent"
              />
            </div>
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs text-[#0D1B35] outline-none"
              style={{ ...CARD }}
            >
              <option value="">All quality</option>
              <option value="GOOD">Good</option>
              <option value="UNCERTAIN">Uncertain</option>
              <option value="BAD">Bad</option>
            </select>
            {(dateFrom || dateTo || qualityFilter) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setQualityFilter(""); }}
                className="text-xs text-[#B91C1C] font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Stats cards */}
          {stats && data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Min", value: stats.min.toFixed(2), icon: TrendingDown, color: "#1E5FA8" },
                { label: "Max", value: stats.max.toFixed(2), icon: TrendingUp,   color: "#B91C1C" },
                { label: "Avg", value: stats.avg.toFixed(2), icon: Activity,     color: pillarColor },
                { label: "Last",value: stats.last.toFixed(2),icon: Clock,        color: "#166534" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl px-4 py-3 flex items-center gap-3" style={CARD}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}14` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#98A8C0" }}>{label}</p>
                    <p className="text-sm font-black" style={{ color: "#0D1B35" }}>{value} <span className="text-[#98A8C0] font-normal text-[10px]">{data.sensor.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="rounded-2xl p-5" style={CARD}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[#0D1B35] font-bold text-sm">{data?.sensor.name ?? "—"}</h3>
                <p className="text-[#6378A0] text-xs">{data?.sensor.metricName} · {data?.sensor.siteName}</p>
              </div>
              {trend !== null && (
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={trend >= 0 ? { color: "#B91C1C", backgroundColor: "rgba(185,28,28,0.08)" } : { color: "#166534", backgroundColor: "rgba(22,163,74,0.08)" }}
                >
                  {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                </div>
              )}
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${pillarColor}44`, borderTopColor: pillarColor }} />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2">
                <Activity className="w-8 h-8 text-[#D9E2F0]" />
                <p className="text-[#98A8C0] text-sm">No data for selected range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,53,0.06)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#98A8C0" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "#98A8C0" }} axisLine={false} tickLine={false} width={48} />
                  {data?.sensor.minValue !== null && data?.sensor.maxValue !== null && data?.sensor.maxValue !== undefined && (
                    <ReferenceLine y={data.sensor.maxValue} stroke="#EF444444" strokeDasharray="4 4" label={{ value: "Max", position: "right", fontSize: 9, fill: "#EF4444" }} />
                  )}
                  <Tooltip content={<ChartTooltip unit={data?.sensor.unit ?? ""} />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={pillarColor}
                    strokeWidth={2}
                    dot={chartData.length <= 24 ? { r: 3, fill: pillarColor, strokeWidth: 0 } : false}
                    activeDot={{ r: 5, fill: pillarColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(13,27,53,0.06)", background: "rgba(240,244,250,0.6)" }}>
              <p className="text-[#0D1B35] text-sm font-bold">
                Readings
                <span className="ml-2 text-[#98A8C0] text-xs font-normal">({readings.length} total)</span>
              </p>
              <p className="text-[#6378A0] text-xs">Page {page} of {totalPages || 1}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "rgba(240,244,250,0.4)", borderBottom: "1px solid rgba(13,27,53,0.06)" }}>
                    {["Timestamp", "Value", "Unit", "Quality"].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left font-bold uppercase tracking-widest" style={{ color: "#98A8C0", fontSize: 9 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-10 text-[#98A8C0]">Loading…</td></tr>
                  ) : pagedReadings.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-[#98A8C0]">No readings</td></tr>
                  ) : (
                    pagedReadings.map((r, i) => {
                      const qc = QUALITY_CFG[r.quality] ?? QUALITY_CFG.NOT_INDICATED;
                      const QIcon = qc.icon;
                      return (
                        <tr
                          key={r.id}
                          style={{ borderBottom: "1px solid rgba(13,27,53,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(240,244,250,0.3)" }}
                        >
                          <td className="px-5 py-2.5 font-mono text-[#6378A0]">
                            {format(new Date(r.timestamp), "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td className="px-5 py-2.5 font-bold" style={{ color: pillarColor }}>
                            {r.value.toFixed(3)}
                          </td>
                          <td className="px-5 py-2.5 text-[#6378A0]">{r.unit}</td>
                          <td className="px-5 py-2.5">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase"
                              style={{ backgroundColor: qc.bg, color: qc.color, border: `1px solid ${qc.border}`, fontSize: 9 }}
                            >
                              <QIcon className="w-2.5 h-2.5" />
                              {r.quality.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(13,27,53,0.06)" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-opacity"
                  style={{ background: "rgba(13,27,53,0.06)", color: "#6378A0" }}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                        style={
                          pg === page
                            ? { backgroundColor: pillarColor, color: "#fff" }
                            : { backgroundColor: "rgba(13,27,53,0.05)", color: "#6378A0" }
                        }
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-opacity"
                  style={{ background: "rgba(13,27,53,0.06)", color: "#6378A0" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
