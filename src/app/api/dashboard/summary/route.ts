import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalSites,
    totalAssets,
    totalSensors,
    onlineSensors,
    openAlerts,
    criticalAlerts,
    recentAlerts,
    siteList,
  ] = await Promise.all([
    prisma.site.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { status: "ACTIVE" } }),
    prisma.sensor.count(),
    prisma.sensor.count({ where: { status: "ONLINE" } }),
    prisma.alert.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
    prisma.alert.count({ where: { severity: "CRITICAL", status: { in: ["OPEN", "ACKNOWLEDGED"] } } }),
    prisma.alert.findMany({
      where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } },
      include: {
        asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
      },
      orderBy: { openedAt: "desc" },
      take: 10,
    }),
    prisma.site.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    }),
  ]);

  // Simulated KPI metrics (in real system these would aggregate telemetry)
  const kpis = {
    electricityKwh: 142500 + Math.floor(Math.random() * 5000),
    electricityKw: 2847 + Math.floor(Math.random() * 200),
    powerFactor: 0.87 + (Math.random() * 0.1 - 0.05),
    waterM3: 8420 + Math.floor(Math.random() * 500),
    leakRisk: "LOW",
    wastewaterCompliance: "COMPLIANT",
    gasExposure: "NORMAL",
    hvacEfficiency: 82 + Math.floor(Math.random() * 5),
    compressedAirLoss: 18 + Math.floor(Math.random() * 5),
    carbonTonsCO2: 68.4 + (Math.random() * 2 - 1),
    costToday: 24800 + Math.floor(Math.random() * 2000),
  };

  return NextResponse.json({
    summary: { totalSites, totalAssets, totalSensors, onlineSensors, openAlerts, criticalAlerts },
    kpis,
    recentAlerts,
    sites: siteList,
  });
}
