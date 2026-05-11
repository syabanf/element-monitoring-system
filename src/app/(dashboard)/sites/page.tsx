"use client";
import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Search, Building2, Package, Wifi, ExternalLink } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

type Site = {
  id: string; name: string; code: string; city: string | null; address: string | null;
  timezone: string; isActive: boolean; country: string;
  buildings: { id: string; name: string; _count: { zones: number } }[];
  gateways: { id: string; name: string; status: string }[];
  _count: { assets: number };
};

const TIMEZONES = ["Asia/Jakarta","Asia/Makassar","Asia/Jayapura","Asia/Singapore"];
const EMPTY: Partial<Site> = { name: "", code: "", city: "", address: "", timezone: "Asia/Jakarta" };

export default function SitesPage() {
  const [sites, setSites]       = useState<Site[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | null>(null);
  const [form, setForm]         = useState<Partial<Site>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { setLoading(true); fetch("/api/sites").then(r => r.json()).then(d => { setSites(d); setLoading(false); }); };
  useEffect(load, []);

  const filtered = sites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()) || (s.city ?? "").toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (s: Site) => { setForm(s); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    const isEdit = modal === "edit";
    await fetch(isEdit ? `/api/sites/${form.id}` : "/api/sites", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false); setModal(null); load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    await fetch(`/api/sites/${delId}`, { method: "DELETE" });
    setDeleting(false); setDelId(null); load();
  };

  const inputCls = "w-full border border-[#E5DDD0] rounded-lg px-3 py-2 text-sm text-[#1C1714] focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] bg-white";
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5"><label className="text-xs font-semibold text-[#9C9285] uppercase tracking-wider">{label}</label>{children}</div>
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#1C1714] text-2xl font-bold">Sites</h1>
            <p className="text-[#9C9285] text-sm">{sites.length} sites · {sites.filter(s => s.isActive).length} active</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1714] text-white text-sm font-semibold rounded-xl hover:bg-[#2D2420] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />New Site
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9285]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites…" className="w-full pl-9 pr-4 py-2.5 border border-[#E5DDD0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] text-[#1C1714] placeholder:text-[#9C9285]" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#9C9285]">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(site => (
            <div key={site.id} className="bg-white border border-[#E5DDD0] rounded-xl p-5 space-y-4 hover:shadow-md hover:border-[#D4C8B8] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#B8901A]" />
                  </div>
                  <div>
                    <h3 className="text-[#1C1714] font-semibold">{site.name}</h3>
                    <p className="text-[#9C9285] text-xs">{site.code} · {site.city ?? site.address ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`/sites/${site.id}`} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#9C9285] hover:text-[#B8901A] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => openEdit(site)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#9C9285] hover:text-[#B8901A] transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDelId(site.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#9C9285] hover:text-[#B91C1C] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Building2, label: "Buildings", val: site.buildings.length },
                  { icon: Package,   label: "Assets",    val: site._count.assets },
                  { icon: Wifi,      label: "Gateways",  val: site.gateways.length },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-[#F5F3EE] rounded-lg p-3 text-center">
                    <Icon className="w-4 h-4 text-[#9C9285] mx-auto mb-1" />
                    <p className="text-[#1C1714] font-bold text-sm">{val}</p>
                    <p className="text-[#9C9285] text-xs">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#EDE8E0] pt-3">
                <span className="text-[#9C9285]">{site.timezone}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${site.isActive ? "bg-[#166534]" : "bg-[#9C9285]"}`} />
                  <span className={site.isActive ? "text-[#166534] font-medium" : "text-[#9C9285]"}>{site.isActive ? "ACTIVE" : "INACTIVE"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudModal title={modal === "edit" ? "Edit Site" : "New Site"} open={!!modal} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <Field label="Site Name"><input className={inputCls} value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. PLTU Suralaya" /></Field>
          <Field label="Code"><input className={inputCls} value={form.code ?? ""} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. SUR" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><input className={inputCls} value={form.city ?? ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" /></Field>
            <Field label="Timezone">
              <select className={inputCls} value={form.timezone ?? "Asia/Jakarta"} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Address"><input className={inputCls} value={form.address ?? ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" /></Field>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-[#E5DDD0] text-[#5C5248] text-sm font-medium hover:bg-[#F5F3EE] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#1C1714] text-white text-sm font-semibold hover:bg-[#2D2420] disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Site"}
            </button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog open={!!delId} message="This site will be deactivated. Are you sure?" onConfirm={confirmDelete} onCancel={() => setDelId(null)} loading={deleting} />
    </div>
  );
}
