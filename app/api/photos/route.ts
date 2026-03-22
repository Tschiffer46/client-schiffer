import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "photos");

export async function GET() {
  const photos = await prisma.photo.findMany({
    include: { labels: { include: { person: true } } },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;
  const personIds = formData.getAll("personIds") as string[];

  if (!file) {
    return NextResponse.json({ error: "Ingen fil" }, { status: 400 });
  }

  // Save file
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Create DB record
  const photo = await prisma.photo.create({
    data: {
      filename,
      originalName: file.name,
      caption: caption || null,
      labels: {
        create: personIds.map((personId) => ({ personId })),
      },
    },
    include: { labels: { include: { person: true } } },
  });

  return NextResponse.json(photo, { status: 201 });
}
