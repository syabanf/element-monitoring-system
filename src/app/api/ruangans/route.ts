import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bagianId = req.nextUrl.searchParams.get("bagianId");
  if (!bagianId) return NextResponse.json({ error: "bagianId required" }, { status: 400 });

  const ruangans = await prisma.ruangan.findMany({
    where: { bagianId },
    orderBy: { name: "asc" },
    include: { _count: { select: { installationPoints: true } } },
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
