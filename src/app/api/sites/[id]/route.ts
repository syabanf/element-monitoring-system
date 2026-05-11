import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as { name?: string; code?: string; city?: string; address?: string; timezone?: string; isActive?: boolean };
  const site = await prisma.site.update({ where: { id }, data: body });
  return NextResponse.json(site);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.site.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
