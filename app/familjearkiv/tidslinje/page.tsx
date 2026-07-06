import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TimelineClient } from "@/components/familjearkiv/timeline-client";

export const metadata: Metadata = { title: "Tidslinje" };

export default async function TidslinjePage() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <TimelineClient events={events} />;
}
