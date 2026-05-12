import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bagianId = req.nextUrl.searchParams.get("bagianId");

  const ruangans = await prisma.ruangan.findMany({
    where: bagianId ? { bagianId } : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { installationPoints: true } },
      bagian: { select: { name: true, department: { select: { name: true } } } },
    },
  });

  return NextResponse.json(ruangans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bagianId, name, code, floor, description } = body;

  if (!bagianId || !name) {
    return NextResponse.json({ error: "bagianId and name are required" }, { status: 400 });
  }

  const ruangan = await prisma.ruangan.create({
    data: { bagianId, name, code, floor, description },
  });

  return NextResponse.json(ruangan, { status: 201 });
}
