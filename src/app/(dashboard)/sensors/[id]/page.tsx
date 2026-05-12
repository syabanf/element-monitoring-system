"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Radio, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type SensorDetail = {
  id: string;
  name: string;
  sensorType: string;
  metricName: string;
  unit: string;
  protocol: string;
  status: string;
  lastValue: number | null;
  lastReadingAt: string | null;
  minValue: number | null;
  maxValue: number | null;
  calibrationInterval: number | null;
  nextCalibrationAt: string | null;
  asset: {
    id: string;
    name: string;
    pillar: string;
    site: { name: string };
  };
  gateway: { id: string; name: string; status: string } | null;
  alertRules: {
    id: string;
    name: string;
    operator: string;
    threshold: number;
    severity: string;
    isActive: boolean;
  }[];
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE:          { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  OFFLINE:         { bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
  FAULT:           { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  CALIBRATION_DUE: { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C" },
  HIGH:     { bg: "#FFFBEB", text: "#B45309" },
  MEDIUM:   { bg: "#EFF6FF", text: "#1E5FA8" },
  LOW:      { bg: "#F2F5FB", text: "#6378A0" },
  INFO:     { bg: "#EFF6FF", text: "#1E5FA8" },
};

export default function SensorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sensor, setSensor] = useState<SensorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sensors/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d: SensorDetail) => { setSensor(d); setLoading(false); })
      .catch(() => { setError("Sensor not found"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !sensor) {
    return <div className="p-6 text-center text-[#6378A0]">{error ?? "Sensor not found"}</div>;
  }

  const sc = STATUS_CONFIG[sensor.status] ?? STATUS_CONFIG.OFFLINE;
  const gaugePercent = sensor.minValue !== null && sensor.maxValue !== null && sensor.lastValue !== null
    ? Math.min(100, Math.max(0, ((sensor.lastValue - sensor.minValue) / (sensor.maxValue - sensor.minValue)) * 100))
    : null;

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => router.push("/sensors")} className="flex items-center gap-1.5 text-[#6378A0] text-sm hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Sensors
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
            <Radio className="w-6 h-6 text-[#1E5FA8]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[#0D1B35] text-2xl font-bold">{sensor.name}</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                {sensor.status.replace("_", " ")}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#F2F5FB] text-[#3D5280]">{sensor.protocol}</span>
            </div>
            <p className="text-[#6378A0] text-sm mt-1">{sensor.sensorType}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF5]">
          {[
            { label: "Asset", value: sensor.asset.name },
            { label: "Site", value: sensor.asset.site.name },
            { label: "Metric", value: sensor.metricName },
            { label: "Unit", value: sensor.unit },
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
          {/* Live Reading card */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
            <h2 className="text-[#0D1B35] font-semibold mb-4">Live Reading</h2>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-[#0D1B35] font-mono">
                {sensor.lastValue !== null ? Number(sensor.lastValue).toFixed(2) : "—"}
              </div>
              <div className="text-[#6378A0] text-lg mt-1">{sensor.unit}</div>
              {sensor.lastReadingAt && (
                <div className="text-[#6378A0] text-xs mt-2">
                  Last reading: {format(new Date(sensor.lastReadingAt), "MMM d, yyyy HH:mm:ss")}
                </div>
              )}
            </div>
            {gaugePercent !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#6378A0] mb-1">
                  <span>{sensor.minValue} {sensor.unit}</span>
                  <span>{sensor.maxValue} {sensor.unit}</span>
                </div>
                <div className="h-3 bg-[#F2F5FB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${gaugePercent}%`, backgroundColor: gaugePercent > 80 ? "#B91C1C" : "#B8901A" }}
                  />
                </div>
                <div className="text-center text-xs text-[#6378A0] mt-1">{gaugePercent.toFixed(1)}% of range</div>
              </div>
            )}
          </div>

          {/* Alert Rules table */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4EAF5]">
              <h2 className="text-[#0D1B35] font-semibold">Alert Rules</h2>
              <p className="text-[#6378A0] text-xs mt-0.5">{sensor.alertRules.length} rules configured</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                    {["Name", "Condition", "Severity", "Active"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensor.alertRules.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6378A0] text-sm">No alert rules</td></tr>
                  ) : sensor.alertRules.map(rule => {
                    const svc = SEVERITY_COLORS[rule.severity] ?? SEVERITY_COLORS.INFO;
                    return (
                      <tr key={rule.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] last:border-0">
                        <td className="px-4 py-3 text-[#0D1B35] text-sm font-medium">{rule.name}</td>
                        <td className="px-4 py-3 font-mono text-sm text-[#3D5280]">
                          {sensor.metricName} {rule.operator} {rule.threshold}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: svc.bg, color: svc.text }}>{rule.severity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`w-8 h-4 rounded-full ${rule.isActive ? "bg-[#B8901A]" : "bg-[#D9E2F0]"}`} />
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
          {/* Technical specs */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Technical Specs</h3>
            <div className="space-y-3">
              {[
                { label: "Sensor Type", value: sensor.sensorType },
                { label: "Protocol", value: sensor.protocol },
                { label: "Min Value", value: sensor.minValue !== null ? `${sensor.minValue} ${sensor.unit}` : "—" },
                { label: "Max Value", value: sensor.maxValue !== null ? `${sensor.maxValue} ${sensor.unit}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#6378A0] text-sm">{label}</span>
                  <span className="text-[#0D1B35] text-sm font-medium">{value}</span>
                </div>
              ))}
              {sensor.gateway && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6378A0] text-sm">Gateway</span>
                  <a href={`/gateways/${sensor.gateway.id}`} className="text-[#B8901A] text-sm font-medium hover:underline">{sensor.gateway.name}</a>
                </div>
              )}
            </div>
          </div>

          {/* Calibration */}
          {(sensor.calibrationInterval || sensor.nextCalibrationAt) && (
            <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
              <h3 className="text-[#0D1B35] font-semibold mb-4">Calibration</h3>
              <div className="space-y-3">
                {sensor.calibrationInterval && (
                  <div>
                    <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Interval</p>
                    <p className="text-[#0D1B35] text-sm font-medium mt-1">{sensor.calibrationInterval} days</p>
                  </div>
                )}
                {sensor.nextCalibrationAt && (
                  <div>
                    <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Next Calibration</p>
                    <p className="text-[#0D1B35] text-sm font-medium mt-1">{format(new Date(sensor.nextCalibrationAt), "MMM d, yyyy")}</p>
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
