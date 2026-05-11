import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "100");

  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
  return NextResponse.json(logs);
}
