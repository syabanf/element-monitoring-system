import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const complianceItems = [
  { name: "ISO 50001 Energy Management", status: "COMPLIANT", lastAudit: "2025-11-15", nextAudit: "2026-05-15", evidence: "Continuous monitoring active" },
  { name: "Wastewater pH (6.5–8.5)", status: "WARNING", lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "pH 7.8 — within range, monitoring" },
  { name: "Wastewater COD (< 200 mg/L)", status: "COMPLIANT", lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "COD 180 mg/L — below limit" },
  { name: "Wastewater TSS (< 100 mg/L)", status: "COMPLIANT", lastAudit: "2026-05-10", nextAudit: "2026-05-12", evidence: "TSS 42 mg/L — well below limit" },
  { name: "Gas / LEL Detection (< 10% LEL)", status: "COMPLIANT", lastAudit: "2026-05-11", nextAudit: "Continuous", evidence: "Max detected: 2.1% LEL" },
  { name: "CO Worker Exposure (< 25 ppm TWA)", status: "COMPLIANT", lastAudit: "2026-05-11", nextAudit: "Continuous", evidence: "Max 12 ppm — below TWA" },
  { name: "Scope 2 GHG Reporting", status: "COMPLIANT", lastAudit: "2026-04-01", nextAudit: "2026-07-01", evidence: "CDP-format data available" },
  { name: "LDAR / VOC Emissions", status: "COMPLIANT", lastAudit: "2026-03-15", nextAudit: "2026-09-15", evidence: "Last survey passed" },
  { name: "Calibration Schedule", status: "WARNING", lastAudit: "2026-05-01", nextAudit: "2026-05-20", evidence: "3 sensors overdue calibration" },
];

const statusIcon: Record<string, React.ReactNode> = {
  COMPLIANT: <CheckCircle className="w-4 h-4 text-[#22c55e]" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />,
  NON_COMPLIANT: <XCircle className="w-4 h-4 text-[#ef4444]" />,
};

const statusText: Record<string, string> = {
  COMPLIANT: "text-[#22c55e]",
  WARNING: "text-[#f59e0b]",
  NON_COMPLIANT: "text-[#ef4444]",
};

export default async function ComplianceDashboardPage() {
  const [calibrationOverdue, reports] = await Promise.all([
    prisma.sensor.count({ where: { status: "CALIBRATION_DUE" } }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const compliantCount = complianceItems.filter(i => i.status === "COMPLIANT").length;
  const warningCount = complianceItems.filter(i => i.status === "WARNING").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Compliance Dashboard</h1>
        <p className="text-[#888888] text-sm mt-0.5">Regulatory, safety, and ESG compliance status</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#22c55e30] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Compliant</p>
          <p className="text-[#22c55e] text-2xl font-bold">{compliantCount}</p>
          <p className="text-[#888888] text-xs mt-1">of {complianceItems.length} requirements</p>
        </div>
        <div className="bg-[#111111] border border-[#f59e0b30] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Warning</p>
          <p className="text-[#f59e0b] text-2xl font-bold">{warningCount}</p>
          <p className="text-[#888888] text-xs mt-1">Needs attention</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Calibration Overdue</p>
          <p className="text-white text-2xl font-bold">{calibrationOverdue}</p>
          <p className="text-[#888888] text-xs mt-1">sensors</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888888] text-xs uppercase tracking-wider mb-1">Recent Reports</p>
          <p className="text-white text-2xl font-bold">{reports.length}</p>
          <p className="text-[#888888] text-xs mt-1">generated</p>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
        <div className="p-5 border-b border-[#2a2a2a]">
          <h2 className="text-white font-semibold">Compliance Requirements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-5 py-3 font-medium">Requirement</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Status</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Last Verified</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Next Due</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {complianceItems.map((item) => (
                <tr key={item.name} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 ${statusText[item.status]}`}>
                      {statusIcon[item.status]}
                      <span className="text-xs font-medium">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888888] text-xs">{item.lastAudit}</td>
                  <td className="px-4 py-3 text-[#888888] text-xs">{item.nextAudit}</td>
                  <td className="px-4 py-3 text-[#888888] text-xs">{item.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
