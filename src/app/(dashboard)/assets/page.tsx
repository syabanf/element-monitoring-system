"use client";
import { useEffect, useState } from "react";
import { Box, Plus, Pencil, Trash2, Search } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

type Asset = {
  id: string; name: string; code: string; assetType: string; pillar: string; status: string;
  manufacturer: string | null; model: string | null; serialNumber: string | null;
  siteId: string;
  site: { name: string; code: string };
  zone: { name: string } | null;
  _count: { sensors: number; alerts: number };
};

const PILLARS = ["ELECTRICITY","WATER","WASTEWATER","GAS_AIR","ENVIRONMENT","THERMAL_HVAC","COMPRESSED_AIR"];
const STATUSES = ["ACTIVE","INACTIVE","MAINTENANCE","DECOMMISSIONED"];
const ASSET_TYPES = ["Transformer","Motor","Pump","Compressor","Heat Exchanger","Boiler","Chiller","Generator","Panel","Meter","Sensor","Other"];

const pillarColors: Record<string, { bg: string; text: string; dot: string }> = {
  ELECTRICITY:    { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  WATER:          { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
  WASTEWATER:     { bg: "#F5F3FF", text: "#6D28D9", dot: "#6D28D9" },
  GAS_AIR:        { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  ENVIRONMENT:    { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
  THERMAL_HVAC:   { bg: "#FFF7ED", text: "#C2410C", dot: "#C2410C" },
  COMPRESSED_AIR: { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
};
const statusConfig: Record<string, { bg: string; text: string }> = {
  ACTIVE:          { bg: "#F0FDF4", text: "#166534" },
  INACTIVE:        { bg: "#F2F5FB", text: "#6378A0" },
  MAINTENANCE:     { bg: "#FFFBEB", text: "#B45309" },
  DECOMMISSIONED:  { bg: "#FEF2F2", text: "#B91C1C" },
};

const EMPTY: Partial<Asset> = { name: "", code: "", assetType: "Pump", pillar: "ELECTRICITY", status: "ACTIVE", siteId: "ste_1", manufacturer: "", model: "", serialNumber: "" };

export default function AssetsPage() {
  const [assets, setAssets]     = useState<Asset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterPillar, setFilterPillar] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [siteFilter, setSiteFilter]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | null>(null);
  const [form, setForm]         = useState<Partial<Asset>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { setLoading(true); fetch("/api/assets").then(r => r.json()).then(d => { setAssets(d); setLoading(false); }); };
  useEffect(load, []);

  const pillarCount = PILLARS.reduce((acc, p) => { acc[p] = assets.filter(a => a.pillar === p).length; return acc; }, {} as Record<string, number>);

  const uniqueSites = [...new Set(assets.map(a => a.site.name))].sort();

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase()) || a.site.name.toLowerCase().includes(search.toLowerCase());
    const matchPillar = !filterPillar || a.pillar === filterPillar;
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchSite   = !siteFilter || a.site.name === siteFilter;
    return matchSearch && matchPillar && matchStatus && matchSite;
  });

  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (a: Asset) => { setForm(a); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    const isEdit = modal === "edit";
    await fetch(isEdit ? `/api/assets/${form.id}` : "/api/assets", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false); setModal(null); load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    await fetch(`/api/assets/${delId}`, { method: "DELETE" });
    setDeleting(false); setDelId(null); load();
  };

  const inputCls = "w-full border border-[#D9E2F0] rounded-lg px-3 py-2 text-sm text-[#0D1B35] focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] bg-white";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><label className="text-xs font-semibold text-[#6378A0] uppercase tracking-wider">{label}</label>{children}</div>
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center">
            <Box className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#0D1B35] text-2xl font-bold">Asset Registry</h1>
            <p className="text-[#6378A0] text-sm">{assets.length} assets · {assets.filter(a => a.status === "ACTIVE").length} active</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B35] text-white text-sm font-semibold rounded-xl hover:bg-[#162040] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />New Asset
        </button>
      </div>

      {/* Pillar filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterPillar("")} className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${!filterPillar ? "bg-[#0D1B35] text-white border-[#0D1B35]" : "bg-white text-[#3D5280] border-[#D9E2F0] hover:border-[#B8901A]"}`}>All</button>
        {PILLARS.map(p => {
          const pc = pillarColors[p];
          const active = filterPillar === p;
          return (
            <button key={p} onClick={() => setFilterPillar(p === filterPillar ? "" : p)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors"
              style={active ? { backgroundColor: pc.dot, color: "#fff", borderColor: pc.dot } : { backgroundColor: pc.bg, color: pc.text, borderColor: "transparent" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? "#fff" : pc.dot }} />
              {p.replace(/_/g, " ")} <span className="font-bold">{pillarCount[p] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={siteFilter} onChange={e => setSiteFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All sites</option>
          {uniqueSites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || statusFilter || siteFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setSiteFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                {["Asset","Site","Pillar","Type","Sensors","Alerts","Status",""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6378A0]">Loading…</td></tr>
              ) : filtered.map(a => {
                const sc = statusConfig[a.status] ?? statusConfig.INACTIVE;
                const pc = pillarColors[a.pillar] ?? { bg: "#F2F5FB", text: "#6378A0", dot: "#6378A0" };
                return (
                  <tr key={a.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="text-[#0D1B35] text-sm font-semibold">{a.name}</p>
                      <p className="text-[#6378A0] text-xs font-mono">{a.code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#3D5280] text-sm">{a.site.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>{a.pillar.replace(/_/g," ")}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#3D5280] text-sm">{a.assetType}</td>
                    <td className="px-5 py-3.5 text-center text-[#0D1B35] text-sm font-medium">{a._count.sensors}</td>
                    <td className="px-5 py-3.5 text-center">
                      {a._count.alerts > 0 ? <span className="text-[#B91C1C] font-bold text-sm">{a._count.alerts}</span> : <span className="text-[#6378A0] text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <a href={`/assets/${a.id}`} className="text-[#B8901A] text-sm font-medium hover:underline whitespace-nowrap">View →</a>
                        <button onClick={() => openEdit(a)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#6378A0] hover:text-[#B8901A] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(a.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#6378A0] hover:text-[#B91C1C] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CrudModal title={modal === "edit" ? "Edit Asset" : "New Asset"} open={!!modal} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><input className={inputCls} value={form.name ?? ""} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Asset name" /></Field>
            <Field label="Code"><input className={inputCls} value={form.code ?? ""} onChange={e => setForm(f => ({...f, code: e.target.value}))} placeholder="e.g. EL-001" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pillar">
              <select className={inputCls} value={form.pillar ?? "ELECTRICITY"} onChange={e => setForm(f => ({...f, pillar: e.target.value}))}>
                {PILLARS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className={inputCls} value={form.assetType ?? "Pump"} onChange={e => setForm(f => ({...f, assetType: e.target.value}))}>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status ?? "ACTIVE"} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Manufacturer"><input className={inputCls} value={form.manufacturer ?? ""} onChange={e => setForm(f => ({...f, manufacturer: e.target.value}))} placeholder="e.g. ABB" /></Field>
            <Field label="Model"><input className={inputCls} value={form.model ?? ""} onChange={e => setForm(f => ({...f, model: e.target.value}))} placeholder="Model number" /></Field>
          </div>
          <Field label="Serial Number"><input className={inputCls} value={form.serialNumber ?? ""} onChange={e => setForm(f => ({...f, serialNumber: e.target.value}))} placeholder="Serial number" /></Field>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-[#D9E2F0] text-[#3D5280] text-sm font-medium hover:bg-[#F2F5FB] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#0D1B35] text-white text-sm font-semibold hover:bg-[#162040] disabled:opacity-50 transition-colors">{saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Asset"}</button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog open={!!delId} message="This asset will be decommissioned. Are you sure?" onConfirm={confirmDelete} onCancel={() => setDelId(null)} loading={deleting} />
    </div>
  );
}
