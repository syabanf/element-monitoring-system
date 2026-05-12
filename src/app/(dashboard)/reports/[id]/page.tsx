"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft, Download, FileText, Calendar, User, Clock,
  CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Droplets, Zap, Wrench, ClipboardList, BarChart2, Target,
  BookOpen, DollarSign, Leaf, Wind, ShieldCheck, Printer,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type IconComponent = React.FC<LucideProps>;

type Report = {
  id: string; reportType: string; title: string; period: string;
  status: string; fileUrl: string | null; parameters: Record<string, unknown>;
  createdAt: string;
  generator: { name: string; email: string; role: string };
};

// ── Catalog ──────────────────────────────────────────────────────────────────
const CATALOG: Record<string, {
  label: string; category: string; description: string;
  formats: string[]; icon: IconComponent; color: string; roles: string;
}> = {
  wastewater_compliance: { label: "Wastewater Compliance",      category: "Compliance", description: "pH, COD, TSS effluent data for BAPEDAL submission",              formats: ["PDF","CSV"],         icon: Droplets,      color: "#6D28D9", roles: "EHS / Compliance" },
  iso50001_evidence:     { label: "ISO 50001 Evidence",          category: "Compliance", description: "Energy management evidence pack for audit",                       formats: ["PDF","XLSX"],        icon: Zap,           color: "#B45309", roles: "Energy Manager" },
  calibration_status:    { label: "Calibration Status Report",   category: "Compliance", description: "Sensor calibration schedule, overdue list, certificates",         formats: ["PDF","XLSX"],        icon: Wrench,        color: "#1E5FA8", roles: "Technician" },
  daily_operations:      { label: "Daily Operations Report",     category: "Operations", description: "Asset status, alerts, consumption summary for shift handover",    formats: ["PDF","CSV"],         icon: ClipboardList, color: "#1E5FA8", roles: "Operations Supervisor" },
  weekly_variance:       { label: "Weekly Variance Report",      category: "Operations", description: "Consumption vs baseline, deviations, anomaly summary",            formats: ["PDF","XLSX","CSV"],  icon: BarChart2,     color: "#B45309", roles: "Energy Manager" },
  peak_demand_analysis:  { label: "Peak Demand Analysis",        category: "Operations", description: "Peak demand events, tariff exposure, load shedding opportunities",formats: ["PDF","XLSX"],        icon: Zap,           color: "#B91C1C", roles: "Energy Manager" },
  water_balance:         { label: "Water Balance Report",        category: "Operations", description: "Water input, consumption, discharge, NRW reconciliation",         formats: ["PDF","XLSX"],        icon: Droplets,      color: "#1E5FA8", roles: "Operations Supervisor" },
  monthly_scorecard:     { label: "Monthly Executive Scorecard", category: "Financial",  description: "KPIs, cost, carbon, site rankings for management review",         formats: ["PDF","XLSX"],        icon: Target,        color: "#B8901A", roles: "Executive" },
  quarterly_board:       { label: "Quarterly Board Pack",        category: "Financial",  description: "Executive summary with ROI analysis for board review",            formats: ["PDF"],               icon: BookOpen,      color: "#6D28D9", roles: "Executive" },
  cost_allocation:       { label: "Cost Allocation Report",      category: "Financial",  description: "Energy/water/gas cost split by department and cost center",       formats: ["XLSX","CSV"],        icon: DollarSign,    color: "#166534", roles: "Finance" },
  energy_benchmark:      { label: "Energy Benchmarking",         category: "Financial",  description: "Site-vs-site energy intensity (kWh/m², kWh/unit)",                formats: ["PDF","XLSX"],        icon: TrendingUp,    color: "#B45309", roles: "Energy Manager" },
  monthly_energy:        { label: "Monthly Energy Report",       category: "Operations", description: "Monthly electricity consumption and cost summary",                formats: ["PDF","XLSX"],        icon: Zap,           color: "#B45309", roles: "Energy Manager" },
  scope2_emissions:      { label: "Scope 2 Emissions Report",    category: "ESG",        description: "CDP-format GHG disclosure with location & market-based methods",  formats: ["PDF","XLSX","CSV"],  icon: Leaf,          color: "#166534", roles: "EHS / Compliance" },
  gas_ldar_incident:     { label: "Gas / LDAR Incident Report",  category: "Incidents",  description: "Leak detection and repair log, fugitive emissions evidence",      formats: ["PDF","CSV"],         icon: Wind,          color: "#0E7490", roles: "EHS / Compliance" },
  worker_safety:         { label: "Worker Safety Report",        category: "Incidents",  description: "Gas exposure events, OSHA 1910.146 confined space log",           formats: ["PDF"],               icon: ShieldCheck,   color: "#B91C1C", roles: "EHS / Compliance" },
};

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Compliance: { bg: "#F5F3FF", text: "#6D28D9" },
  Operations: { bg: "#EFF6FF", text: "#1E5FA8" },
  Financial:  { bg: "#FEF7E6", text: "#B8901A" },
  ESG:        { bg: "#F0FDF4", text: "#166534" },
  Incidents:  { bg: "#FEF2F2", text: "#B91C1C" },
};

const formatBadge: Record<string, { cls: string; bg: string; text: string }> = {
  PDF:  { cls: "bg-[#FEF2F2] text-[#B91C1C]", bg: "#FEF2F2", text: "#B91C1C" },
  XLSX: { cls: "bg-[#F0FDF4] text-[#166534]", bg: "#F0FDF4", text: "#166534" },
  CSV:  { cls: "bg-[#EFF6FF] text-[#1E5FA8]", bg: "#EFF6FF", text: "#1E5FA8" },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[#E4EAF5]">
        <p className="text-[#0D1B35] font-bold">{title}</p>
        {subtitle && <p className="text-[#6378A0] text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiGrid({ kpis }: { kpis: { label: string; value: string; delta?: number; unit?: string }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map(k => (
        <div key={k.label} className="bg-white border border-[#D9E2F0] rounded-xl p-4 shadow-sm">
          <p className="text-[#6378A0] text-xs mb-1">{k.label}</p>
          <p className="text-[#0D1B35] text-xl font-bold leading-none">{k.value}</p>
          {k.delta !== undefined && k.delta !== 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {k.delta < 0
                ? <TrendingDown className="w-3 h-3 text-[#166534]" />
                : <TrendingUp   className="w-3 h-3 text-[#B91C1C]" />}
              <span className={`text-[10px] font-semibold ${k.delta < 0 ? "text-[#166534]" : "text-[#B91C1C]"}`}>
                {k.delta > 0 ? "+" : ""}{k.delta}%
              </span>
              {k.unit && <span className="text-[#6378A0] text-[10px]">{k.unit}</span>}
            </div>
          )}
          {(k.delta === 0 || k.delta === undefined) && k.unit && (
            <p className="text-[#6378A0] text-[10px] mt-1">{k.unit}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Callout({ type, text }: { type: "info" | "warning" | "success"; text: string }) {
  const cfg = {
    info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E5FA8", Icon: Minus },
    warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309", Icon: AlertTriangle },
    success: { bg: "#F0FDF4", border: "#BBF7D0", color: "#166534", Icon: CheckCircle },
  }[type];
  return (
    <div className="flex items-start gap-2 mt-4 p-3 rounded-lg border text-xs font-medium"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
      <cfg.Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
        {cols.map(c => <th key={c} className="text-left px-4 py-2.5 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{c}</th>)}
      </tr>
    </thead>
  );
}

// ── Type-specific previews ───────────────────────────────────────────────────
function PreviewWastewater({ period }: { period: string }) {
  const rows = [
    { param: "pH",  unit: "–",    limit: "6 – 9",   result: 7.2, pass: true  },
    { param: "COD", unit: "mg/L", limit: "≤ 100",   result: 68,  pass: true  },
    { param: "BOD", unit: "mg/L", limit: "≤ 50",    result: 44,  pass: true  },
    { param: "TSS", unit: "mg/L", limit: "≤ 100",   result: 112, pass: false },
    { param: "NH₃", unit: "mg/L", limit: "≤ 10",    result: 3.1, pass: true  },
    { param: "TDS", unit: "mg/L", limit: "≤ 2000",  result: 854, pass: true  },
  ];
  return (
    <Card title="Effluent Quality Analysis" subtitle={`BAPEDAL Standard · ${period}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["Parameter","Unit","Limit","Result","Status"]} />
          <tbody>
            {rows.map(r => (
              <tr key={r.param} className="border-b border-[#E4EAF5] last:border-0">
                <td className="px-4 py-3 text-[#0D1B35] font-medium">{r.param}</td>
                <td className="px-4 py-3 text-[#6378A0]">{r.unit}</td>
                <td className="px-4 py-3 text-[#6378A0] font-mono">{r.limit}</td>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: r.pass ? "#0D1B35" : "#B91C1C" }}>{r.result}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${r.pass ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FEF2F2] text-[#B91C1C]"}`}>
                    {r.pass ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {r.pass ? "PASS" : "FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout type="warning" text="TSS exceeded allowable limit (112 mg/L vs 100 mg/L). Corrective action required before next BAPEDAL submission." />
    </Card>
  );
}

function PreviewEnergy({ period }: { period: string }) {
  const chartData = [
    { week: "Week 1", actual: 18420, baseline: 19000 },
    { week: "Week 2", actual: 21350, baseline: 19000 },
    { week: "Week 3", actual: 17800, baseline: 19000 },
    { week: "Week 4", actual: 20100, baseline: 19000 },
  ];
  return (
    <div className="space-y-5">
      <KpiGrid kpis={[
        { label: "Total Consumption", value: "77,670 kWh", delta: -3.8, unit: "vs last month" },
        { label: "Peak Demand",       value: "412 kW",     delta: +2.1, unit: "vs last month" },
        { label: "Load Factor",       value: "68.4%",      delta: +1.2, unit: "improvement"   },
        { label: "Energy Cost",       value: "Rp 94.2 M",  delta: -3.8, unit: "vs last month" },
      ]} />
      <Card title="Weekly Consumption vs Baseline" subtitle={`kWh · ${period}`}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF5" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6378A0" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6378A0" }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kWh`]} contentStyle={{ borderRadius: 10, border: "1px solid #D9E2F0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="actual" name="Actual" fill="#B8901A" radius={[4,4,0,0]} />
            <Bar dataKey="baseline" name="Baseline" fill="#D9E2F0" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function PreviewCalibration({ period }: { period: string }) {
  const sensors = [
    { name: "pH Sensor S-101",    last: "2026-02-14", next: "2026-05-14", cert: "CERT-2024-081", status: "overdue"  },
    { name: "Flow Meter F-204",   last: "2026-03-01", next: "2026-06-01", cert: "CERT-2024-117", status: "due_soon" },
    { name: "DO Sensor D-303",    last: "2026-04-10", next: "2026-07-10", cert: "CERT-2025-042", status: "ok"       },
    { name: "Pressure PT-401",    last: "2026-01-20", next: "2026-07-20", cert: "CERT-2025-009", status: "ok"       },
    { name: "Temp. Sensor T-502", last: "2026-03-15", next: "2026-06-15", cert: "CERT-2025-028", status: "due_soon" },
    { name: "COD Analyzer A-601", last: "2026-04-01", next: "2026-10-01", cert: "CERT-2025-033", status: "ok"       },
  ];
  const badge: Record<string, { bg: string; text: string; label: string }> = {
    overdue:  { bg: "#FEF2F2", text: "#B91C1C", label: "Overdue"  },
    due_soon: { bg: "#FFFBEB", text: "#B45309", label: "Due Soon" },
    ok:       { bg: "#F0FDF4", text: "#166534", label: "OK"       },
  };
  return (
    <Card title="Calibration Schedule" subtitle={`Period: ${period}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["Sensor","Last Calibration","Next Due","Certificate","Status"]} />
          <tbody>
            {sensors.map(s => {
              const b = badge[s.status];
              return (
                <tr key={s.name} className="border-b border-[#E4EAF5] last:border-0">
                  <td className="px-4 py-3 text-[#0D1B35] font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-[#6378A0] font-mono text-xs">{s.last}</td>
                  <td className="px-4 py-3 text-[#6378A0] font-mono text-xs">{s.next}</td>
                  <td className="px-4 py-3 text-[#6378A0] font-mono text-xs">{s.cert}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: b.bg, color: b.text }}>{b.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PreviewScorecard({ period }: { period: string }) {
  const sites = [
    { name: "Bekasi Industrial Park",      energy: 77670,  water: 4820,  score: 94, rank: 1 },
    { name: "PDAM Patriot Bekasi",         energy: 12300,  water: 89200, score: 87, rank: 2 },
    { name: "Kawasan Industri MM2100",     energy: 134000, water: 7600,  score: 81, rank: 3 },
  ];
  return (
    <div className="space-y-5">
      <KpiGrid kpis={[
        { label: "Total Energy Cost",  value: "Rp 312 M",     delta: -2.4, unit: "vs last period" },
        { label: "Total Water Cost",   value: "Rp 48.6 M",    delta: +1.1, unit: "vs last period" },
        { label: "Carbon Intensity",   value: "0.87 tCO₂/MWh",delta: -3.2, unit: "improvement"   },
        { label: "Compliance Score",   value: "96.4%",         delta: +0.8, unit: "vs last period" },
      ]} />
      <Card title="Site Performance Rankings" subtitle={`Overall score · ${period}`}>
        {sites.map((s, i) => (
          <div key={s.name} className="flex items-center gap-4 py-3 border-b border-[#E4EAF5] last:border-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: i === 0 ? "#FEF7E6" : "#F2F5FB", color: i === 0 ? "#B8901A" : "#6378A0" }}>{s.rank}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[#0D1B35] font-medium text-sm truncate">{s.name}</p>
              <p className="text-[#6378A0] text-xs">{s.energy.toLocaleString()} kWh · {s.water.toLocaleString()} m³</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-28 h-2 bg-[#E4EAF5] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: i === 0 ? "#B8901A" : "#60A5FA" }} />
              </div>
              <span className="text-[#0D1B35] font-bold text-sm w-8 text-right">{s.score}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PreviewCostAllocation() {
  const depts = [
    { dept: "Production Line A",    energy: 38400000, water: 12200000, gas: 5400000  },
    { dept: "Production Line B",    energy: 29700000, water: 8900000,  gas: 4100000  },
    { dept: "Utilities & HVAC",     energy: 18200000, water: 3400000,  gas: 11200000 },
    { dept: "Wastewater Treatment", energy: 7800000,  water: 1200000,  gas: 900000   },
    { dept: "Office & Admin",       energy: 3200000,  water: 890000,   gas: 200000   },
  ];
  const fmt = (v: number) => `Rp ${(v/1e6).toFixed(1)}M`;
  const grandTotal = depts.reduce((s, d) => s + d.energy + d.water + d.gas, 0);
  return (
    <Card title="Cost Allocation by Department" subtitle="All figures in IDR">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["Department","Energy","Water","Gas","Total"]} />
          <tbody>
            {depts.map(d => {
              const tot = d.energy + d.water + d.gas;
              return (
                <tr key={d.dept} className="border-b border-[#E4EAF5] last:border-0">
                  <td className="px-4 py-3 text-[#0D1B35] font-medium">{d.dept}</td>
                  <td className="px-4 py-3 text-[#B45309] font-mono">{fmt(d.energy)}</td>
                  <td className="px-4 py-3 text-[#1E5FA8] font-mono">{fmt(d.water)}</td>
                  <td className="px-4 py-3 text-[#166534] font-mono">{fmt(d.gas)}</td>
                  <td className="px-4 py-3 text-[#0D1B35] font-bold font-mono">{fmt(tot)}</td>
                </tr>
              );
            })}
            <tr className="bg-[#F2F5FB]">
              <td className="px-4 py-3 text-[#0D1B35] font-bold">Grand Total</td>
              <td colSpan={3} />
              <td className="px-4 py-3 text-[#0D1B35] font-black font-mono">{fmt(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PreviewEmissions({ period }: { period: string }) {
  const months = ["Jan","Feb","Mar","Apr"].map((m, i) => ({
    month: m, location: [62.1,58.4,66.2,61.8][i], market: [54.3,51.2,58.1,53.9][i],
  }));
  return (
    <div className="space-y-5">
      <KpiGrid kpis={[
        { label: "Total (Location)", value: "248.5 tCO₂e", delta: -4.2, unit: "vs prior period"  },
        { label: "Total (Market)",   value: "217.5 tCO₂e", delta: -5.1, unit: "vs prior period"  },
        { label: "Emission Factor",  value: "0.87 kg/kWh",  delta: -1.1, unit: "PLN grid 2026"   },
        { label: "Renewable Share",  value: "12.4%",         delta: +2.3, unit: "improvement"     },
      ]} />
      <Card title="Monthly GHG Emissions" subtitle={`tCO₂e · ${period}`}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF5" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6378A0" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6378A0" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #D9E2F0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="location" name="Location-based" stroke="#B91C1C" strokeWidth={2} dot={{ r: 4 }} />
            <Line dataKey="market"   name="Market-based"   stroke="#166534" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function PreviewOperations({ period }: { period: string }) {
  const alerts = [
    { time: "06:14", asset: "Pump P-201",     sev: "HIGH",   msg: "Vibration exceeded threshold (4.8 mm/s)" },
    { time: "09:32", asset: "Chiller CH-01",  sev: "MEDIUM", msg: "Condenser approach temp +3°C above setpoint" },
    { time: "14:05", asset: "Compressor K-3", sev: "LOW",    msg: "Filter ΔP approaching maintenance limit" },
  ];
  const sevStyle: Record<string, { bg: string; text: string }> = {
    HIGH:   { bg: "#FFFBEB", text: "#B45309" },
    MEDIUM: { bg: "#EFF6FF", text: "#1E5FA8" },
    LOW:    { bg: "#F2F5FB", text: "#6378A0" },
  };
  return (
    <div className="space-y-5">
      <KpiGrid kpis={[
        { label: "Assets Online",  value: "94 / 97",    delta: -3,   unit: "assets"       },
        { label: "Alerts Raised",  value: "3",           delta: +1,   unit: "vs yesterday" },
        { label: "Energy Today",   value: "18,420 kWh",  delta: -2.1, unit: "vs 7-day avg" },
        { label: "Water Today",    value: "1,204 m³",    delta: +0.8, unit: "vs 7-day avg" },
      ]} />
      <Card title="Alerts Raised" subtitle={`Shift handover · ${period}`}>
        {alerts.map(a => {
          const ss = sevStyle[a.sev] ?? sevStyle.LOW;
          return (
            <div key={a.time} className="flex items-start gap-3 py-3 border-b border-[#E4EAF5] last:border-0">
              <span className="text-[#6378A0] font-mono text-xs mt-0.5 w-10 flex-shrink-0">{a.time}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: ss.bg, color: ss.text }}>{a.sev}</span>
              <div>
                <p className="text-[#0D1B35] text-sm font-medium">{a.asset}</p>
                <p className="text-[#6378A0] text-xs">{a.msg}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function PreviewPeakDemand({ period }: { period: string }) {
  const events = [
    { date: "Apr 03", time: "14:15", demand: 412, tariff: "WBP",  cost: "Rp 1.84 M" },
    { date: "Apr 10", time: "13:58", demand: 398, tariff: "WBP",  cost: "Rp 1.78 M" },
    { date: "Apr 17", time: "14:32", demand: 421, tariff: "WBP",  cost: "Rp 1.88 M" },
    { date: "Apr 24", time: "09:12", demand: 387, tariff: "LWBP", cost: "Rp 0.93 M" },
  ];
  return (
    <Card title="Peak Demand Events" subtitle={`WBP = On-Peak Tariff · ${period}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <THead cols={["Date","Time","Peak Demand","Tariff Zone","Cost Impact"]} />
          <tbody>
            {events.map(e => (
              <tr key={e.date+e.time} className="border-b border-[#E4EAF5] last:border-0">
                <td className="px-4 py-3 text-[#0D1B35] font-medium">{e.date}</td>
                <td className="px-4 py-3 text-[#6378A0] font-mono text-xs">{e.time}</td>
                <td className="px-4 py-3 text-[#B91C1C] font-mono font-bold">{e.demand} kW</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.tariff === "WBP" ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#F0FDF4] text-[#166534]"}`}>{e.tariff}</span>
                </td>
                <td className="px-4 py-3 text-[#0D1B35] font-semibold">{e.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout type="info" text="Recommendation: Shifting 15% of peak demand to LWBP hours could save ~Rp 3.2M/month." />
    </Card>
  );
}

function PreviewWaterBalance({ period }: { period: string }) {
  const rows = [
    { label: "Bulk Supply (PDAM Meter)",     value: "89,200 m³" },
    { label: "Treated & Distributed",         value: "86,450 m³" },
    { label: "Metered Consumption",           value: "81,300 m³" },
    { label: "Unmetered Authorized Use",      value:  "2,100 m³" },
    { label: "Non-Revenue Water (NRW)",       value:  "3,050 m³" },
    { label: "NRW %",                         value:     "3.42%" },
  ];
  return (
    <Card title="Water Balance Summary" subtitle={`PDAM Patriot Bekasi · ${period}`}>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-[#E4EAF5] last:border-0">
          <span className="text-[#6378A0] text-sm">{r.label}</span>
          <span className="text-[#0D1B35] font-bold font-mono text-sm">{r.value}</span>
        </div>
      ))}
      <Callout type="success" text="NRW of 3.42% is within the 5% target. Minor losses attributed to authorized flushing and meter tolerance." />
    </Card>
  );
}

function PreviewSafety({ period }: { period: string }) {
  const incidents = [
    { date: "Apr 07", loc: "Compressor Room K-3", exposure: "CH₄ 18% LEL", duration: "4 min",  action: "Ventilated, source sealed" },
    { date: "Apr 19", loc: "Gas Manifold Area",    exposure: "H₂S 2.1 ppm", duration: "12 min", action: "Evacuation, LDAR repair"   },
  ];
  return (
    <div className="space-y-5">
      <KpiGrid kpis={[
        { label: "Total Incidents",    value: "2",        delta: 0, unit: "this period"         },
        { label: "Lost Time Injuries", value: "0",        delta: 0, unit: "LTI-free days: 142"  },
        { label: "Repairs Completed",  value: "2 / 2",    delta: 0, unit: "open items: 0"       },
        { label: "Next Inspection",    value: "Jun 2026", delta: 0, unit: "scheduled"           },
      ]} />
      <Card title="Incident Log" subtitle={`OSHA 1910.146 / Confined Space · ${period}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <THead cols={["Date","Location","Exposure","Duration","Action Taken"]} />
            <tbody>
              {incidents.map(i => (
                <tr key={i.date} className="border-b border-[#E4EAF5] last:border-0">
                  <td className="px-4 py-3 text-[#0D1B35] font-medium">{i.date}</td>
                  <td className="px-4 py-3 text-[#6378A0]">{i.loc}</td>
                  <td className="px-4 py-3 text-[#B91C1C] font-mono font-semibold">{i.exposure}</td>
                  <td className="px-4 py-3 text-[#6378A0]">{i.duration}</td>
                  <td className="px-4 py-3 text-[#0D1B35]">{i.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReportPreview({ type, period }: { type: string; period: string }) {
  if (type === "wastewater_compliance") return <PreviewWastewater period={period} />;
  if (type === "monthly_energy" || type === "iso50001_evidence" || type === "weekly_variance" || type === "energy_benchmark") return <PreviewEnergy period={period} />;
  if (type === "calibration_status") return <PreviewCalibration period={period} />;
  if (type === "monthly_scorecard" || type === "quarterly_board") return <PreviewScorecard period={period} />;
  if (type === "cost_allocation") return <PreviewCostAllocation />;
  if (type === "scope2_emissions") return <PreviewEmissions period={period} />;
  if (type === "daily_operations") return <PreviewOperations period={period} />;
  if (type === "peak_demand_analysis") return <PreviewPeakDemand period={period} />;
  if (type === "water_balance") return <PreviewWaterBalance period={period} />;
  if (type === "worker_safety" || type === "gas_ldar_incident") return <PreviewSafety period={period} />;
  return (
    <div className="py-16 text-center bg-white border border-[#D9E2F0] rounded-xl shadow-sm">
      <FileText className="w-12 h-12 text-[#D9E2F0] mx-auto mb-3" />
      <p className="text-[#6378A0] text-sm">Preview not available for this report type</p>
      <p className="text-[#6378A0] text-xs mt-1">Download the report to view full content</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(d => { if (d) { setReport(d); setLoading(false); } });
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#6378A0] text-sm">Loading report…</p>
        </div>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 text-[#D9E2F0] mx-auto" />
          <p className="text-[#0D1B35] font-semibold">Report not found</p>
          <button onClick={() => router.push("/reports")} className="text-sm text-[#B8901A] hover:underline">← Back to reports</button>
        </div>
      </div>
    );
  }

  const meta = CATALOG[report.reportType] ?? {
    label: report.reportType, category: "Operations", description: "", formats: ["PDF"], icon: FileText, color: "#6378A0", roles: "",
  };
  const Icon = meta.icon;
  const cs = categoryStyle[meta.category] ?? { bg: "#F2F5FB", text: "#6378A0" };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => router.push("/reports")}
        className="inline-flex items-center gap-1.5 text-sm text-[#6378A0] hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Report Center
      </button>

      {/* Header */}
      <div className="bg-white border border-[#D9E2F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cs.bg }}>
              <Icon className="w-6 h-6" style={{ color: meta.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>{meta.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === "ready" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
                  {report.status === "ready" ? "Ready" : "Processing"}
                </span>
              </div>
              <h1 className="text-[#0D1B35] text-xl font-bold leading-tight">{report.title}</h1>
              <p className="text-[#6378A0] text-sm mt-0.5">{meta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#6378A0] border border-[#D9E2F0] hover:bg-[#F2F5FB] transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {meta.formats.map(fmt => {
              const fb = formatBadge[fmt] ?? formatBadge.PDF;
              return (
                <button key={fmt} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#D9E2F0] hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: fb.bg, color: fb.text }}>
                  <Download className="w-3.5 h-3.5" /> {fmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-5 pt-5 border-t border-[#E4EAF5] grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Period",       Icon: Calendar,   value: report.period },
            { label: "Generated by", Icon: User,       value: report.generator?.name ?? "System" },
            { label: "Role",         Icon: ShieldCheck, value: (report.generator?.role ?? "SYSTEM").replace(/_/g, " ") },
            { label: "Created",      Icon: Clock,      value: format(new Date(report.createdAt), "MMM d, yyyy HH:mm") },
          ].map(({ label, Icon: MIcon, value }) => (
            <div key={label}>
              <p className="text-[#6378A0] text-xs flex items-center gap-1 mb-0.5"><MIcon className="w-3 h-3" />{label}</p>
              <p className="text-[#0D1B35] text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {/* Parameters */}
        {report.parameters && Object.keys(report.parameters).length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E4EAF5]">
            <p className="text-[#6378A0] text-xs font-semibold uppercase tracking-wider mb-2">Parameters</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.parameters).map(([k, v]) => (
                <span key={k} className="text-xs px-2 py-1 rounded-lg bg-[#F2F5FB] border border-[#D9E2F0] text-[#3D5280]">
                  <span className="font-semibold text-[#0D1B35]">{k}:</span> {String(v)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[#0D1B35] font-bold">Report Preview</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF7E6] text-[#B8901A] font-semibold border border-[#FDE68A]">PREVIEW</span>
        </div>
        <ReportPreview type={report.reportType} period={report.period} />
      </div>
    </div>
  );
}
