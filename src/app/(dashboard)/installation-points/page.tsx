"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Layers,
  DoorOpen,
  MapPin,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Site {
  id: string;
  name: string;
  code: string;
}

interface Building {
  id: string;
  name: string;
  code: string | null;
  floors: number;
  description: string | null;
  _count: { departments: number };
}

interface Department {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  _count: { bagians: number };
}

interface Bagian {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  _count: { ruangans: number };
}

interface Ruangan {
  id: string;
  name: string;
  code: string | null;
  floor: number | null;
  description: string | null;
  _count: { installationPoints: number };
}

interface InstallationPoint {
  id: string;
  name: string;
  code: string | null;
  pillar: string;
  description: string | null;
  isActive: boolean;
}

type ModalMode = "add" | "edit";

const PILLARS = [
  { value: "ELECTRICITY", label: "Electricity", color: "#f59e0b" },
  { value: "WATER", label: "Water", color: "#3b82f6" },
  { value: "WASTEWATER", label: "Wastewater", color: "#8b5cf6" },
  { value: "GAS_AIR", label: "Gas / Air", color: "#ef4444" },
  { value: "ENVIRONMENT", label: "Environment", color: "#22c55e" },
  { value: "THERMAL_HVAC", label: "Thermal / HVAC", color: "#f97316" },
  { value: "COMPRESSED_AIR", label: "Compressed Air", color: "#06b6d4" },
];

// ─── Column component ─────────────────────────────────────────────────────────

interface ColumnProps<T extends { id: string; name: string }> {
  title: string;
  icon: React.ElementType;
  items: T[];
  selectedId: string | null;
  loading: boolean;
  disabled?: boolean;
  renderSub?: (item: T) => React.ReactNode;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

function Column<T extends { id: string; name: string }>({
  title,
  icon: Icon,
  items,
  selectedId,
  loading,
  disabled,
  renderSub,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: ColumnProps<T>) {
  return (
    <div className="flex flex-col w-56 flex-shrink-0 border-r border-[#D9E2F0] h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#D9E2F0] bg-[#F2F5FB]">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-[#6378A0]" />
          <span className="text-xs font-semibold text-[#6378A0] uppercase tracking-wider">{title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 text-[#6378A0] hover:text-[#0D1B35] hover:bg-[#E4EAF5]"
          disabled={disabled}
          onClick={onAdd}
          title={`Add ${title}`}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-[#6378A0]" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-[11px] text-[#6378A0] text-center py-6 px-3">No {title.toLowerCase()} yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex items-center justify-between px-3 py-2 cursor-pointer border-b border-[#E4EAF5] transition-colors ${
                selectedId === item.id
                  ? "bg-[#B8901A]/10 border-l-2 border-l-[#B8901A]"
                  : "hover:bg-[#F2F5FB]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${selectedId === item.id ? "text-[#0D1B35]" : "text-[#3D5280]"}`}>
                  {item.name}
                </p>
                {renderSub && (
                  <div className="mt-0.5">{renderSub(item)}</div>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 ml-1 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="p-0.5 rounded text-[#6378A0] hover:text-[#0D1B35] hover:bg-[#E4EAF5]"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="p-0.5 rounded text-[#6378A0] hover:text-[#B91C1C] hover:bg-[#E4EAF5]"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
              {selectedId === item.id && (
                <ChevronRight className="w-3 h-3 text-[#B8901A] flex-shrink-0 ml-0.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstallationPointsPage() {
  // ── Data state ──
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bagians, setBagians] = useState<Bagian[]>([]);
  const [ruangans, setRuangans] = useState<Ruangan[]>([]);
  const [points, setPoints] = useState<InstallationPoint[]>([]);

  // ── Selection state ──
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedBagianId, setSelectedBagianId] = useState<string | null>(null);
  const [selectedRuanganId, setSelectedRuanganId] = useState<string | null>(null);

  // ── Loading state ──
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingBagians, setLoadingBagians] = useState(false);
  const [loadingRuangans, setLoadingRuangans] = useState(false);
  const [loadingPoints, setLoadingPoints] = useState(false);

  // ── Modal state ──
  type ModalTarget = "building" | "department" | "bagian" | "ruangan" | "point";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<ModalTarget>("building");
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // ── Delete confirm state ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ target: ModalTarget; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Form fields ──
  const [fName, setFName] = useState("");
  const [fCode, setFCode] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fFloors, setFFloors] = useState("1");
  const [fFloor, setFFloor] = useState("");
  const [fPillar, setFPillar] = useState("ELECTRICITY");
  const [fIsActive, setFIsActive] = useState("true");

  // ── Load sites ──
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => { setSites(data); setLoadingSites(false); })
      .catch(() => setLoadingSites(false));
  }, []);

  // ── Load buildings when site changes ──
  useEffect(() => {
    if (!selectedSiteId) { setBuildings([]); return; }
    setLoadingBuildings(true);
    setSelectedBuildingId(null);
    setDepartments([]); setBagians([]); setRuangans([]); setPoints([]);
    fetch(`/api/buildings?siteId=${selectedSiteId}`)
      .then((r) => r.json())
      .then((data) => { setBuildings(data); setLoadingBuildings(false); })
      .catch(() => setLoadingBuildings(false));
  }, [selectedSiteId]);

  // ── Load departments when building changes ──
  useEffect(() => {
    if (!selectedBuildingId) { setDepartments([]); return; }
    setLoadingDepts(true);
    setSelectedDeptId(null);
    setBagians([]); setRuangans([]); setPoints([]);
    fetch(`/api/departments?buildingId=${selectedBuildingId}`)
      .then((r) => r.json())
      .then((data) => { setDepartments(data); setLoadingDepts(false); })
      .catch(() => setLoadingDepts(false));
  }, [selectedBuildingId]);

  // ── Load bagians when dept changes ──
  useEffect(() => {
    if (!selectedDeptId) { setBagians([]); return; }
    setLoadingBagians(true);
    setSelectedBagianId(null);
    setRuangans([]); setPoints([]);
    fetch(`/api/bagians?departmentId=${selectedDeptId}`)
      .then((r) => r.json())
      .then((data) => { setBagians(data); setLoadingBagians(false); })
      .catch(() => setLoadingBagians(false));
  }, [selectedDeptId]);

  // ── Load ruangans when bagian changes ──
  useEffect(() => {
    if (!selectedBagianId) { setRuangans([]); return; }
    setLoadingRuangans(true);
    setSelectedRuanganId(null);
    setPoints([]);
    fetch(`/api/ruangans?bagianId=${selectedBagianId}`)
      .then((r) => r.json())
      .then((data) => { setRuangans(data); setLoadingRuangans(false); })
      .catch(() => setLoadingRuangans(false));
  }, [selectedBagianId]);

  // ── Load installation points when ruangan changes ──
  const loadPoints = useCallback((ruanganId: string) => {
    setLoadingPoints(true);
    fetch(`/api/installation-points?ruanganId=${ruanganId}`)
      .then((r) => r.json())
      .then((data) => { setPoints(data); setLoadingPoints(false); })
      .catch(() => setLoadingPoints(false));
  }, []);

  useEffect(() => {
    if (!selectedRuanganId) { setPoints([]); return; }
    loadPoints(selectedRuanganId);
  }, [selectedRuanganId, loadPoints]);

  // ── Open add modal ──
  function openAdd(target: ModalTarget) {
    setModalTarget(target);
    setModalMode("add");
    setEditingItem(null);
    setFName(""); setFCode(""); setFDescription("");
    setFFloors("1"); setFFloor(""); setFPillar("ELECTRICITY"); setFIsActive("true");
    setModalOpen(true);
  }

  // ── Open edit modal ──
  function openEdit(target: ModalTarget, item: Record<string, unknown>) {
    setModalTarget(target);
    setModalMode("edit");
    setEditingItem(item);
    setFName((item.name as string) ?? "");
    setFCode((item.code as string) ?? "");
    setFDescription((item.description as string) ?? "");
    setFFloors(String((item.floors as number) ?? 1));
    setFFloor(item.floor != null ? String(item.floor) : "");
    setFPillar((item.pillar as string) ?? "ELECTRICITY");
    setFIsActive(item.isActive !== false ? "true" : "false");
    setModalOpen(true);
  }

  // ── Save modal ──
  async function handleSave() {
    setModalSaving(true);
    try {
      const urlMap: Record<ModalTarget, string> = {
        building: "/api/buildings",
        department: "/api/departments",
        bagian: "/api/bagians",
        ruangan: "/api/ruangans",
        point: "/api/installation-points",
      };

      let body: Record<string, unknown> = { name: fName, code: fCode || null, description: fDescription || null };

      if (modalTarget === "building") body = { ...body, floors: parseInt(fFloors) || 1 };
      if (modalTarget === "ruangan") body = { ...body, floor: fFloor ? parseInt(fFloor) : null };
      if (modalTarget === "point") body = { ...body, pillar: fPillar, isActive: fIsActive === "true" };

      if (modalMode === "add") {
        // attach parent FK
        if (modalTarget === "building") body.siteId = selectedSiteId;
        if (modalTarget === "department") body.buildingId = selectedBuildingId;
        if (modalTarget === "bagian") body.departmentId = selectedDeptId;
        if (modalTarget === "ruangan") body.bagianId = selectedBagianId;
        if (modalTarget === "point") body.ruanganId = selectedRuanganId;

        await fetch(urlMap[modalTarget], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const id = (editingItem as { id: string }).id;
        await fetch(`${urlMap[modalTarget]}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);

      // Refresh the affected list
      if (modalTarget === "building" && selectedSiteId) {
        setLoadingBuildings(true);
        fetch(`/api/buildings?siteId=${selectedSiteId}`)
          .then((r) => r.json()).then((d) => { setBuildings(d); setLoadingBuildings(false); });
      }
      if (modalTarget === "department" && selectedBuildingId) {
        setLoadingDepts(true);
        fetch(`/api/departments?buildingId=${selectedBuildingId}`)
          .then((r) => r.json()).then((d) => { setDepartments(d); setLoadingDepts(false); });
      }
      if (modalTarget === "bagian" && selectedDeptId) {
        setLoadingBagians(true);
        fetch(`/api/bagians?departmentId=${selectedDeptId}`)
          .then((r) => r.json()).then((d) => { setBagians(d); setLoadingBagians(false); });
      }
      if (modalTarget === "ruangan" && selectedBagianId) {
        setLoadingRuangans(true);
        fetch(`/api/ruangans?bagianId=${selectedBagianId}`)
          .then((r) => r.json()).then((d) => { setRuangans(d); setLoadingRuangans(false); });
      }
      if (modalTarget === "point" && selectedRuanganId) {
        loadPoints(selectedRuanganId);
      }
    } finally {
      setModalSaving(false);
    }
  }

  // ── Open delete confirm ──
  function openDelete(target: ModalTarget, item: { id: string; name: string }) {
    setDeletingItem({ target, id: item.id, name: item.name });
    setDeleteOpen(true);
  }

  // ── Confirm delete ──
  async function handleDelete() {
    if (!deletingItem) return;
    setDeleteLoading(true);
    const urlMap: Record<ModalTarget, string> = {
      building: "/api/buildings",
      department: "/api/departments",
      bagian: "/api/bagians",
      ruangan: "/api/ruangans",
      point: "/api/installation-points",
    };
    await fetch(`${urlMap[deletingItem.target]}/${deletingItem.id}`, { method: "DELETE" });
    setDeleteOpen(false);
    setDeleteLoading(false);

    // Refresh & clear selection downstream
    if (deletingItem.target === "building") {
      if (selectedBuildingId === deletingItem.id) setSelectedBuildingId(null);
      fetch(`/api/buildings?siteId=${selectedSiteId}`).then((r) => r.json()).then(setBuildings);
    }
    if (deletingItem.target === "department") {
      if (selectedDeptId === deletingItem.id) setSelectedDeptId(null);
      fetch(`/api/departments?buildingId=${selectedBuildingId}`).then((r) => r.json()).then(setDepartments);
    }
    if (deletingItem.target === "bagian") {
      if (selectedBagianId === deletingItem.id) setSelectedBagianId(null);
      fetch(`/api/bagians?departmentId=${selectedDeptId}`).then((r) => r.json()).then(setBagians);
    }
    if (deletingItem.target === "ruangan") {
      if (selectedRuanganId === deletingItem.id) setSelectedRuanganId(null);
      fetch(`/api/ruangans?bagianId=${selectedBagianId}`).then((r) => r.json()).then(setRuangans);
    }
    if (deletingItem.target === "point" && selectedRuanganId) {
      loadPoints(selectedRuanganId);
    }
  }

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const selectedBagian = bagians.find((b) => b.id === selectedBagianId);
  const selectedRuangan = ruangans.find((r) => r.id === selectedRuanganId);

  const modalTitles: Record<ModalTarget, string> = {
    building: "Gedung",
    department: "Department",
    bagian: "Bagian",
    ruangan: "Ruangan",
    point: "Installation Point",
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F5FB]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#D9E2F0] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#0D1B35] font-semibold text-lg">Installation Points</h1>
            <p className="text-[#6378A0] text-sm mt-0.5">
              Kelola hierarki lokasi: Gedung → Department → Bagian → Ruangan → Installation Point
            </p>
          </div>
          {/* Breadcrumb */}
          {(selectedSite || selectedBuilding || selectedDept || selectedBagian || selectedRuangan) && (
            <div className="flex items-center gap-1 text-xs text-[#6378A0]">
              {selectedSite && <span className="text-[#0D1B35]">{selectedSite.name}</span>}
              {selectedBuilding && <><ChevronRight className="w-3 h-3" /><span className="text-[#0D1B35]">{selectedBuilding.name}</span></>}
              {selectedDept && <><ChevronRight className="w-3 h-3" /><span className="text-[#0D1B35]">{selectedDept.name}</span></>}
              {selectedBagian && <><ChevronRight className="w-3 h-3" /><span className="text-[#0D1B35]">{selectedBagian.name}</span></>}
              {selectedRuangan && <><ChevronRight className="w-3 h-3" /><span className="text-[#B8901A] font-medium">{selectedRuangan.name}</span></>}
            </div>
          )}
        </div>

        {/* Site selector */}
        <div className="mt-4 flex items-center gap-3">
          <label className="text-xs text-[#6378A0] font-medium whitespace-nowrap">Pilih Site:</label>
          {loadingSites ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#6378A0]" />
          ) : (
            <div className="flex gap-2 flex-wrap">
              {sites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id === selectedSiteId ? null : s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedSiteId === s.id
                      ? "bg-[#0F1C3F] border-[#0F1C3F] text-white"
                      : "border-[#D9E2F0] text-[#6378A0] hover:border-[#0F1C3F] hover:text-[#0D1B35]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column explorer */}
      <div className="flex flex-1 overflow-hidden">
        {/* Gedung column */}
        <Column<Building>
          title="Gedung"
          icon={Building2}
          items={buildings}
          selectedId={selectedBuildingId}
          loading={loadingBuildings}
          disabled={!selectedSiteId}
          renderSub={(b) => (
            <span className="text-[10px] text-[#6378A0]">{b._count.departments} dept · {b.floors} lt</span>
          )}
          onSelect={(id) => setSelectedBuildingId(id === selectedBuildingId ? null : id)}
          onAdd={() => openAdd("building")}
          onEdit={(b) => openEdit("building", b as unknown as Record<string, unknown>)}
          onDelete={(b) => openDelete("building", b)}
        />

        {/* Department column */}
        <Column<Department>
          title="Department"
          icon={Layers}
          items={departments}
          selectedId={selectedDeptId}
          loading={loadingDepts}
          disabled={!selectedBuildingId}
          renderSub={(d) => (
            <span className="text-[10px] text-[#6378A0]">{d._count.bagians} bagian</span>
          )}
          onSelect={(id) => setSelectedDeptId(id === selectedDeptId ? null : id)}
          onAdd={() => openAdd("department")}
          onEdit={(d) => openEdit("department", d as unknown as Record<string, unknown>)}
          onDelete={(d) => openDelete("department", d)}
        />

        {/* Bagian column */}
        <Column<Bagian>
          title="Bagian"
          icon={Layers}
          items={bagians}
          selectedId={selectedBagianId}
          loading={loadingBagians}
          disabled={!selectedDeptId}
          renderSub={(b) => (
            <span className="text-[10px] text-[#6378A0]">{b._count.ruangans} ruangan</span>
          )}
          onSelect={(id) => setSelectedBagianId(id === selectedBagianId ? null : id)}
          onAdd={() => openAdd("bagian")}
          onEdit={(b) => openEdit("bagian", b as unknown as Record<string, unknown>)}
          onDelete={(b) => openDelete("bagian", b)}
        />

        {/* Ruangan column */}
        <Column<Ruangan>
          title="Ruangan"
          icon={DoorOpen}
          items={ruangans}
          selectedId={selectedRuanganId}
          loading={loadingRuangans}
          disabled={!selectedBagianId}
          renderSub={(r) => (
            <span className="text-[10px] text-[#6378A0]">
              {r._count.installationPoints} IP{r.floor != null ? ` · Lt ${r.floor}` : ""}
            </span>
          )}
          onSelect={(id) => setSelectedRuanganId(id === selectedRuanganId ? null : id)}
          onAdd={() => openAdd("ruangan")}
          onEdit={(r) => openEdit("ruangan", r as unknown as Record<string, unknown>)}
          onDelete={(r) => openDelete("ruangan", r)}
        />

        {/* Installation Points panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#D9E2F0] bg-white">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6378A0]" />
              <span className="text-xs font-semibold text-[#6378A0] uppercase tracking-wider">Installation Points</span>
            </div>
            <Button
              size="sm"
              className="h-7 text-xs bg-[#0F1C3F] hover:bg-[#162040] text-white"
              disabled={!selectedRuanganId}
              onClick={() => openAdd("point")}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Point
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedRuanganId ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapPin className="w-8 h-8 text-[#D9E2F0] mb-3" />
                <p className="text-sm text-[#6378A0]">Pilih ruangan untuk melihat installation points</p>
                <p className="text-xs text-[#6378A0] mt-1">Navigasi melalui kolom di sebelah kiri</p>
              </div>
            ) : loadingPoints ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-[#6378A0]" />
              </div>
            ) : points.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapPin className="w-8 h-8 text-[#D9E2F0] mb-3" />
                <p className="text-sm text-[#6378A0]">Belum ada installation point</p>
                <Button
                  size="sm"
                  className="mt-3 bg-[#0F1C3F] hover:bg-[#162040] text-white text-xs"
                  onClick={() => openAdd("point")}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add First Point
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {points.map((pt) => {
                  const pillarConfig = PILLARS.find((p) => p.value === pt.pillar);
                  return (
                    <div
                      key={pt.id}
                      className="bg-white border border-[#D9E2F0] rounded-lg p-4 flex items-start justify-between gap-3 hover:border-[#B8901A]/40 hover:shadow-sm transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: pillarConfig?.color ?? "#888888" }}
                          />
                          <p className="text-sm font-medium text-[#0D1B35] truncate">{pt.name}</p>
                          {!pt.isActive && (
                            <Badge className="text-[9px] px-1 py-0 h-3.5 bg-[#6378A0]/10 text-[#6378A0] border-[#6378A0]/20">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {pt.code && <p className="text-[11px] text-[#6378A0] mb-1">Code: {pt.code}</p>}
                        <Badge
                          className="text-[10px] px-1.5 py-0 h-4"
                          style={{
                            backgroundColor: `${pillarConfig?.color}18`,
                            color: pillarConfig?.color,
                            borderColor: `${pillarConfig?.color}30`,
                          }}
                        >
                          {pillarConfig?.label ?? pt.pillar}
                        </Badge>
                        {pt.description && (
                          <p className="text-[11px] text-[#6378A0] mt-1.5 line-clamp-2">{pt.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit("point", pt as unknown as Record<string, unknown>)}
                          className="p-1.5 rounded text-[#6378A0] hover:text-[#0D1B35] hover:bg-[#F2F5FB]"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openDelete("point", pt)}
                          className="p-1.5 rounded text-[#6378A0] hover:text-[#B91C1C] hover:bg-[#F2F5FB]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white border-[#D9E2F0] text-[#0D1B35] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0D1B35]">
              {modalMode === "add" ? "Tambah" : "Edit"} {modalTitles[modalTarget]}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6378A0]">Nama *</Label>
              <Input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder={`Nama ${modalTitles[modalTarget]}`}
                className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] placeholder:text-[#6378A0] focus:border-[#B8901A]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#6378A0]">Kode</Label>
              <Input
                value={fCode}
                onChange={(e) => setFCode(e.target.value)}
                placeholder="e.g. GDG-01"
                className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] placeholder:text-[#6378A0] focus:border-[#B8901A]"
              />
            </div>

            {modalTarget === "building" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6378A0]">Jumlah Lantai</Label>
                <Input
                  type="number"
                  min={1}
                  value={fFloors}
                  onChange={(e) => setFFloors(e.target.value)}
                  className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] focus:border-[#B8901A]"
                />
              </div>
            )}

            {modalTarget === "ruangan" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6378A0]">Lantai</Label>
                <Input
                  type="number"
                  min={1}
                  value={fFloor}
                  onChange={(e) => setFFloor(e.target.value)}
                  placeholder="e.g. 3"
                  className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] placeholder:text-[#6378A0] focus:border-[#B8901A]"
                />
              </div>
            )}

            {modalTarget === "point" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6378A0]">Pillar *</Label>
                  <Select value={fPillar} onValueChange={(v) => { if (v !== null) setFPillar(v); }}>
                    <SelectTrigger className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] focus:border-[#B8901A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#D9E2F0]">
                      {PILLARS.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="text-[#0D1B35] focus:bg-[#F2F5FB]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6378A0]">Status</Label>
                  <Select value={fIsActive} onValueChange={(v) => { if (v !== null) setFIsActive(v); }}>
                    <SelectTrigger className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] focus:border-[#B8901A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#D9E2F0]">
                      <SelectItem value="true" className="text-[#0D1B35] focus:bg-[#F2F5FB]">Active</SelectItem>
                      <SelectItem value="false" className="text-[#0D1B35] focus:bg-[#F2F5FB]">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-[#6378A0]">Deskripsi</Label>
              <Textarea
                value={fDescription}
                onChange={(e) => setFDescription(e.target.value)}
                placeholder="Deskripsi singkat (opsional)"
                rows={3}
                className="bg-[#F2F5FB] border-[#D9E2F0] text-[#0D1B35] placeholder:text-[#6378A0] focus:border-[#B8901A] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="text-[#6378A0] hover:text-[#0D1B35]"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!fName.trim() || modalSaving}
              className="bg-[#0F1C3F] hover:bg-[#162040] text-white"
            >
              {modalSaving && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              {modalMode === "add" ? "Tambah" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white border-[#D9E2F0] text-[#0D1B35] max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0D1B35]">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
              Hapus {deletingItem ? modalTitles[deletingItem.target] : ""}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6378A0]">
            Hapus <span className="text-[#0D1B35] font-medium">&quot;{deletingItem?.name}&quot;</span>?
            Semua data di bawahnya juga akan terhapus.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-[#6378A0] hover:text-[#0D1B35]">
              <X className="w-3 h-3 mr-1" /> Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-[#0F1C3F] hover:bg-[#162040] text-white"
            >
              {deleteLoading && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
