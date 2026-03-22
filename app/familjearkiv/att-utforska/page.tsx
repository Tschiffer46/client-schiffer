import { prisma } from "@/lib/prisma";
import { GapsClient } from "@/components/familjearkiv/gaps-client";

export default async function AttUtforskaPage() {
  const gaps = await prisma.researchGap.findMany();
  return <GapsClient gaps={gaps} />;
}
