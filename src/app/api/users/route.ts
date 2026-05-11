import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.user.findMany({
    include: { organization: { select: { name: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { name: string; email: string; role: string; isActive?: boolean };
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      role: body.role as never,
      passwordHash: "",
      isActive: body.isActive ?? true,
      organizationId: "org_1",
    },
    include: { organization: { select: { name: true } } },
  });
  return NextResponse.json(user, { status: 201 });
}
