import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as { name?: string; code?: string; assetType?: string; pillar?: string; siteId?: string; manufacturer?: string; model?: string; status?: string };
  const asset = await prisma.asset.update({
    where: { id },
    data: { ...body, pillar: body.pillar as never, status: body.status as never },
    include: { site: { select: { name: true, code: true } }, _count: { select: { sensors: true, alerts: true } } },
  });
  return NextResponse.json(asset);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.asset.update({ where: { id }, data: { status: "DECOMMISSIONED" as never } });
  return NextResponse.json({ ok: true });
}
