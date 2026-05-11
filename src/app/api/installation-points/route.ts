import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PillarType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ruanganId = req.nextUrl.searchParams.get("ruanganId");
  if (!ruanganId) return NextResponse.json({ error: "ruanganId required" }, { status: 400 });

  const points = await prisma.installationPoint.findMany({
    where: { ruanganId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(points);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ruanganId, name, code, pillar, description, isActive } = body;

  if (!ruanganId || !name || !pillar) {
    return NextResponse.json({ error: "ruanganId, name, and pillar are required" }, { status: 400 });
  }

  if (!Object.values(PillarType).includes(pillar)) {
    return NextResponse.json({ error: "Invalid pillar value" }, { status: 400 });
  }

  const point = await prisma.installationPoint.create({
    data: { ruanganId, name, code, pillar, description, isActive: isActive ?? true },
  });

  return NextResponse.json(point, { status: 201 });
}
