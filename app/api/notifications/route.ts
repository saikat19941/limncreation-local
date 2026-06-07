import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireSession } from "@/lib/auth";
import { execute } from "@/lib/db";
import {
  actorId,
  createNotification,
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/notifications";
import { getAppSettings } from "@/lib/settings";
import { notificationCreateSchema, notificationQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const parsed = notificationQuerySchema.safeParse({
      afterId: request.nextUrl.searchParams.get("afterId"),
      limit: request.nextUrl.searchParams.get("limit"),
      unreadOnly: request.nextUrl.searchParams.get("unreadOnly"),
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid notification query." }, { status: 400 });
    }

    const [notifications, unreadCount, settings] = await Promise.all([
      listNotifications(parsed.data),
      getUnreadNotificationCount(),
      getAppSettings(),
    ]);

    return NextResponse.json({
      notifications,
      settings: {
        toast_enabled: settings.toast_enabled,
        toast_max_visible: settings.toast_max_visible,
        toast_placement: settings.toast_placement,
        toast_timeout_ms: settings.toast_timeout_ms,
      },
      unreadCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load notifications." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["admin", "editor"]);
    const body = await request.json();
    const parsed = notificationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid notification data." },
        { status: 400 },
      );
    }

    await createNotification({
      ...parsed.data,
      created_by: actorId(user),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create notification." }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await requireSession();
    await execute("UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE read_at IS NULL");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to mark notifications read." }, { status: 500 });
  }
}
