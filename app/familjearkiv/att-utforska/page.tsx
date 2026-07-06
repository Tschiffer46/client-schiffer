import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { GapsClient } from "@/components/familjearkiv/gaps-client";

export const metadata: Metadata = { title: "Olösta mysterier" };

export default async function AttUtforskaPage() {
  const gaps = await prisma.researchGap.findMany();
  return <GapsClient gaps={gaps} />;
}
