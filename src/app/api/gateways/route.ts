import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const gateways = await prisma.gateway.findMany({
    include: { site: { select: { name: true } }, _count: { select: { sensors: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(gateways);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { name: string; serialNumber: string; connectionType?: string; ipAddress?: string; siteId: string; firmwareVersion?: string };
  const gw = await prisma.gateway.create({
    data: {
      name: body.name,
      serialNumber: body.serialNumber,
      connectionType: body.connectionType ?? "LoRaWAN",
      ipAddress: body.ipAddress,
      siteId: body.siteId,
      firmwareVersion: body.firmwareVersion,
      status: "online",
    },
    include: { site: { select: { name: true } }, _count: { select: { sensors: true } } },
  });
  return NextResponse.json(gw, { status: 201 });
}
