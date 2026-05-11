import Sidebar from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name ?? "Admin User";
  const userRole = (session?.user as any)?.role ?? "SUPER_ADMIN";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F5FB]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title="Element Monitoring System"
          notificationCount={3}
          userName={userName}
          userRole={userRole}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
