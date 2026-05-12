"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #EDF1FA 0%, #F0F4FB 50%, #EBF0F8 100%)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
