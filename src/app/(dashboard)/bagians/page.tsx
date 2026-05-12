"use client";

import { useEffect, useState, useCallback } from "react";
import { Layers, Search, Plus, Pencil, Trash2, ChevronDown, Building2, MapPin, DoorOpen } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

interface Bagian {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  departmentId: string;
  department: { name: string; building: { name: string; site: { name: string } } };
  _count: { ruangans: number };
}

interface Department {
  id: string;
  name: string;
  building: { name: string; site: { name: string } };
}

const LABEL_CLS = "block text-xs font-semibold text-[#3D5280] mb-1";
const INPUT_CLS =
  "w-full border border-[#D9E2F0] rounded-lg px-3 py-2 text-sm text-[#0D1B35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] transition-colors";

const CARD_COLORS = [
  { bg: "#FEF7E6", border: "#F5E6B5", icon: "#B8901A", dot: "#B8901A" },
  { bg: "#EFF6FF", border: "#BFDBFE", icon: "#1E5FA8", dot: "#3B82F6" },
  { bg: "#F0FDF4", border: "#BBF7D0", icon: "#166534", dot: "#22C55E" },
  { bg: "#F5F3FF", border: "#DDD6FE", icon: "#6D28D9", dot: "#7C3AED" },
  { bg: "#FFF7ED", border: "#FED7AA", icon: "#C2410C", dot: "#F97316" },
  { bg: "#F0FDFA", border: "#99F6E4", icon: "#0F766E", dot: "#14B8A6" },
  { bg: "#FDF2F8", border: "#F9A8D4", icon: "#9D174D", dot: "#EC4899" },
  { bg: "#FFFBEB", border: "#FDE68A", icon: "#92400E", dot: "#F59E0B" },
];

export default function BagiansPage() {
  const [items, setItems] = useState<Bagian[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bagian | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", departmentId: "" });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Bagian | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/bagians");
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }, []);

  const loadDepts = useCallback(async () => {
    const r = await fetch("/api/departments");
    if (r.ok) setDepartments(await r.json());
  }, []);

  useEffect(() => { load(); loadDepts(); }, [load, loadDepts]);

  const filtered = items.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      b.department.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "ALL" || b.departmentId === deptFilter;
    return matchSearch && matchDept;
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", code: "", description: "", departmentId: departments[0]?.id ?? "" });
    setModalOpen(true);
  }

  function openEdit(b: Bagian) {
    setEditing(b);
    setForm({ name: b.name, code: b.code ?? "", description: b.description ?? "", departmentId: b.departmentId });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.departmentId) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/bagians/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, code: form.code || null, description: form.description || null }),
        });
      } else {
        await fetch("/api/bagians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ departmentId: form.departmentId, name: form.name, code: form.code || null, description: form.description || null }),
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
      await fetch(`/api/bagians/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  const uniqueDepts = Array.from(new Map(items.map((b) => [b.departmentId, b.department.name])));

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
            <span className="text-[#B8901A] font-semibold">Bagians</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-[#1E5FA8]" />
              </div>
              <div>
                <h1 className="text-[#0D1B35] text-2xl font-bold tracking-tight">Bagians</h1>
                <p className="text-[#6378A0] text-sm mt-0.5">Sub-divisions within departments</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#0F1C3F] hover:bg-[#162444] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Bagian
            </button>
          </div>

          {/* Stat strip */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-[#E4EAF5]">
            {[
              { label: "Total", value: items.length, color: "#0D1B35" },
              { label: "Departments", value: new Set(items.map((b) => b.departmentId)).size, color: "#1E5FA8" },
              { label: "Buildings", value: new Set(items.map((b) => b.department.building.name)).size, color: "#166534" },
              { label: "Ruangans", value: items.reduce((s, b) => s + b._count.ruangans, 0), color: "#B8901A" },
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
                placeholder="Search bagians…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Department filter tabs */}
        {uniqueDepts.length > 0 && (
          <div className="px-6 pb-0 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setDeptFilter("ALL")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                deptFilter === "ALL"
                  ? "border-[#B8901A] text-[#B8901A]"
                  : "border-transparent text-[#6378A0] hover:text-[#3D5280]"
              }`}
            >
              All departments
            </button>
            {uniqueDepts.map(([id, name]) => (
              <button
                key={id}
                onClick={() => setDeptFilter(id)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  deptFilter === id
                    ? "border-[#B8901A] text-[#B8901A]"
                    : "border-transparent text-[#6378A0] hover:text-[#3D5280]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
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
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-[#1E5FA8]" />
            </div>
            <p className="text-[#0D1B35] font-semibold text-lg">No bagians found</p>
            <p className="text-[#6378A0] text-sm mt-1">
              {search || deptFilter !== "ALL" ? "Try adjusting your filter" : "Create your first bagian to get started"}
            </p>
            {!search && deptFilter === "ALL" && (
              <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-[#0F1C3F] text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <Plus className="w-4 h-4" /> New Bagian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((b, i) => {
              const c = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <div
                  key={b.id}
                  className="group bg-white rounded-2xl border border-[#E4EAF5] hover:border-[#D0C08A] hover:shadow-lg hover:shadow-[#B8901A]/8 transition-all duration-200 overflow-hidden"
                >
                  <div className="h-1.5 w-full" style={{ backgroundColor: c.dot }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                      >
                        <Layers className="w-5 h-5" style={{ color: c.icon }} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#1E5FA8] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[#B91C1C] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-[#0D1B35] font-bold text-base leading-snug">{b.name}</h3>
                    {b.code && (
                      <span className="inline-block mt-1 font-mono text-[10px] bg-[#F2F5FB] border border-[#D9E2F0] px-1.5 py-0.5 rounded text-[#6378A0]">
                        {b.code}
                      </span>
                    )}
                    {b.description && (
                      <p className="text-[#6378A0] text-xs mt-2 line-clamp-2 leading-relaxed">{b.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#E4EAF5] space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-[#6378A0]" />
                        <span className="text-[#6378A0] text-xs truncate">{b.department.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#6378A0]" />
                          <span className="text-[#6378A0] text-xs truncate max-w-[110px]">{b.department.building.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DoorOpen className="w-3 h-3" style={{ color: c.icon }} />
                          <span className="text-xs font-bold" style={{ color: c.icon }}>
                            {b._count.ruangans} room{b._count.ruangans !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <CrudModal title={editing ? "Edit Bagian" : "New Bagian"} open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Department *</label>
            <div className="relative">
              <select
                className={INPUT_CLS + " appearance-none pr-8"}
                value={form.departmentId}
                onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                disabled={!!editing}
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.building.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6378A0] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLS}>Name *</label>
            <input className={INPUT_CLS} placeholder="e.g. IT Support" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Code</label>
            <input className={INPUT_CLS} placeholder="e.g. IT-01" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea className={INPUT_CLS + " resize-none"} rows={3} placeholder="Optional description…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#6378A0] hover:bg-[#F2F5FB] transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.departmentId}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0F1C3F] hover:bg-[#162444] text-white transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Bagian"}
            </button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog
        open={!!deleteTarget}
        message={`Delete "${deleteTarget?.name}"? All associated ruangans and installation points will also be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
