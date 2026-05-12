import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const buildingId = req.nextUrl.searchParams.get("buildingId");

  const departments = await prisma.department.findMany({
    where: buildingId ? { buildingId } : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { bagians: true } },
      building: { select: { name: true, site: { select: { name: true } } } },
    },
  });

  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { buildingId, name, code, description } = body;

  if (!buildingId || !name) {
    return NextResponse.json({ error: "buildingId and name are required" }, { status: 400 });
  }

  const dept = await prisma.department.create({
    data: { buildingId, name, code, description },
  });

  return NextResponse.json(dept, { status: 201 });
}
