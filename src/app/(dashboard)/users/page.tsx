import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Users } from "lucide-react";

const roleColors: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN: { bg: "#e11d4820", text: "#e11d48" },
  EXECUTIVE: { bg: "#6366f120", text: "#6366f1" },
  ENERGY_MANAGER: { bg: "#f59e0b20", text: "#f59e0b" },
  OPERATIONS_SUPERVISOR: { bg: "#3b82f620", text: "#3b82f6" },
  TECHNICIAN: { bg: "#22c55e20", text: "#22c55e" },
  FINANCE: { bg: "#06b6d420", text: "#06b6d4" },
  EHS_COMPLIANCE: { bg: "#8b5cf620", text: "#8b5cf6" },
  VIEWER: { bg: "#88888820", text: "#888888" },
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { organization: { select: { name: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e11d4810] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#e11d48]" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">User Management</h1>
            <p className="text-[#888888] text-sm mt-0.5">{users.length} users</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Name", "Email", "Role", "Organization", "Last Login", "Status"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {users.map((user) => {
                const rc = roleColors[user.role] ?? roleColors.VIEWER;
                return (
                  <tr key={user.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#e11d4820] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#e11d48] text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#888888]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: rc.bg, color: rc.text }}>
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888888]">{user.organization.name}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, HH:mm") : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${user.isActive ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#88888820] text-[#888888]"}`}>
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
