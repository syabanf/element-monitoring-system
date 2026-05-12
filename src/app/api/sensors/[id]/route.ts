import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sensor = await prisma.sensor.findUnique({
    where: { id },
    include: {
      asset: { include: { site: { select: { name: true } } } },
      gateway: { select: { id: true, name: true, status: true } },
      alertRules: { select: { id: true, name: true, operator: true, threshold: true, severity: true, isActive: true } },
    },
  });
  if (!sensor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sensor);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as { name?: string; sensorType?: string; metricName?: string; unit?: string; protocol?: string; status?: string; minValue?: number; maxValue?: number };
  const sensor = await prisma.sensor.update({
    where: { id },
    data: { ...body, status: body.status as never },
    include: { asset: { select: { name: true, pillar: true, site: { select: { name: true } } } }, gateway: { select: { name: true } } },
  });
  return NextResponse.json(sensor);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.sensor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
