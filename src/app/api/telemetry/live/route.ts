import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const sensors = await prisma.sensor.findMany({
    where: {
      asset: siteId ? { siteId } : {},
      status: "ONLINE",
    },
    include: {
      asset: {
        select: {
          name: true,
          pillar: true,
          site: { select: { name: true } },
        },
      },
    },
    take: 100,
  });

  return NextResponse.json(
    sensors.map((s) => ({
      sensorId: s.id,
      sensorName: s.name,
      assetName: s.asset.name,
      pillar: s.asset.pillar,
      siteName: s.asset.site.name,
      metricName: s.metricName,
      lastValue: s.lastValue,
      unit: s.unit,
      status: s.status,
      lastReadingAt: s.lastReadingAt,
    }))
  );
}
