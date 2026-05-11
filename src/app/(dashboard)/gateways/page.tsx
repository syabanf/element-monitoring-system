"use client";
import { useEffect, useState } from "react";
import { Wifi, Plus, Pencil, Trash2, Search, Radio } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

type Gateway = {
  id: string; name: string; serialNumber: string; connectionType: string;
  ipAddress: string | null; firmwareVersion: string | null; status: string;
  lastSeenAt: string | null; siteId: string;
  site: { name: string };
  _count: { sensors: number };
};

const CONNECTION_TYPES = ["LoRaWAN","Modbus","MQTT","OPC-UA","Ethernet","WiFi"];
const EMPTY: Partial<Gateway> = { name: "", serialNumber: "", connectionType: "LoRaWAN", ipAddress: "", siteId: "ste_1" };

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | null>(null);
  const [form, setForm]         = useState<Partial<Gateway>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { setLoading(true); fetch("/api/gateways").then(r => r.json()).then(d => { setGateways(d); setLoading(false); }); };
  useEffect(load, []);

  const onlineCount  = gateways.filter(g => g.status === "online").length;
  const offlineCount = gateways.filter(g => g.status !== "online").length;

  const filtered = gateways.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    g.site.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (g: Gateway) => { setForm(g); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    const isEdit = modal === "edit";
    await fetch(isEdit ? `/api/gateways/${form.id}` : "/api/gateways", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false); setModal(null); load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    await fetch(`/api/gateways/${delId}`, { method: "DELETE" });
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
            <Wifi className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#1C1714] text-2xl font-bold">Gateway Registry</h1>
            <p className="text-[#9C9285] text-sm">{gateways.length} gateways · {onlineCount} online · {offlineCount} offline</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1714] text-white text-sm font-semibold rounded-xl hover:bg-[#2D2420] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />New Gateway
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", val: gateways.length, color: "#1C1714", dot: "#9C9285" },
          { label: "Online",  val: onlineCount,  color: "#166534", dot: "#166534" },
          { label: "Offline", val: offlineCount, color: "#B91C1C", dot: "#B91C1C" },
          { label: "Total Sensors", val: gateways.reduce((a, g) => a + g._count.sensors, 0), color: "#1E5FA8", dot: "#1E5FA8" },
        ].map(({ label, val, color, dot }) => (
          <div key={label} className="bg-white border border-[#E5DDD0] rounded-xl p-4 shadow-sm">
            <p className="text-[#9C9285] text-xs font-medium">{label}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
              <p className="text-2xl font-bold" style={{ color }}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9285]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gateways…" className="w-full pl-9 pr-4 py-2.5 border border-[#E5DDD0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] text-[#1C1714] placeholder:text-[#9C9285]" />
      </div>

      {loading ? <div className="text-center py-16 text-[#9C9285]">Loading…</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(gw => (
            <div key={gw.id} className="bg-white border border-[#E5DDD0] rounded-xl p-5 space-y-4 hover:shadow-md hover:border-[#D4C8B8] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-[#1E5FA8]" />
                  </div>
                  <div>
                    <p className="text-[#1C1714] font-semibold">{gw.name}</p>
                    <p className="text-[#9C9285] text-xs">{gw.site.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${gw.status === "online" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FEF2F2] text-[#B91C1C]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${gw.status === "online" ? "bg-[#166534] animate-pulse" : "bg-[#B91C1C]"}`} />
                    {gw.status.toUpperCase()}
                  </div>
                  <button onClick={() => openEdit(gw)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#9C9285] hover:text-[#B8901A] transition-colors ml-1"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDelId(gw.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#9C9285] hover:text-[#B91C1C] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Serial", val: gw.serialNumber, mono: true },
                  { label: "Type",   val: gw.connectionType, mono: false },
                  { label: "IP",     val: gw.ipAddress ?? "—", mono: true },
                  { label: "Firmware", val: gw.firmwareVersion ?? "—", mono: false },
                ].map(({ label, val, mono }) => (
                  <div key={label}>
                    <p className="text-[#9C9285] text-xs">{label}</p>
                    <p className={`text-[#1C1714] text-xs font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs border-t border-[#EDE8E0] pt-3">
                <div className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#9C9285]" />
                  <span className="text-[#5C5248] font-medium">{gw._count.sensors} sensors</span>
                </div>
                {gw.lastSeenAt && <span className="text-[#9C9285]">Last seen {new Date(gw.lastSeenAt).toLocaleTimeString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudModal title={modal === "edit" ? "Edit Gateway" : "New Gateway"} open={!!modal} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <Field label="Name"><input className={inputCls} value={form.name ?? ""} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. GW-SUR-01" /></Field>
          <Field label="Serial Number"><input className={inputCls} value={form.serialNumber ?? ""} onChange={e => setForm(f => ({...f, serialNumber: e.target.value}))} placeholder="Unique serial" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Connection Type">
              <select className={inputCls} value={form.connectionType ?? "LoRaWAN"} onChange={e => setForm(f => ({...f, connectionType: e.target.value}))}>
                {CONNECTION_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="IP Address"><input className={inputCls} value={form.ipAddress ?? ""} onChange={e => setForm(f => ({...f, ipAddress: e.target.value}))} placeholder="192.168.1.10" /></Field>
          </div>
          <Field label="Firmware Version"><input className={inputCls} value={form.firmwareVersion ?? ""} onChange={e => setForm(f => ({...f, firmwareVersion: e.target.value}))} placeholder="e.g. v2.4.1" /></Field>
          {modal === "edit" && (
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "online"} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </Field>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-[#E5DDD0] text-[#5C5248] text-sm font-medium hover:bg-[#F5F3EE] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#1C1714] text-white text-sm font-semibold hover:bg-[#2D2420] disabled:opacity-50 transition-colors">{saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Gateway"}</button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog open={!!delId} message="This gateway will be permanently deleted." onConfirm={confirmDelete} onCancel={() => setDelId(null)} loading={deleting} />
    </div>
  );
}
