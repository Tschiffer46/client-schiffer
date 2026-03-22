import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const data = await req.json();
  const event = await prisma.timelineEvent.create({
    data: {
      year: data.year,
      title: data.title,
      description: data.description,
      type: data.type || "family",
      major: data.major || false,
      sortOrder: data.sortOrder || 0,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
