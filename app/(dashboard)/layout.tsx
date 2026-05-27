import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

