import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rule = await prisma.alertRule.findUnique({
    where: { id },
    include: {
      sensor: { include: { asset: { include: { site: { select: { name: true } } } } } },
      alerts: { orderBy: { openedAt: "desc" }, take: 5, select: { id: true, title: true, severity: true, status: true, openedAt: true } },
      _count: { select: { alerts: true } },
    },
  });
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rule);
}
