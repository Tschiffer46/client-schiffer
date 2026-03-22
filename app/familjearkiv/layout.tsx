import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { FamiljearkivShell } from "@/components/familjearkiv/shell";

export default async function FamiljearkivLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/logga-in");

  return <FamiljearkivShell>{children}</FamiljearkivShell>;
}
