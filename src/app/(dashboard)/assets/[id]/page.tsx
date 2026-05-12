"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type AssetDetail = {
  id: string;
  name: string;
  code: string;
  assetType: string;
  pillar: string;
  status: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  site: { name: string; code: string };
  sensors: {
    id: string;
    name: string;
    sensorType: string;
    metricName: string;
    unit: string;
    status: string;
    lastValue: number | null;
    lastReadingAt: string | null;
  }[];
  alerts: {
    id: string;
    title: string;
    severity: string;
    status: string;
    openedAt: string;
  }[];
  _count: { sensors: number; alerts: number };
};

const PILLAR_COLORS: Record<string, { text: string; bg: string }> = {
  ELECTRICITY:    { text: "#B45309", bg: "#FFFBEB" },
  WATER:          { text: "#1E5FA8", bg: "#EFF6FF" },
  WASTEWATER:     { text: "#6D28D9", bg: "#F5F3FF" },
  GAS_AIR:        { text: "#166534", bg: "#F0FDF4" },
  ENVIRONMENT:    { text: "#0E7490", bg: "#ECFEFF" },
  THERMAL_HVAC:   { text: "#C2410C", bg: "#FFF7ED" },
  COMPRESSED_AIR: { text: "#0E7490", bg: "#ECFEFF" },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  ACTIVE:         { bg: "#F0FDF4", text: "#166534" },
  INACTIVE:       { bg: "#F2F5FB", text: "#6378A0" },
  MAINTENANCE:    { bg: "#FFFBEB", text: "#B45309" },
  DECOMMISSIONED: { bg: "#FEF2F2", text: "#B91C1C" },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C" },
  HIGH:     { bg: "#FFFBEB", text: "#B45309" },
  MEDIUM:   { bg: "#EFF6FF", text: "#1E5FA8" },
  LOW:      { bg: "#F2F5FB", text: "#6378A0" },
  INFO:     { bg: "#EFF6FF", text: "#1E5FA8" },
};

const SENSOR_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE:          { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  OFFLINE:         { bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
  FAULT:           { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  CALIBRATION_DUE: { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/assets/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d: AssetDetail) => { setAsset(d); setLoading(false); })
      .catch(() => { setError("Asset not found"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 text-center text-[#6378A0]">{error ?? "Asset not found"}</div>
    );
  }

  const sc = STATUS_CONFIG[asset.status] ?? STATUS_CONFIG.INACTIVE;
  const pc = PILLAR_COLORS[asset.pillar] ?? { text: "#6378A0", bg: "#F2F5FB" };

  return (
    <div className="p-6 space-y-5">
      {/* Back button */}
      <button onClick={() => router.push("/assets")} className="flex items-center gap-1.5 text-[#6378A0] text-sm hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Assets
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-[#B8901A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[#0D1B35] text-2xl font-bold">{asset.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>{asset.status}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>{asset.pillar.replace(/_/g, " ")}</span>
            </div>
            <p className="text-[#6378A0] text-sm mt-1 font-mono">{asset.code}</p>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF5]">
          {[
            { label: "Site", value: `${asset.site.name} (${asset.site.code})` },
            { label: "Asset Type", value: asset.assetType },
            { label: "Pillar", value: asset.pillar.replace(/_/g, " ") },
            { label: "Code", value: asset.code },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">{label}</p>
              <p className="text-[#0D1B35] text-sm font-medium mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main col */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sensors table */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4EAF5]">
              <h2 className="text-[#0D1B35] font-semibold">Sensors</h2>
              <p className="text-[#6378A0] text-xs mt-0.5">{asset._count.sensors} sensors linked to this asset</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                    {["Name", "Type", "Metric", "Status", "Last Value", "Last Reading", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {asset.sensors.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6378A0] text-sm">No sensors</td></tr>
                  ) : asset.sensors.map(s => {
                    const ss = SENSOR_STATUS[s.status] ?? SENSOR_STATUS.OFFLINE;
                    return (
                      <tr key={s.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] last:border-0">
                        <td className="px-4 py-3 text-[#0D1B35] text-sm font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-[#6378A0] text-xs">{s.sensorType}</td>
                        <td className="px-4 py-3 text-[#3D5280] text-sm">{s.metricName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ss.dot }} />
                            <span className="text-xs font-medium" style={{ color: ss.text }}>{s.status.replace("_"," ")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-[#0D1B35]">
                          {s.lastValue !== null ? `${Number(s.lastValue).toFixed(2)} ${s.unit}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-[#6378A0] text-xs">
                          {s.lastReadingAt ? format(new Date(s.lastReadingAt), "MMM d, HH:mm") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`/sensors/${s.id}`} className="text-[#B8901A] text-sm font-medium hover:underline whitespace-nowrap">View →</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Alerts table */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4EAF5]">
              <h2 className="text-[#0D1B35] font-semibold">Active Alerts</h2>
              <p className="text-[#6378A0] text-xs mt-0.5">{asset.alerts.length} open / investigating</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                    {["Severity", "Title", "Status", "Opened", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {asset.alerts.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6378A0] text-sm">No active alerts</td></tr>
                  ) : asset.alerts.map(al => {
                    const alc = SEVERITY_COLORS[al.severity] ?? SEVERITY_COLORS.INFO;
                    return (
                      <tr key={al.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] last:border-0">
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: alc.bg, color: alc.text }}>{al.severity}</span>
                        </td>
                        <td className="px-4 py-3 text-[#0D1B35] text-sm">{al.title}</td>
                        <td className="px-4 py-3 text-[#3D5280] text-xs">{al.status}</td>
                        <td className="px-4 py-3 text-[#6378A0] text-xs">{format(new Date(al.openedAt), "MMM d, HH:mm")}</td>
                        <td className="px-4 py-3">
                          <a href={`/alerts/${al.id}`} className="text-[#B8901A] text-sm font-medium hover:underline whitespace-nowrap">View →</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stats card */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">Total Sensors</span>
                <span className="text-[#0D1B35] text-sm font-bold">{asset._count.sensors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">Total Alerts</span>
                <span className={`text-sm font-bold ${asset._count.alerts > 0 ? "text-[#B91C1C]" : "text-[#0D1B35]"}`}>{asset._count.alerts}</span>
              </div>
            </div>
          </div>

          {/* Manufacturer/Model */}
          {(asset.manufacturer || asset.model || asset.serialNumber) && (
            <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
              <h3 className="text-[#0D1B35] font-semibold mb-4">Hardware Info</h3>
              <div className="space-y-3">
                {asset.manufacturer && (
                  <div>
                    <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Manufacturer</p>
                    <p className="text-[#0D1B35] text-sm font-medium mt-1">{asset.manufacturer}</p>
                  </div>
                )}
                {asset.model && (
                  <div>
                    <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Model</p>
                    <p className="text-[#0D1B35] text-sm font-medium mt-1">{asset.model}</p>
                  </div>
                )}
                {asset.serialNumber && (
                  <div>
                    <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Serial Number</p>
                    <p className="text-[#0D1B35] text-sm font-mono mt-1">{asset.serialNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
