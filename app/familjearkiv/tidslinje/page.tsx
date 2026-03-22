import { prisma } from "@/lib/prisma";
import { TimelineClient } from "@/components/familjearkiv/timeline-client";

export default async function TidslinjePage() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <TimelineClient events={events} />;
}
