import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");

  const sensors = await prisma.sensor.findMany({
    where: assetId ? { assetId } : {},
    include: {
      asset: {
        select: {
          name: true,
          pillar: true,
          site: { select: { name: true } },
        },
      },
      gateway: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sensors);
}
