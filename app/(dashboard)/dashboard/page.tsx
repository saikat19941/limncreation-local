import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageSectionHeader } from "@/components/shared/page-section-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageSectionHeader
        breadcrumb={[{ label: "Dashboard" }]}
        description="Monitor your local workspace, inventory activity, and environment readiness at a glance."
        title="Dashboard"
      />
      <DashboardOverview />
    </div>
  );
}

