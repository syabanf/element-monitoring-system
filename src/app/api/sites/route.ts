import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sites = await prisma.site.findMany({
    include: {
      buildings: { include: { _count: { select: { zones: true } } } },
      gateways: { select: { id: true, name: true, status: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sites);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { name: string; code: string; city?: string; address?: string; timezone?: string };
  const site = await prisma.site.create({
    data: {
      name: body.name,
      code: body.code,
      city: body.city ?? "",
      address: body.address ?? "",
      timezone: body.timezone ?? "Asia/Jakarta",
      organizationId: "org_1",
      isActive: true,
    },
  });
  return NextResponse.json(site, { status: 201 });
}
