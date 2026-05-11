"use client";
import { useEffect, useState } from "react";
import { Radio, Plus, Pencil, Trash2, Search } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

type Sensor = {
  id: string; name: string; sensorType: string; metricName: string; unit: string;
  protocol: string; status: string; lastValue: number | null; lastReadingAt: string | null;
  minValue: number | null; maxValue: number | null; assetId: string; gatewayId: string | null;
  asset: { name: string; pillar: string; site: { name: string } };
  gateway: { name: string } | null;
};

const SENSOR_TYPES = ["Temperature","Pressure","Flow","Level","Power","Current","Voltage","Vibration","pH","Humidity","Gas","Other"];
const PROTOCOLS = ["Modbus","MQTT","LoRaWAN","OPC-UA","BACnet","SNMP","REST"];
const STATUSES_SENSOR = ["ONLINE","OFFLINE","FAULT","CALIBRATION_DUE"];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  ONLINE:          { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  OFFLINE:         { bg: "#FEF2F2", text: "#B91C1C", dot: "#B91C1C" },
  FAULT:           { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  CALIBRATION_DUE: { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
};

const EMPTY: Partial<Sensor> = { name: "", sensorType: "Temperature", metricName: "", unit: "", protocol: "Modbus", assetId: "ast_1" };

export default function SensorsPage() {
  const [sensors, setSensors]   = useState<Sensor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | null>(null);
  const [form, setForm]         = useState<Partial<Sensor>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { setLoading(true); fetch("/api/sensors").then(r => r.json()).then(d => { setSensors(d); setLoading(false); }); };
  useEffect(load, []);

  const statusCounts = STATUSES_SENSOR.reduce((acc, s) => { acc[s] = sensors.filter(x => x.status === s).length; return acc; }, {} as Record<string, number>);

  const filtered = sensors.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.asset.name.toLowerCase().includes(search.toLowerCase()) || s.metricName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (s: Sensor) => { setForm(s); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    const isEdit = modal === "edit";
    await fetch(isEdit ? `/api/sensors/${form.id}` : "/api/sensors", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false); setModal(null); load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    await fetch(`/api/sensors/${delId}`, { method: "DELETE" });
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
            <Radio className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#0D1B35] text-2xl font-bold">Sensor Registry</h1>
            <p className="text-[#6378A0] text-sm">{sensors.length} sensors · {statusCounts.ONLINE ?? 0} online</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B35] text-white text-sm font-semibold rounded-xl hover:bg-[#162040] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />New Sensor
        </button>
      </div>

      {/* Status stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATUSES_SENSOR.map(s => {
          const sc = statusConfig[s];
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`bg-white border rounded-xl p-4 text-left transition-all shadow-sm ${filterStatus === s ? "ring-2 ring-[#B8901A]" : "border-[#D9E2F0] hover:border-[#C6D0E8]"}`}>
              <p className="text-[#6378A0] text-xs font-medium">{s.replace("_"," ")}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                <p className="text-[#0D1B35] text-2xl font-bold">{statusCounts[s] ?? 0}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6378A0]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sensors…" className="w-full pl-9 pr-4 py-2.5 border border-[#D9E2F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] text-[#0D1B35] placeholder:text-[#6378A0]" />
      </div>

      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                {["Sensor","Asset / Site","Metric","Unit","Protocol","Last Value","Status",""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6378A0]">Loading…</td></tr>
              ) : filtered.map(s => {
                const sc = statusConfig[s.status] ?? statusConfig.OFFLINE;
                return (
                  <tr key={s.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="text-[#0D1B35] text-sm font-semibold">{s.name}</p>
                      <p className="text-[#6378A0] text-xs">{s.sensorType}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[#0D1B35] text-sm">{s.asset.name}</p>
                      <p className="text-[#6378A0] text-xs">{s.asset.site.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#3D5280] text-sm">{s.metricName}</td>
                    <td className="px-5 py-3.5 text-[#3D5280] text-sm">{s.unit}</td>
                    <td className="px-5 py-3.5 text-[#3D5280] text-sm">{s.protocol}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#0D1B35]">
                      {s.lastValue !== null ? `${Number(s.lastValue).toFixed(2)} ${s.unit}` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                        <span className="text-xs font-medium" style={{ color: sc.text }}>{s.status.replace("_"," ")}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => openEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#6378A0] hover:text-[#B8901A] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelId(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#6378A0] hover:text-[#B91C1C] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CrudModal title={modal === "edit" ? "Edit Sensor" : "New Sensor"} open={!!modal} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <Field label="Name"><input className={inputCls} value={form.name ?? ""} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Sensor name" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sensor Type">
              <select className={inputCls} value={form.sensorType ?? "Temperature"} onChange={e => setForm(f => ({...f, sensorType: e.target.value}))}>
                {SENSOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Protocol">
              <select className={inputCls} value={form.protocol ?? "Modbus"} onChange={e => setForm(f => ({...f, protocol: e.target.value}))}>
                {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Metric Name"><input className={inputCls} value={form.metricName ?? ""} onChange={e => setForm(f => ({...f, metricName: e.target.value}))} placeholder="e.g. active_power" /></Field>
            <Field label="Unit"><input className={inputCls} value={form.unit ?? ""} onChange={e => setForm(f => ({...f, unit: e.target.value}))} placeholder="e.g. kW" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Value"><input className={inputCls} type="number" value={form.minValue ?? ""} onChange={e => setForm(f => ({...f, minValue: Number(e.target.value)}))} placeholder="0" /></Field>
            <Field label="Max Value"><input className={inputCls} type="number" value={form.maxValue ?? ""} onChange={e => setForm(f => ({...f, maxValue: Number(e.target.value)}))} placeholder="1000" /></Field>
          </div>
          {modal === "edit" && (
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "ONLINE"} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                {STATUSES_SENSOR.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </Field>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-[#D9E2F0] text-[#3D5280] text-sm font-medium hover:bg-[#F2F5FB] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#0D1B35] text-white text-sm font-semibold hover:bg-[#162040] disabled:opacity-50 transition-colors">{saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create Sensor"}</button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog open={!!delId} message="This sensor will be permanently deleted. Are you sure?" onConfirm={confirmDelete} onCancel={() => setDelId(null)} loading={deleting} />
    </div>
  );
}
