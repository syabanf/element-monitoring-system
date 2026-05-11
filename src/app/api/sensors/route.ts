import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");
  const sensors = await prisma.sensor.findMany({
    where: assetId ? { assetId } : {},
    include: {
      asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
      gateway: { select: { name: true } },
    },
    orderBy: [{ asset: { site: { name: "asc" } } }, { name: "asc" }],
    take: 200,
  });
  return NextResponse.json(sensors);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { name: string; sensorType: string; metricName: string; unit: string; protocol?: string; assetId: string; gatewayId?: string; minValue?: number; maxValue?: number };
  const sensor = await prisma.sensor.create({
    data: {
      name: body.name,
      sensorType: body.sensorType,
      metricName: body.metricName,
      unit: body.unit,
      protocol: body.protocol ?? "Modbus",
      assetId: body.assetId,
      gatewayId: body.gatewayId,
      minValue: body.minValue,
      maxValue: body.maxValue,
      status: "ONLINE" as never,
    },
    include: { asset: { select: { name: true, pillar: true, site: { select: { name: true } } } }, gateway: { select: { name: true } } },
  });
  return NextResponse.json(sensor, { status: 201 });
}
