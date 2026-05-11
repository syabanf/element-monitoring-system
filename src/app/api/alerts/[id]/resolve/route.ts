import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data = schema.parse(body);

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      rootCause: data.rootCause,
      resolution: data.resolution,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ALERT_RESOLVED",
      entityType: "Alert",
      entityId: id,
      details: { rootCause: data.rootCause, resolution: data.resolution },
    },
  });

  return NextResponse.json(alert);
}
