import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  openedAt: string | Date;
  asset: { name: string; pillar: string; site: { name: string } };
}

const severityConfig = {
  CRITICAL: { color: "#ef4444", bg: "#ef444415" },
  HIGH: { color: "#f59e0b", bg: "#f59e0b15" },
  MEDIUM: { color: "#3b82f6", bg: "#3b82f615" },
  LOW: { color: "#888888", bg: "#88888815" },
  INFO: { color: "#6366f1", bg: "#6366f115" },
};

export function AlertSummaryRow({ alert }: { alert: Alert }) {
  const cfg = severityConfig[alert.severity as keyof typeof severityConfig] ?? severityConfig.INFO;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{alert.title}</p>
        <p className="text-[#888888] text-xs">{alert.asset.site.name} · {alert.asset.name}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
          {alert.severity}
        </span>
        <p className="text-[#888888] text-xs mt-0.5">
          {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
