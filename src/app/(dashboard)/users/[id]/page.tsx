"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { alerts: number; reports: number };
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN:           { bg: "#FFFBEB", text: "#B8901A" },
  ADMIN:                 { bg: "#EFF6FF", text: "#1E5FA8" },
  EXECUTIVE:             { bg: "#F5F3FF", text: "#6D28D9" },
  ENERGY_MANAGER:        { bg: "#FFFBEB", text: "#B45309" },
  OPERATIONS_SUPERVISOR: { bg: "#EFF6FF", text: "#1E5FA8" },
  TECHNICIAN:            { bg: "#F0FDF4", text: "#166534" },
  FINANCE:               { bg: "#ECFEFF", text: "#0E7490" },
  EHS_COMPLIANCE:        { bg: "#F5F3FF", text: "#6D28D9" },
  OPERATOR:              { bg: "#F0FDF4", text: "#166534" },
  VIEWER:                { bg: "#F2F5FB", text: "#6378A0" },
};

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d: UserDetail) => { setUser(d); setLoading(false); })
      .catch(() => { setError("User not found"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#B8901A] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !user) {
    return <div className="p-6 text-center text-[#6378A0]">{error ?? "User not found"}</div>;
  }

  const rc = ROLE_COLORS[user.role] ?? ROLE_COLORS.VIEWER;

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => router.push("/users")} className="flex items-center gap-1.5 text-[#6378A0] text-sm hover:text-[#0D1B35] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* Header card */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
            <span className="text-[#B8901A] text-xl font-bold">{getInitials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[#0D1B35] text-2xl font-bold">{user.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: rc.bg, color: rc.text }}>{user.role.replace(/_/g, " ")}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F2F5FB] text-[#6378A0]"}`}>
                {user.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <p className="text-[#6378A0] text-sm mt-1">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E4EAF5]">
          {[
            { label: "Email", value: user.email },
            { label: "Role", value: user.role.replace(/_/g, " ") },
            { label: "Member Since", value: format(new Date(user.createdAt), "MMM d, yyyy") },
            { label: "Last Updated", value: format(new Date(user.updatedAt), "MMM d, yyyy") },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[#6378A0] text-xs font-medium uppercase tracking-wider">{label}</p>
              <p className="text-[#0D1B35] text-sm font-medium mt-1 break-all">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
          <p className="text-[#6378A0] text-sm font-medium uppercase tracking-wider">Assigned Alerts</p>
          <p className="text-[#0D1B35] text-4xl font-bold mt-2">{user._count.alerts}</p>
          <p className="text-[#6378A0] text-xs mt-1">alerts assigned to this user</p>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
          <p className="text-[#6378A0] text-sm font-medium uppercase tracking-wider">Generated Reports</p>
          <p className="text-[#0D1B35] text-4xl font-bold mt-2">{user._count.reports}</p>
          <p className="text-[#6378A0] text-xs mt-1">reports generated by this user</p>
        </div>
      </div>

      {/* Account status */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl shadow-sm p-6">
        <h2 className="text-[#0D1B35] font-semibold mb-4">Account Status</h2>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${user.isActive ? "bg-[#166534] animate-pulse" : "bg-[#6378A0]"}`} />
          <div>
            <p className="text-[#0D1B35] text-sm font-semibold">{user.isActive ? "Active Account" : "Inactive Account"}</p>
            <p className="text-[#6378A0] text-xs mt-0.5">
              {user.isActive
                ? "This user can log in and access the system."
                : "This user cannot log in. Account has been deactivated."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
