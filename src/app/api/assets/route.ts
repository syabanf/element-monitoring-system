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
      ...(pillar ? { pillar: pillar as any } : {}),
    },
    include: {
      site: { select: { name: true, code: true } },
      zone: { select: { name: true } },
      _count: { select: { sensors: true, alerts: true } },
    },
    orderBy: [{ site: { name: "asc" } }, { name: "asc" }],
  });
  return NextResponse.json(assets);
}
