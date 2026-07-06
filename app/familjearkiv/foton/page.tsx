import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PhotosClient } from "@/components/familjearkiv/photos-client";

export const metadata: Metadata = { title: "Foton" };

export default async function FotonPage() {
  const photos = await prisma.photo.findMany({
    include: { labels: { include: { person: true } } },
    orderBy: { uploadedAt: "desc" },
  });

  const persons = await prisma.person.findMany({
    select: { id: true, name: true, nickname: true },
    orderBy: [{ generation: "asc" }, { name: "asc" }],
  });

  return <PhotosClient photos={photos} persons={persons} />;
}
