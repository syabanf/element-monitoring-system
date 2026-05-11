import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle, Clock, User, CheckCircle } from "lucide-react";

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  HIGH: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  MEDIUM: { bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE" },
  LOW: { bg: "#F2F5FB", text: "#6378A0", border: "#D9E2F0" },
  INFO: { bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#FEF2F2", text: "#B91C1C" },
  ACKNOWLEDGED: { bg: "#FFFBEB", text: "#B45309" },
  INVESTIGATING: { bg: "#EFF6FF", text: "#1E5FA8" },
  RESOLVED: { bg: "#F0FDF4", text: "#166534" },
  CLOSED: { bg: "#F2F5FB", text: "#6378A0" },
  FALSE_POSITIVE: { bg: "#F2F5FB", text: "#6378A0" },
};

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      asset: { include: { site: true } },
      rule: true,
      assignee: true,
      workOrder: true,
    },
  });

  if (!alert) notFound();

  const auditTrail = await prisma.auditLog.findMany({
    where: { entityId: id, entityType: "Alert" },
    include: { actor: { select: { name: true, role: true } } },
    orderBy: { timestamp: "asc" },
  });

  const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
  const st = statusConfig[alert.status] ?? statusConfig.CLOSED;

  const timeline = [
    { time: alert.openedAt, label: "Alert Opened", color: "#B91C1C" },
    ...(alert.acknowledgedAt ? [{ time: alert.acknowledgedAt, label: "Acknowledged", color: "#B45309" }] : []),
    ...(alert.resolvedAt ? [{ time: alert.resolvedAt, label: "Resolved", color: "#166534" }] : []),
    ...(alert.closedAt ? [{ time: alert.closedAt, label: "Closed", color: "#6378A0" }] : []),
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sev.bg }}>
            <AlertTriangle className="w-5 h-5" style={{ color: sev.text }} />
          </div>
          <div>
            <h1 className="text-[#0D1B35] text-xl font-bold">{alert.title}</h1>
            <p className="text-[#6378A0] text-sm mt-0.5">{alert.asset.name} · {alert.asset.site.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-3 py-1 rounded-full border font-semibold" style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}>
            {alert.severity}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: st.bg, color: st.text }}>
            {alert.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Details card */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-[#0D1B35] font-semibold">Alert Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Alert Type", value: alert.alertType.replace(/_/g, " ") },
                { label: "Metric", value: alert.metricName ?? "—" },
                { label: "Measured Value", value: alert.metricValue !== null ? `${alert.metricValue?.toFixed(2)} ${alert.rule?.metricName ?? ""}` : "—" },
                { label: "Threshold", value: alert.threshold !== null ? `${alert.threshold?.toFixed(2)}` : "—" },
                { label: "Pillar", value: alert.asset.pillar.replace(/_/g, " ") },
                { label: "Asset Type", value: alert.asset.assetType },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[#6378A0] text-xs">{label}</p>
                  <p className="text-[#0D1B35] text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
            {alert.description && (
              <div className="border-t border-[#E4EAF5] pt-4">
                <p className="text-[#6378A0] text-xs mb-1">Description</p>
                <p className="text-[#0D1B35] text-sm">{alert.description}</p>
              </div>
            )}
          </div>

          {/* Resolution */}
          {(alert.rootCause || alert.resolution) && (
            <div className="bg-white border border-[#BBF7D0] rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-[#0D1B35] font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#166534]" />
                Resolution
              </h3>
              {alert.rootCause && (
                <div>
                  <p className="text-[#6378A0] text-xs">Root Cause</p>
                  <p className="text-[#0D1B35] text-sm">{alert.rootCause}</p>
                </div>
              )}
              {alert.resolution && (
                <div>
                  <p className="text-[#6378A0] text-xs">Resolution</p>
                  <p className="text-[#0D1B35] text-sm">{alert.resolution}</p>
                </div>
              )}
            </div>
          )}

          {/* Audit trail */}
          {auditTrail.length > 0 && (
            <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
              <h3 className="text-[#0D1B35] font-semibold mb-4">Audit Trail</h3>
              <div className="space-y-3">
                {auditTrail.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#B8901A] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#0D1B35] text-sm">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-[#6378A0] text-xs">{log.actor?.name ?? "System"} · {format(new Date(log.timestamp), "MMM d, HH:mm")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-[#0D1B35] font-semibold mb-4">Timeline</h3>
            <div className="space-y-3">
              {timeline.map(({ time, label, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-[#0D1B35] text-xs font-medium">{label}</p>
                    <p className="text-[#6378A0] text-xs">{format(new Date(time), "MMM d, HH:mm:ss")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-[#0D1B35] font-semibold mb-3">Assignment</h3>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#6378A0]" />
              <span className="text-[#0D1B35] text-sm">{alert.assignee?.name ?? "Unassigned"}</span>
            </div>
            {alert.slaDeadline && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-[#B45309]" />
                <span className="text-[#B45309] text-xs">SLA: {formatDistanceToNow(new Date(alert.slaDeadline), { addSuffix: true })}</span>
              </div>
            )}
          </div>

          {/* Work Order */}
          {alert.workOrder && (
            <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
              <h3 className="text-[#0D1B35] font-semibold mb-3">Work Order</h3>
              <p className="text-[#0D1B35] text-sm">{alert.workOrder.title}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E5FA8] mt-1 inline-block font-medium">
                {alert.workOrder.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
