"use client";
import { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { CrudModal } from "@/components/crud/CrudModal";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { format } from "date-fns";

type User = {
  id: string; name: string; email: string; role: string; isActive: boolean;
  createdAt: string; lastLoginAt: string | null;
  organization: { name: string };
};

const ROLES = ["SUPER_ADMIN","EXECUTIVE","ENERGY_MANAGER","OPERATIONS_SUPERVISOR","TECHNICIAN","FINANCE","EHS_COMPLIANCE","VIEWER"];

const roleColors: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN:             { bg: "#FEF2F2", text: "#B91C1C" },
  EXECUTIVE:               { bg: "#F5F3FF", text: "#6D28D9" },
  ENERGY_MANAGER:          { bg: "#FFFBEB", text: "#B45309" },
  OPERATIONS_SUPERVISOR:   { bg: "#EFF6FF", text: "#1E5FA8" },
  TECHNICIAN:              { bg: "#F0FDF4", text: "#166534" },
  FINANCE:                 { bg: "#ECFEFF", text: "#0E7490" },
  EHS_COMPLIANCE:          { bg: "#F5F3FF", text: "#6D28D9" },
  VIEWER:                  { bg: "#F5F3EE", text: "#9C9285" },
};

const EMPTY: Partial<User> = { name: "", email: "", role: "VIEWER", isActive: true };

export default function UsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | null>(null);
  const [form, setForm]         = useState<Partial<User>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/users").then(r => r.json()).then(d => { setUsers(d); setLoading(false); });
  };
  useEffect(load, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(EMPTY); setModal("create"); };
  const openEdit   = (u: User) => { setForm(u); setModal("edit"); };

  const save = async () => {
    setSaving(true);
    const isEdit = modal === "edit";
    await fetch(isEdit ? `/api/users/${form.id}` : "/api/users", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModal(null);
    load();
  };

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    await fetch(`/api/users/${delId}`, { method: "DELETE" });
    setDeleting(false);
    setDelId(null);
    load();
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#9C9285] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-[#E5DDD0] rounded-lg px-3 py-2 text-sm text-[#1C1714] focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] bg-white";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#1C1714] text-2xl font-bold">User Management</h1>
            <p className="text-[#9C9285] text-sm">{users.length} users · {users.filter(u => u.isActive).length} active</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1714] text-white text-sm font-semibold rounded-xl hover:bg-[#2D2420] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries({ "Super Admin": "SUPER_ADMIN", "Managers": "ENERGY_MANAGER", "Technicians": "TECHNICIAN", "Viewers": "VIEWER" }).map(([label, role]) => {
          const count = users.filter(u => u.role === role).length;
          const rc = roleColors[role];
          return (
            <div key={role} className="bg-white border border-[#E5DDD0] rounded-xl p-4 shadow-sm">
              <p className="text-[#9C9285] text-xs font-medium">{label}</p>
              <p className="text-[#1C1714] text-2xl font-bold mt-1">{count}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block" style={{ backgroundColor: rc.bg, color: rc.text }}>{role.replace(/_/g, " ")}</span>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9285]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="w-full pl-9 pr-4 py-2.5 border border-[#E5DDD0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B8901A]/30 focus:border-[#B8901A] text-[#1C1714] placeholder:text-[#9C9285]" />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F3EE] border-b border-[#E5DDD0]">
                {["User", "Email", "Role", "Org", "Last Login", "Status", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#9C9285] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#9C9285] text-sm">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#9C9285] text-sm">No users found</td></tr>
              ) : filtered.map(u => {
                const rc = roleColors[u.role] ?? roleColors.VIEWER;
                return (
                  <tr key={u.id} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#B8901A] text-xs font-bold">{u.name.charAt(0)}</span>
                        </div>
                        <p className="text-[#1C1714] text-sm font-semibold">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#5C5248] text-sm">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: rc.bg, color: rc.text }}>{u.role.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#9C9285] text-sm">{u.organization.name}</td>
                    <td className="px-5 py-3.5 text-[#9C9285] text-xs">{u.lastLoginAt ? format(new Date(u.lastLoginAt), "MMM d, HH:mm") : "Never"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F5F3EE] text-[#9C9285]"}`}>{u.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => openEdit(u)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF7E6] text-[#9C9285] hover:text-[#B8901A] transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDelId(u.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] text-[#9C9285] hover:text-[#B91C1C] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CrudModal title={modal === "edit" ? "Edit User" : "New User"} open={!!modal} onClose={() => setModal(null)}>
        <div className="space-y-4">
          <Field label="Name">
            <input className={inputCls} value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@company.com" />
          </Field>
          <Field label="Role">
            <select className={inputCls} value={form.role ?? "VIEWER"} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.isActive ? "active" : "inactive"} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "active" }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-[#E5DDD0] text-[#5C5248] text-sm font-medium hover:bg-[#F5F3EE] transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#1C1714] text-white text-sm font-semibold hover:bg-[#2D2420] disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create User"}
            </button>
          </div>
        </div>
      </CrudModal>

      <ConfirmDialog open={!!delId} message="This user will be permanently removed. Are you sure?" onConfirm={confirmDelete} onCancel={() => setDelId(null)} loading={deleting} />
    </div>
  );
}
