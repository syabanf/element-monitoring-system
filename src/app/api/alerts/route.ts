import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const alerts = await prisma.alert.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(severity ? { severity: severity as any } : {}),
    },
    include: {
      asset: {
        select: {
          name: true,
          pillar: true,
          site: { select: { name: true } },
        },
      },
      assignee: { select: { name: true, email: true } },
      workOrder: { select: { id: true, status: true } },
    },
    orderBy: { openedAt: "desc" },
    take: limit,
  });
  return NextResponse.json(alerts);
}
