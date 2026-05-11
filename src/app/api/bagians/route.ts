import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const departmentId = req.nextUrl.searchParams.get("departmentId");
  if (!departmentId) return NextResponse.json({ error: "departmentId required" }, { status: 400 });

  const bagians = await prisma.bagian.findMany({
    where: { departmentId },
    orderBy: { name: "asc" },
    include: { _count: { select: { ruangans: true } } },
  });

  return NextResponse.json(bagians);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { departmentId, name, code, description } = body;

  if (!departmentId || !name) {
    return NextResponse.json({ error: "departmentId and name are required" }, { status: 400 });
  }

  const bagian = await prisma.bagian.create({
    data: { departmentId, name, code, description },
  });

  return NextResponse.json(bagian, { status: 201 });
}
