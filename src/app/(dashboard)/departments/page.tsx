"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Search, Plus, Pencil, Trash2, ChevronDown, Layers, MapPin } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  buildingId: string;
  building: { name: string; site: { name: string } };
  _count: { bagians: number };
}

interface Building {
  id: string;
  name: string;
  site: { name: string };
}

const LABEL_CLS = "block text-xs font-semibold text-[#3D5280] mb-1";
const INPUT_CLS =
  "w-full border border-[#D9E2F0] rounded-lg px-3 py-2 text-sm text-[#0D1B35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] transition-colors";

const CARD_COLORS = [
  { bg: "#FEF7E6", border: "#F5E6B5", icon: "#B8901A", dot: "#B8901A" },
  { bg: "#EFF6FF", border: "#BFDBFE", icon: "#1E5FA8", dot: "#1E5FA8" },
  { bg: "#F0FDF4", border: "#BBF7D0", icon: "#166534", dot: "#22C55E" },
  { bg: "#F5F3FF", border: "#DDD6FE", icon: "#6D28D9", dot: "#7C3AED" },
  { bg: "#FFF7ED", border: "#FED7AA", icon: "#C2410C", dot: "#F97316" },
  { bg: "#F0FDFA", border: "#99F6E4", icon: "#0F766E", dot: "#14B8A6" },
];

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", buildingId: "" });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/departments");
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }, []);

  const loadBuildings = useCallback(async () => {
    const r = await fetch("/api/buildings");
    if (r.ok) setBuildings(await r.json());
  }, []);

  useEffect(() => { load(); loadBuildings(); }, [load, loadBuildings]);

  const filtered = items.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      d.building.name.toLowerCase().includes(search.toLowerCase()) ||
      d.building.site.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditing(null);
    setForm({ name: "", code: "", description: "", buildingId: buildings[0]?.id ?? "" });
    setModalOpen(true);
  }

  function openEdit(d: Department) {
    setEditing(d);
    setForm({ name: d.name, code: d.code ?? "", description: d.description ?? "", buildingId: d.buildingId });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.buildingId) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/departments/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, code: form.code || null, description: form.description || null }),
        });
      } else {
        await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buildingId: form.buildingId, name: form.name, code: form.code || null, description: form.description || null }),
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
      await fetch(`/api/departments/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  const totalBagians = items.reduce((s, d) => s + d._count.bagians, 0);

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
            <span className="text-[#B8901A] font-semibold">Departments</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#B8901A]" />
              </div>
              <div>
                <h1 className="text-[#0D1B35] text-2xl font-bold tracking-tight">Departments</h1>
                <p className="text-[#6378A0] text-sm mt-0.5">Organizational units within buildings</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#0F1C3F] hover:bg-[#162444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Department
            </button>
          </div>

          {/* Stat strip */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[#E4EAF5]">
            {[
              { label: "Total", value: items.length, color: "#0D1B35" },
              { label: "Buildings", value: new Set(items.map((d) => d.buildingId)).size, color: "#1E5FA8" },
              { label: "Sites", value: new Set(items.map((d) => d.building.site.name)).size, color: "#166534" },
              { label: "Bagians", value: totalBagians, color: "#B8901A" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color }}>{value}</span>
                <span className="text-[#6378A0] text-xs font-medium">{label}</span>
              </div>
            ))}
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6378A0]" />
              <input
                className="pl-8 pr-3 py-1.5 text-sm border border-[#D9E2F0] rounded-lg bg-[#F2F5FB] text-[#0D1B35] placeholder-[#6378A0] focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] w-52"
                placeholder="Search departments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-[#E4EAF5] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-[#B8901A]" />
            </div>
            <p className="text-[#0D1B35] font-semibold text-lg">No departments found</p>
            <p className="text-[#6378A0] text-sm mt-1">
              {search ? "Try a different search term" : "Create your first department to get started"}
            </p>
            {!search && (
              <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-[#0F1C3F] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Plus className="w-4 h-4" /> New Department
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d, i) => {
              const c = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <div
                  key={d.id}
                  className="group bg-white rounded-2xl border border-[#E4EAF5] hover:border-[#D0C08A] hover:shadow-lg hover:shadow-[#B8901A]/8 transition-all duration-200 overflow-hidden"
                >
                  {/* Color bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: c.dot }} />

                  <div className="p-5">
                    {/* Icon + name */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                      >
                        <Building2 className="w-5 h-5" style={{ color: c.icon }} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#1E5FA8] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(d)}
                          className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[#B91C1C] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-[#0D1B35] font-bold text-base leading-snug">{d.name}</h3>

                    {d.code && (
                      <span className="inline-block mt-1 font-mono text-[10px] bg-[#F2F5FB] border border-[#D9E2F0] px-1.5 py-0.5 rounded text-[#6378A0]">
                        {d.code}
                      </span>
                    )}

                    {d.description && (
                      <p className="text-[#6378A0] text-xs mt-2 line-clamp-2 leading-relaxed">{d.description}</p>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-[#E4EAF5] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#6378A0]" />
                        <span className="text-[#6378A0] text-xs truncate max-w-[120px]">
                          {d.building.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3" style={{ color: c.icon }} />
                        <span className="text-xs font-bold" style={{ color: c.icon }}>
                          {d._count.bagians} bagian{d._count.bagians !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <CrudModal title={editing ? "Edit Department" : "New Department"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Building *</label>
            <div className="relative">
              <select
                className={INPUT_CLS + " appearance-none pr-8"}
                value={form.buildingId}
                onChange={(e) => setForm((f) => ({ ...f, buildingId: e.target.value }))}
                disabled={!!editing}
              >
                <option value="">Select building…</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.site.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6378A0] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Name *</label>
            <input className={INPUT_CLS} placeholder="e.g. Engineering" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Code</label>
            <input className={INPUT_CLS} placeholder="e.g. ENG-01" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea className={INPUT_CLS + " resize-none"} rows={3} placeholder="Optional description…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6378A0] hover:bg-[#F2F5FB] transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.buildingId}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0F1C3F] hover:bg-[#162444] text-white transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Department"}
            </button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete "${deleteTarget?.name}"? All associated bagians and ruangans will also be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
