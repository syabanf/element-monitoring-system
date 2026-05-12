import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get("sensorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const quality = searchParams.get("quality");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "500", 10), 1000);

  if (!sensorId) return NextResponse.json({ error: "sensorId required" }, { status: 400 });

  const where: Record<string, unknown> = { sensorId };
  if (from || to) {
    where.timestamp = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to   ? { lte: new Date(to)   } : {}),
    };
  }
  if (quality) where.qualityStatus = quality;

  const [readings, sensor] = await Promise.all([
    prisma.telemetryReading.findMany({
      where,
      orderBy: { timestamp: "asc" },
      take: limit,
    }),
    prisma.sensor.findUnique({
      where: { id: sensorId },
      include: { asset: { select: { name: true, pillar: true, site: { select: { name: true } } } } },
    }),
  ]);

  if (!sensor) return NextResponse.json({ error: "Sensor not found" }, { status: 404 });

  const values = readings.map((r) => r.metricValue);
  const stats = values.length > 0 ? {
    min:  Math.min(...values),
    max:  Math.max(...values),
    avg:  values.reduce((a, b) => a + b, 0) / values.length,
    last: values[values.length - 1],
  } : null;

  return NextResponse.json({
    sensor: {
      id: sensor.id,
      name: sensor.name,
      metricName: sensor.metricName,
      unit: sensor.unit,
      minValue: sensor.minValue,
      maxValue: sensor.maxValue,
      assetName: sensor.asset.name,
      pillar: sensor.asset.pillar,
      siteName: sensor.asset.site.name,
    },
    stats,
    readings: readings.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      value: r.metricValue,
      unit: r.unit,
      quality: r.qualityStatus,
    })),
  });
}
