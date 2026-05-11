import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const alert = await prisma.alert.update({
    where: { id },
    data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ALERT_ACKNOWLEDGED",
      entityType: "Alert",
      entityId: id,
      details: { alertTitle: alert.title },
    },
  });

  return NextResponse.json(alert);
}
