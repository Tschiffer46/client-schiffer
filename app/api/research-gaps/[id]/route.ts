import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  const gap = await prisma.researchGap.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
    },
  });

  return NextResponse.json(gap);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.researchGap.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
