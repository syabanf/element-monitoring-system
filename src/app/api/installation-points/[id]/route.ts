import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PillarType } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, code, pillar, description, isActive } = body;

  if (pillar && !Object.values(PillarType).includes(pillar)) {
    return NextResponse.json({ error: "Invalid pillar value" }, { status: 400 });
  }

  const point = await prisma.installationPoint.update({
    where: { id },
    data: { name, code, pillar, description, isActive },
  });

  return NextResponse.json(point);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.installationPoint.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
