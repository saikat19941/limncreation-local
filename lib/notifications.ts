import { execute, queryOne, queryRows } from "@/lib/db";
import type { AuthUser, NotificationRow, NotificationType } from "@/lib/types";

interface CreateNotificationInput {
  action_url?: string | null;
  created_by?: number | null;
  message?: string | null;
  title: string;
  type?: NotificationType;
}

export async function createNotification({
  action_url = null,
  created_by = null,
  message = null,
  title,
  type = "info",
}: CreateNotificationInput) {
  try {
    await execute(
      `INSERT INTO notifications (type, title, message, action_url, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [type, title, message, action_url, created_by],
    );
  } catch (error) {
    console.error("Failed to create notification.", error);
  }
}

export function actorId(user: AuthUser | null | undefined) {
  return user?.id ?? null;
}

export async function listNotifications({
  afterId = 0,
  limit = 10,
  unreadOnly = false,
}: {
  afterId?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const conditions = ["id > ?"];
  const values: Array<number | string> = [afterId];

  if (unreadOnly) {
    conditions.push("read_at IS NULL");
  }

  return queryRows<NotificationRow>(
    `SELECT id, type, title, message, action_url, created_by, read_at, created_at
     FROM notifications
     WHERE ${conditions.join(" AND ")}
     ORDER BY id DESC
     LIMIT ?`,
    [...values, limit],
  );
}

export async function getUnreadNotificationCount() {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM notifications
     WHERE read_at IS NULL`,
  );

  return row?.count ?? 0;
}
