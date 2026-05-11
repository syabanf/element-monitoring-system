import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.report.findMany({
    include: { generator: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const report = await prisma.report.create({
    data: {
      generatedBy: session.user.id,
      reportType: body.reportType,
      title: body.title,
      period: body.period,
      status: "ready",
      parameters: body.parameters,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "REPORT_GENERATED",
      entityType: "Report",
      entityId: report.id,
      details: { reportType: body.reportType, period: body.period },
    },
  });

  return NextResponse.json(report, { status: 201 });
}
