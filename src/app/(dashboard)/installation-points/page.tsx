"use client";

import { useEffect, useState, useCallback } from "react";
import { Cpu, Search, Plus, Pencil, Trash2, ChevronDown, MapPin, Zap, Droplets, Wind, Leaf, Thermometer, Gauge } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

const PILLARS = ["ELECTRICITY", "WATER", "WASTEWATER", "GAS_AIR", "ENVIRONMENT", "THERMAL_HVAC", "COMPRESSED_AIR"] as const;
type Pillar = (typeof PILLARS)[number];

const PILLAR_META: Record<Pillar, { label: string; icon: React.ElementType; bg: string; text: string; border: string; dot: string }> = {
  ELECTRICITY:    { label: "Electricity",     icon: Zap,         bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" },
  WATER:          { label: "Water",           icon: Droplets,    bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE", dot: "#3B82F6" },
  WASTEWATER:     { label: "Wastewater",      icon: Droplets,    bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", dot: "#22C55E" },
  GAS_AIR:        { label: "Gas / Air",       icon: Wind,        bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" },
  ENVIRONMENT:    { label: "Environment",     icon: Leaf,        bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#7C3AED" },
  THERMAL_HVAC:   { label: "Thermal / HVAC",  icon: Thermometer, bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", dot: "#F97316" },
  COMPRESSED_AIR: { label: "Compressed Air",  icon: Gauge,       bg: "#F0FDFA", text: "#0F766E", border: "#99F6E4", dot: "#14B8A6" },
};

interface InstallationPoint {
  id: string;
  name: string;
  code: string | null;
  pillar: Pillar;
  description: string | null;
  isActive: boolean;
  ruanganId: string;
  ruangan: {
    name: string;
    bagian: { name: string; department: { name: string; building: { name: string; site: { name: string } } } };
  };
}

interface Ruangan {
  id: string;
  name: string;
  bagian: { name: string; department: { name: string } };
}

const LABEL_CLS = "block text-xs font-semibold text-[#3D5280] mb-1";
const INPUT_CLS =
  "w-full border border-[#D9E2F0] rounded-lg px-3 py-2 text-sm text-[#0D1B35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] transition-colors";

export default function InstallationPointsPage() {
  const [items, setItems] = useState<InstallationPoint[]>([]);
  const [ruangans, setRuangans] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pillarFilter, setPillarFilter] = useState<Pillar | "ALL">("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InstallationPoint | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", pillar: "ELECTRICITY" as Pillar, ruanganId: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<InstallationPoint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/installation-points");
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }, []);

  const loadRuangans = useCallback(async () => {
    const r = await fetch("/api/ruangans");
    if (r.ok) setRuangans(await r.json());
  }, []);

  useEffect(() => { load(); loadRuangans(); }, [load, loadRuangans]);

  const filtered = items.filter((ip) => {
    const matchSearch =
      ip.name.toLowerCase().includes(search.toLowerCase()) ||
      (ip.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      ip.ruangan.name.toLowerCase().includes(search.toLowerCase()) ||
      ip.ruangan.bagian.name.toLowerCase().includes(search.toLowerCase());
    const matchPillar = pillarFilter === "ALL" || ip.pillar === pillarFilter;
    return matchSearch && matchPillar;
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", code: "", description: "", pillar: "ELECTRICITY", ruanganId: ruangans[0]?.id ?? "", isActive: true });
    setModalOpen(true);
  }

  function openEdit(ip: InstallationPoint) {
    setEditing(ip);
    setForm({ name: ip.name, code: ip.code ?? "", description: ip.description ?? "", pillar: ip.pillar, ruanganId: ip.ruanganId, isActive: ip.isActive });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.ruanganId) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/installation-points/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, code: form.code || null, description: form.description || null, pillar: form.pillar, isActive: form.isActive }),
        });
      } else {
        await fetch("/api/installation-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruanganId: form.ruanganId, name: form.name, code: form.code || null, description: form.description || null, pillar: form.pillar, isActive: form.isActive }),
        });
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/installation-points/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F2F5FB]">
      {/* Hero header */}
      <div className="bg-white border-b border-[#D9E2F0]">
        <div className="px-6 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#6378A0] mb-3">
            <MapPin className="w-3 h-3" />
            <span>Sites</span>
            <span className="text-[#D9E2F0]">/</span>
            <span>Buildings</span>
            <span className="text-[#D9E2F0]">/</span>
            <span>Departments</span>
            <span className="text-[#D9E2F0]">/</span>
            <span>Bagians</span>
            <span className="text-[#D9E2F0]">/</span>
            <span>Ruangans</span>
            <span className="text-[#D9E2F0]">/</span>
            <span className="text-[#B8901A] font-semibold">Installation Points</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
                <Cpu className="w-6 h-6 text-[#B8901A]" />
              </div>
              <div>
                <h1 className="text-[#0D1B35] text-2xl font-bold tracking-tight">Installation Points</h1>
                <p className="text-[#6378A0] text-sm mt-0.5">Physical monitoring locations across all sites</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#0F1C3F] hover:bg-[#162444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Point
            </button>
          </div>

          {/* Stat strip */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[#E4EAF5]">
            {[
              { label: "Total", value: items.length, color: "#0D1B35" },
              { label: "Active", value: items.filter((ip) => ip.isActive).length, color: "#166534" },
              { label: "Inactive", value: items.filter((ip) => !ip.isActive).length, color: "#6378A0" },
              { label: "Pillar types", value: new Set(items.map((ip) => ip.pillar)).size, color: "#B8901A" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color }}>{value}</span>
                <span className="text-[#6378A0] text-xs font-medium">{label}</span>
              </div>
            ))}
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6378A0]" />
              <input
                className="pl-8 pr-3 py-1.5 text-sm border border-[#D9E2F0] rounded-lg bg-[#F2F5FB] text-[#0D1B35] placeholder-[#6378A0] focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] w-56"
                placeholder="Search installation points…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Pillar filter tabs */}
        <div className="px-6 flex items-center gap-0 overflow-x-auto">
          <button
            onClick={() => setPillarFilter("ALL")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              pillarFilter === "ALL" ? "border-[#B8901A] text-[#B8901A]" : "border-transparent text-[#6378A0] hover:text-[#3D5280]"
            }`}
          >
            All ({items.length})
          </button>
          {PILLARS.map((p) => {
            const m = PILLAR_META[p];
            const count = items.filter((ip) => ip.pillar === p).length;
            if (count === 0) return null;
            return (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  pillarFilter === p ? "border-b-2 text-[#0D1B35]" : "border-transparent text-[#6378A0] hover:text-[#3D5280]"
                }`}
                style={pillarFilter === p ? { borderBottomColor: m.dot } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
                {m.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-[#E4EAF5] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center mb-4">
              <Cpu className="w-8 h-8 text-[#B8901A]" />
            </div>
            <p className="text-[#0D1B35] font-semibold text-lg">No installation points found</p>
            <p className="text-[#6378A0] text-sm mt-1">
              {search || pillarFilter !== "ALL" ? "Try adjusting your search or filter" : "Create your first installation point"}
            </p>
            {!search && pillarFilter === "ALL" && (
              <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-[#0F1C3F] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Plus className="w-4 h-4" /> New Point
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E4EAF5] overflow-hidden shadow-sm">
            <div className="divide-y divide-[#F2F5FB]">
              {filtered.map((ip) => {
                const m = PILLAR_META[ip.pillar];
                const PillarIcon = m.icon;
                return (
                  <div
                    key={ip.id}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFD] transition-colors"
                  >
                    {/* Pillar color bar */}
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: m.dot }} />

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: m.bg, border: `1px solid ${m.border}` }}
                    >
                      <PillarIcon className="w-4 h-4" style={{ color: m.icon }} />
                    </div>

                    {/* Name + code */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#0D1B35] font-semibold text-sm">{ip.name}</span>
                        {ip.code && (
                          <span className="font-mono text-[10px] bg-[#F2F5FB] border border-[#D9E2F0] px-1.5 py-0.5 rounded text-[#6378A0]">
                            {ip.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#6378A0] text-xs">{ip.ruangan.name}</span>
                        <span className="text-[#D9E2F0]">·</span>
                        <span className="text-[#6378A0] text-xs">{ip.ruangan.bagian.name}</span>
                        <span className="text-[#D9E2F0]">·</span>
                        <span className="text-[#6378A0] text-xs">{ip.ruangan.bagian.department.building.site.name}</span>
                      </div>
                    </div>

                    {/* Pillar badge */}
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border flex-shrink-0"
                      style={{ backgroundColor: m.bg, color: m.text, borderColor: m.border }}
                    >
                      {m.label}
                    </span>

                    {/* Status */}
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex-shrink-0"
                      style={ip.isActive
                        ? { backgroundColor: "#F0FDF4", color: "#166534" }
                        : { backgroundColor: "#F2F5FB", color: "#6378A0" }
                      }
                    >
                      {ip.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEdit(ip)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#1E5FA8] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(ip)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[#B91C1C] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[#E4EAF5] bg-[#F8FAFD]">
              <p className="text-[#6378A0] text-xs">Showing {filtered.length} of {items.length} installation points</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <CrudModal
        title={editing ? "Edit Installation Point" : "New Installation Point"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Ruangan *</label>
            <div className="relative">
              <select
                className={INPUT_CLS + " appearance-none pr-8"}
                value={form.ruanganId}
                onChange={(e) => setForm((f) => ({ ...f, ruanganId: e.target.value }))}
                disabled={!!editing}
              >
                <option value="">Select ruangan…</option>
                {ruangans.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} — {r.bagian.name} / {r.bagian.department.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6378A0] pointer-events-none" />
            </div>
          </div>

          {/* Pillar visual picker */}
          <div>
            <label className={LABEL_CLS}>Pillar *</label>
            <div className="grid grid-cols-2 gap-2">
              {PILLARS.map((p) => {
                const m = PILLAR_META[p];
                const PillarIcon = m.icon;
                const sel = form.pillar === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, pillar: p }))}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
                    style={sel
                      ? { backgroundColor: m.bg, borderColor: m.dot, color: m.text, boxShadow: `0 0 0 2px ${m.dot}40` }
                      : { backgroundColor: "#F8FAFD", borderColor: "#E4EAF5", color: "#6378A0" }
                    }
                  >
                    <PillarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Name *</label>
            <input className={INPUT_CLS} placeholder="e.g. Panel MCC-01" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Code</label>
            <input className={INPUT_CLS} placeholder="e.g. IP-MCC-001" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea className={INPUT_CLS + " resize-none"} rows={2} placeholder="Optional…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-3 bg-[#F8FAFD] rounded-xl border border-[#E4EAF5]">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isActive ? "bg-[#22C55E]" : "bg-[#D9E2F0]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <div>
              <p className="text-sm text-[#0D1B35] font-semibold">{form.isActive ? "Active" : "Inactive"}</p>
              <p className="text-[10px] text-[#6378A0]">
                {form.isActive ? "Sensors can be assigned to this point" : "Point is disabled and hidden from monitoring"}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6378A0] hover:bg-[#F2F5FB] transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.ruanganId}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0F1C3F] hover:bg-[#162444] text-white transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Point"}
            </button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
