import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const persons = await prisma.person.findMany({
    orderBy: [{ generation: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(persons);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const data = await req.json();
  const person = await prisma.person.create({
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

  return NextResponse.json(person, { status: 201 });
}
