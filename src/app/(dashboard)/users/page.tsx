import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Users } from "lucide-react";

const roleColors: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN: { bg: "#FEF2F2", text: "#B91C1C" },
  EXECUTIVE: { bg: "#F5F3FF", text: "#6D28D9" },
  ENERGY_MANAGER: { bg: "#FFFBEB", text: "#B45309" },
  OPERATIONS_SUPERVISOR: { bg: "#EFF6FF", text: "#1E5FA8" },
  TECHNICIAN: { bg: "#F0FDF4", text: "#166534" },
  FINANCE: { bg: "#ECFEFF", text: "#0E7490" },
  EHS_COMPLIANCE: { bg: "#F5F3FF", text: "#6D28D9" },
  VIEWER: { bg: "#F5F3EE", text: "#9C9285" },
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
          <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#B8901A]" />
          </div>
          <div>
            <h1 className="text-[#1C1714] text-2xl font-bold">User Management</h1>
            <p className="text-[#9C9285] text-sm mt-0.5">{users.length} users</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F3EE] border-b border-[#E5DDD0]">
                {["Name", "Email", "Role", "Organization", "Last Login", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#9C9285] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rc = roleColors[user.role] ?? roleColors.VIEWER;
                return (
                  <tr key={user.id} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FEF7E6] border border-[#F5E6B5] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#B8901A] text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <p className="text-[#1C1714] text-sm font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: rc.bg, color: rc.text }}>
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{user.organization.name}</td>
                    <td className="px-5 py-4 text-[#9C9285] text-xs">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, HH:mm") : "Never"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F5F3EE] text-[#9C9285]"}`}>
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
