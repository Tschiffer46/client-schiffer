import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      relationshipsFrom: true,
      relationshipsTo: true,
      photoLabels: { include: { photo: true } },
    },
  });
  if (!person) {
    return NextResponse.json({ error: "Hittades inte" }, { status: 404 });
  }
  return NextResponse.json(person);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  const person = await prisma.person.update({
    where: { id },
    data: {
      name: data.name,
      nickname: data.nickname || null,
      born: data.born || "",
      died: data.died || "",
      role: data.role || "",
      country: data.country || "",
      generation: data.generation || 0,
      branch: data.branch || "",
      story: data.story || "",
      sortOrder: data.sortOrder || 0,
    },
  });

  return NextResponse.json(person);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.person.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
