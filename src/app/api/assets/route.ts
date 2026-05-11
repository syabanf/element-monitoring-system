import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const pillar = searchParams.get("pillar");
  const assets = await prisma.asset.findMany({
    where: {
      ...(siteId ? { siteId } : {}),
      ...(pillar ? { pillar: pillar as never } : {}),
    },
    include: {
      site: { select: { name: true, code: true } },
      zone: { select: { name: true } },
      _count: { select: { sensors: true, alerts: true } },
    },
    orderBy: [{ site: { name: "asc" } }, { pillar: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { name: string; code: string; assetType: string; pillar: string; siteId: string; manufacturer?: string; model?: string; serialNumber?: string; status?: string };
  const asset = await prisma.asset.create({
    data: {
      name: body.name,
      code: body.code,
      assetType: body.assetType,
      pillar: body.pillar as never,
      siteId: body.siteId,
      manufacturer: body.manufacturer,
      model: body.model,
      serialNumber: body.serialNumber,
      status: (body.status ?? "ACTIVE") as never,
    },
    include: { site: { select: { name: true, code: true } }, _count: { select: { sensors: true, alerts: true } } },
  });
  return NextResponse.json(asset, { status: 201 });
}
