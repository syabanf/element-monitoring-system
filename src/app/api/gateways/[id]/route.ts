import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as { name?: string; connectionType?: string; ipAddress?: string; status?: string; firmwareVersion?: string };
  const gw = await prisma.gateway.update({
    where: { id },
    data: body,
    include: { site: { select: { name: true } }, _count: { select: { sensors: true } } },
  });
  return NextResponse.json(gw);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.gateway.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
