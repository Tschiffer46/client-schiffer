import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FamilyTreeClient } from "@/components/familjearkiv/family-tree-client";

export const metadata: Metadata = { title: "Släktträd" };

export default async function SlakttradPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string }>;
}) {
  const { person } = await searchParams;

  const persons = await prisma.person.findMany({
    orderBy: [{ generation: "asc" }, { sortOrder: "asc" }],
  });

  const relationships = await prisma.relationship.findMany();

  return (
    <FamilyTreeClient
      persons={persons}
      relationships={relationships}
      initialSelectedId={person}
    />
  );
}
