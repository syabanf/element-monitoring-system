"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bell, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type AlertRuleDetail = {
  id: string;
  name: string;
  description: string | null;
  severity: string;
  alertType: string;
  metricName: string;
  operator: string;
  threshold: number;
  isActive: boolean;
  cooldownMinutes: number | null;
  sensor: {
    id: string;
    name: string;
    asset: {
      id: string;
      name: string;
      pillar: string;
      site: { name: string };
    };
  };
  alerts: {
    id: string;
    title: string;
    severity: string;
    status: string;
    openedAt: string;
  }[];
  _count: { alerts: number };
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C" },
  HIGH:     { bg: "#FFFBEB", text: "#B45309" },
  MEDIUM:   { bg: "#EFF6FF", text: "#1E5FA8" },
  LOW:      { bg: "#F2F5FB", text: "#6378A0" },
  INFO:     { bg: "#EFF6FF", text: "#1E5FA8" },
};

export default function AlertRuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rule, setRule] = useState<AlertRuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/alert-rules/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d: AlertRuleDetail) => { setRule(d); setLoading(false); })
      .catch(() => { setError("Alert rule not found"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !rule) {
    return <div className="p-6 text-center text-[#6378A0]">{error ?? "Alert rule not found"}</div>;
  }

  const sc = SEVERITY_COLORS[rule.severity] ?? SEVERITY_COLORS.INFO;

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => router.push("/alert-rules")} className="flex items-center gap-1.5 text-[#6378A0] text-sm hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Alert Rules
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-[#B91C1C]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[#0D1B35] text-2xl font-bold">{rule.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>{rule.severity}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-8 h-4 rounded-full ${rule.isActive ? "bg-[#B8901A]" : "bg-[#D9E2F0]"}`} />
                <span className="text-xs text-[#6378A0]">{rule.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
            {rule.description && <p className="text-[#6378A0] text-sm mt-1">{rule.description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF5]">
          {[
            { label: "Sensor", value: rule.sensor.name },
            { label: "Asset", value: rule.sensor.asset.name },
            { label: "Site", value: rule.sensor.asset.site.name },
            { label: "Alert Type", value: rule.alertType.replace(/_/g, " ") },
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
          {/* Rule Condition card */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
            <h2 className="text-[#0D1B35] font-semibold mb-4">Rule Condition</h2>
            <div className="bg-[#F8FAFC] border border-[#E4EAF5] rounded-xl p-6 text-center">
              <p className="text-[#0D1B35] text-3xl font-bold font-mono">
                {rule.metricName} {rule.operator} {rule.threshold}
              </p>
              <p className="text-[#6378A0] text-sm mt-2">
                Alert triggers when <span className="font-medium text-[#0D1B35]">{rule.metricName}</span> is{" "}
                <span className="font-medium text-[#0D1B35]">{rule.operator}</span>{" "}
                <span className="font-medium text-[#0D1B35]">{rule.threshold}</span>
              </p>
              {rule.description && <p className="text-[#6378A0] text-xs mt-3 max-w-md mx-auto">{rule.description}</p>}
            </div>
          </div>

          {/* Recent Alerts Triggered */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4EAF5]">
              <h2 className="text-[#0D1B35] font-semibold">Recent Alerts Triggered</h2>
              <p className="text-[#6378A0] text-xs mt-0.5">Last {rule.alerts.length} alerts from this rule</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                    {["Severity", "Title", "Status", "Opened"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rule.alerts.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6378A0] text-sm">No alerts triggered yet</td></tr>
                  ) : rule.alerts.map(al => {
                    const alc = SEVERITY_COLORS[al.severity] ?? SEVERITY_COLORS.INFO;
                    return (
                      <tr key={al.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] last:border-0">
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: alc.bg, color: alc.text }}>{al.severity}</span>
                        </td>
                        <td className="px-4 py-3 text-[#0D1B35] text-sm">{al.title}</td>
                        <td className="px-4 py-3 text-[#3D5280] text-xs">{al.status}</td>
                        <td className="px-4 py-3 text-[#6378A0] text-xs">{format(new Date(al.openedAt), "MMM d, HH:mm")}</td>
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
                <span className="text-[#6378A0] text-sm">Total Alerts Triggered</span>
                <span className="text-[#0D1B35] text-sm font-bold">{rule._count.alerts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6378A0] text-sm">Rule Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rule.isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F2F5FB] text-[#6378A0]"}`}>
                  {rule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Cooldown/Escalation */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-5">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Configuration</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Alert Type</p>
                <p className="text-[#0D1B35] text-sm font-medium mt-1">{rule.alertType.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">Cooldown</p>
                <p className="text-[#0D1B35] text-sm font-medium mt-1">
                  {rule.cooldownMinutes ? `${rule.cooldownMinutes} minutes` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
