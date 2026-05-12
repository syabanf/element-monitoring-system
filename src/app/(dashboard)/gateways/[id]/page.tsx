"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Wifi, ArrowLeft, Radio } from "lucide-react";
import { format } from "date-fns";

type GatewayDetail = {
  id: string;
  name: string;
  serialNumber: string;
  connectionType: string;
  ipAddress: string | null;
  firmwareVersion: string | null;
  status: string;
  lastSeenAt: string | null;
  site: { name: string; code: string };
  sensors: {
    id: string;
    name: string;
    sensorType: string;
    status: string;
    asset: { name: string; pillar: string };
  }[];
  _count: { sensors: number };
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

const SENSOR_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE:          { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  OFFLINE:         { bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
  FAULT:           { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  CALIBRATION_DUE: { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
};

export default function GatewayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [gateway, setGateway] = useState<GatewayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/gateways/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d: GatewayDetail) => { setGateway(d); setLoading(false); })
      .catch(() => { setError("Gateway not found"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !gateway) {
    return <div className="p-6 text-center text-[#6378A0]">{error ?? "Gateway not found"}</div>;
  }

  const isOnline = gateway.status === "online" || gateway.status === "ONLINE";

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => router.push("/gateways")} className="flex items-center gap-1.5 text-[#6378A0] text-sm hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Gateways
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
            <Wifi className="w-6 h-6 text-[#1E5FA8]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[#0D1B35] text-2xl font-bold">{gateway.name}</h1>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${isOnline ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FEF2F2] text-[#B91C1C]"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#166534] animate-pulse" : "bg-[#B91C1C]"}`} />
                {gateway.status.toUpperCase()}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#F2F5FB] text-[#3D5280]">{gateway.connectionType}</span>
            </div>
            <p className="text-[#6378A0] text-sm mt-1 font-mono">{gateway.serialNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF5]">
          {[
            { label: "Site", value: `${gateway.site.name} (${gateway.site.code})` },
            { label: "IP Address", value: gateway.ipAddress ?? "—" },
            { label: "Firmware", value: gateway.firmwareVersion ?? "—" },
            { label: "Last Heartbeat", value: gateway.lastSeenAt ? format(new Date(gateway.lastSeenAt), "MMM d, HH:mm") : "—" },
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
        {/* Main col: Connected sensors */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4EAF5]">
              <h2 className="text-[#0D1B35] font-semibold">Connected Sensors</h2>
              <p className="text-[#6378A0] text-xs mt-0.5">{gateway._count.sensors} sensors on this gateway</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                    {["Name", "Type", "Asset / Pillar", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gateway.sensors.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6378A0] text-sm">No sensors connected</td></tr>
                  ) : gateway.sensors.map(s => {
                    const ss = SENSOR_STATUS[s.status] ?? SENSOR_STATUS.OFFLINE;
                    const pc = PILLAR_COLORS[s.asset.pillar] ?? { text: "#6378A0", bg: "#F2F5FB" };
                    return (
                      <tr key={s.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] last:border-0">
                        <td className="px-4 py-3 text-[#0D1B35] text-sm font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-[#6378A0] text-xs">{s.sensorType}</td>
                        <td className="px-4 py-3">
                          <p className="text-[#0D1B35] text-sm">{s.asset.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>{s.asset.pillar.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ss.dot }} />
                            <span className="text-xs font-medium" style={{ color: ss.text }}>{s.status.replace("_", " ")}</span>
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

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">Connected Sensors</span>
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#6378A0]" />
                  <span className="text-[#0D1B35] text-sm font-bold">{gateway._count.sensors}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">Connection Type</span>
                <span className="text-[#0D1B35] text-sm font-medium">{gateway.connectionType}</span>
              </div>
            </div>
          </div>

          {/* Connection info */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Connection Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Protocol</p>
                <p className="text-[#0D1B35] text-sm font-medium mt-1">{gateway.connectionType}</p>
              </div>
              <div>
                <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">IP Address</p>
                <p className="text-[#0D1B35] text-sm font-mono mt-1">{gateway.ipAddress ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Firmware</p>
                <p className="text-[#0D1B35] text-sm font-medium mt-1">{gateway.firmwareVersion ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
