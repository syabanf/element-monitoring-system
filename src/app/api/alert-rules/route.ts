import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.alertRule.findMany({
    include: {
      sensor: {
        include: {
          asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
        },
      },
      _count: { select: { alerts: true } },
    },
    orderBy: [{ severity: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(rules);
}
