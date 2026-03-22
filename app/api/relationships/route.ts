import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const rels = await prisma.relationship.findMany();
  return NextResponse.json(rels);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const data = await req.json();
  const rel = await prisma.relationship.create({
    data: {
      fromId: data.fromId,
      toId: data.toId,
      type: data.type,
    },
  });

  return NextResponse.json(rel, { status: 201 });
}
