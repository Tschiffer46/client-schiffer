import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Hittades inte" }, { status: 404 });
  }

  // Delete file
  try {
    await unlink(
      path.join(process.cwd(), "uploads", "photos", photo.filename)
    );
  } catch {
    // File may already be gone
  }

  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
