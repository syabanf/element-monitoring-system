import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await prisma.site.findMany({
    where: { isActive: true },
    include: {
      buildings: { include: { zones: true } },
      gateways: { select: { id: true, name: true, status: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sites);
}
