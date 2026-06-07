import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { execute } from "@/lib/db";
import { mutateBackendTable } from "@/lib/backend";
import { actorId, createNotification } from "@/lib/notifications";
import { getAppSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const settings = await getAppSettings();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireSession();
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid settings data." },
        { status: 400 },
      );
    }

    const current = await getAppSettings();

    try {
      if (current.id) {
        await mutateBackendTable({
          body: parsed.data,
          id: current.id,
          method: "PUT",
          tableName: "settings",
          user,
        });
      } else {
        await mutateBackendTable({
          body: parsed.data,
          method: "POST",
          tableName: "settings",
          user,
        });
      }
    } catch {
      if (current.id) {
        await execute(
          `UPDATE settings
           SET app_name = ?,
               backend_app_url = ?,
               storage_location_url = ?,
               product_delete_protection = ?,
               toast_enabled = ?,
               toast_placement = ?,
               toast_timeout_ms = ?,
               toast_max_visible = ?
           WHERE id = ?`,
          [
            parsed.data.app_name,
            parsed.data.backend_app_url,
            parsed.data.storage_location_url,
            parsed.data.product_delete_protection,
            parsed.data.toast_enabled,
            parsed.data.toast_placement,
            parsed.data.toast_timeout_ms,
            parsed.data.toast_max_visible,
            current.id,
          ],
        );
      } else {
        await execute(
          `INSERT INTO settings (
             app_name,
             backend_app_url,
             storage_location_url,
             product_delete_protection,
             toast_enabled,
             toast_placement,
             toast_timeout_ms,
             toast_max_visible
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            parsed.data.app_name,
            parsed.data.backend_app_url,
            parsed.data.storage_location_url,
            parsed.data.product_delete_protection,
            parsed.data.toast_enabled,
            parsed.data.toast_placement,
            parsed.data.toast_timeout_ms,
            parsed.data.toast_max_visible,
          ],
        );
      }
    }

    const settings = await getAppSettings();
    await createNotification({
      action_url: "/dashboard/settings",
      created_by: actorId(user),
      message: "Workspace and toast preferences were saved.",
      title: "Settings updated",
      type: "success",
    });

    return NextResponse.json({ settings, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update settings." }, { status: 500 });
  }
}

