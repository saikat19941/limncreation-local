import { NotificationListPage } from "@/components/notifications/notification-provider";
import { PageSectionHeader } from "@/components/shared/page-section-header";

export default function NotificationsPage() {
  return (
    <div>
      <PageSectionHeader
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Notifications" },
        ]}
        description="Review live workspace events, system updates, and inventory activity."
        title="Notifications"
      />
      <NotificationListPage />
    </div>
  );
}
