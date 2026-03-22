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
  const event = await prisma.timelineEvent.update({
    where: { id },
    data: {
      year: data.year,
      title: data.title,
      description: data.description,
      type: data.type,
      major: data.major,
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.timelineEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
