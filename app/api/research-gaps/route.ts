import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const gaps = await prisma.researchGap.findMany();
  return NextResponse.json(gaps);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const data = await req.json();
  const gap = await prisma.researchGap.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "low",
    },
  });

  return NextResponse.json(gap, { status: 201 });
}
