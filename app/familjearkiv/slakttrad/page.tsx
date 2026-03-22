import { prisma } from "@/lib/prisma";
import { FamilyTreeClient } from "@/components/familjearkiv/family-tree-client";

export default async function SlakttradPage() {
  const persons = await prisma.person.findMany({
    orderBy: [{ generation: "asc" }, { sortOrder: "asc" }],
  });

  const relationships = await prisma.relationship.findMany();

  return <FamilyTreeClient persons={persons} relationships={relationships} />;
}
