import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteId = req.nextUrl.searchParams.get("siteId");
  const where = siteId ? { siteId } : {};

  const buildings = await prisma.building.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { departments: true } }, site: { select: { name: true } } },
  });

  return NextResponse.json(buildings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { siteId, name, code, floors, description } = body;

  if (!siteId || !name) {
    return NextResponse.json({ error: "siteId and name are required" }, { status: 400 });
  }

  const building = await prisma.building.create({
    data: { siteId, name, code, floors: floors ?? 1, description },
  });

  return NextResponse.json(building, { status: 201 });
}
