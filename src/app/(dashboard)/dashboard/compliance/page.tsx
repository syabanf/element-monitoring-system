import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

const complianceItems = [
  { name: "ISO 50001 Energy Management",  status: "COMPLIANT",    lastAudit: "2025-11-15", nextAudit: "2026-05-15", evidence: "Continuous monitoring active" },
  { name: "Wastewater pH (6.5–8.5)",      status: "WARNING",      lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "pH 7.8 — within range, monitoring" },
  { name: "Wastewater COD (< 200 mg/L)",  status: "COMPLIANT",    lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "COD 180 mg/L — below limit" },
  { name: "Wastewater TSS (< 100 mg/L)",  status: "COMPLIANT",    lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "TSS 42 mg/L — well below limit" },
  { name: "Gas / LEL Detection (< 10%)",  status: "COMPLIANT",    lastAudit: "2026-05-11", nextAudit: "Continuous", evidence: "Max detected: 2.1% LEL" },
  { name: "CO Worker Exposure (< 25 ppm)",status: "COMPLIANT",    lastAudit: "2026-05-11", nextAudit: "Continuous", evidence: "Max 12 ppm — below TWA" },
  { name: "Scope 2 GHG Reporting",        status: "COMPLIANT",    lastAudit: "2026-04-01", nextAudit: "2026-07-01", evidence: "CDP-format data available" },
  { name: "LDAR / VOC Emissions",         status: "COMPLIANT",    lastAudit: "2026-03-15", nextAudit: "2026-09-15", evidence: "Last survey passed" },
  { name: "Calibration Schedule",         status: "WARNING",      lastAudit: "2026-05-01", nextAudit: "2026-05-20", evidence: "3 sensors overdue calibration" },
];

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  COMPLIANT:     { color: "#166534", bg: "#F0FDF4", border: "#BBF7D0", icon: <CheckCircle className="w-4 h-4" style={{ color: "#22C55E" }} />, label: "Compliant" },
  WARNING:       { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", icon: <AlertTriangle className="w-4 h-4" style={{ color: "#F59E0B" }} />, label: "Warning" },
  NON_COMPLIANT: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", icon: <XCircle className="w-4 h-4" style={{ color: "#EF4444" }} />, label: "Non-Compliant" },
};

export default async function ComplianceDashboardPage() {
  const [calibrationOverdue, reports] = await Promise.all([
    prisma.sensor.count({ where: { status: "CALIBRATION_DUE" } }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const compliantCount = complianceItems.filter(i => i.status === "COMPLIANT").length;
  const warningCount = complianceItems.filter(i => i.status === "WARNING").length;
  const score = Math.round((compliantCount / complianceItems.length) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1C1714] text-2xl font-bold">Compliance Dashboard</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">Regulatory, safety, and ESG compliance status</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FEF7E6] border border-[#F5E6B5] rounded-xl px-4 py-2">
          <ShieldCheck className="w-4 h-4 text-[#B8901A]" />
          <span className="text-[#B8901A] font-bold text-sm">{score}% Compliant</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BBF7D0] rounded-xl p-5 shadow-sm">
          <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider mb-1">Compliant</p>
          <p className="text-[#166534] text-2xl font-bold">{compliantCount}</p>
          <p className="text-[#9C9285] text-xs mt-1">of {complianceItems.length} requirements</p>
        </div>
        <div className="bg-white border border-[#FDE68A] rounded-xl p-5 shadow-sm">
          <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider mb-1">Warning</p>
          <p className="text-[#B45309] text-2xl font-bold">{warningCount}</p>
          <p className="text-[#9C9285] text-xs mt-1">Needs attention</p>
        </div>
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider mb-1">Calibration Due</p>
          <p className="text-[#1C1714] text-2xl font-bold">{calibrationOverdue}</p>
          <p className="text-[#9C9285] text-xs mt-1">sensors overdue</p>
        </div>
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider mb-1">Recent Reports</p>
          <p className="text-[#1C1714] text-2xl font-bold">{reports.length}</p>
          <p className="text-[#9C9285] text-xs mt-1">generated</p>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDE8E0] bg-[#F5F3EE]">
          <h2 className="text-[#1C1714] font-semibold">Compliance Requirements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDE8E0]">
                {["Requirement", "Status", "Last Verified", "Next Due", "Evidence"].map((h) => (
                  <th key={h} className="text-left text-[#9C9285] text-xs font-bold uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complianceItems.map((item) => {
                const cfg = statusConfig[item.status] ?? statusConfig.NON_COMPLIANT;
                return (
                  <tr key={item.name} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                    <td className="px-5 py-3.5 text-[#1C1714] font-semibold text-sm">{item.name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#9C9285] text-sm">{item.lastAudit}</td>
                    <td className="px-5 py-3.5 text-[#9C9285] text-sm">{item.nextAudit}</td>
                    <td className="px-5 py-3.5 text-[#5C5248] text-sm">{item.evidence}</td>
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
