import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { execute } from "@/lib/db";
import { mutateBackendTable } from "@/lib/backend";
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
           SET app_name = ?, backend_app_url = ?, storage_location_url = ?, product_delete_protection = ?
           WHERE id = ?`,
          [
            parsed.data.app_name,
            parsed.data.backend_app_url,
            parsed.data.storage_location_url,
            parsed.data.product_delete_protection,
            current.id,
          ],
        );
      } else {
        await execute(
          `INSERT INTO settings (app_name, backend_app_url, storage_location_url, product_delete_protection)
           VALUES (?, ?, ?, ?)`,
          [
            parsed.data.app_name,
            parsed.data.backend_app_url,
            parsed.data.storage_location_url,
            parsed.data.product_delete_protection,
          ],
        );
      }
    }

    const settings = await getAppSettings();
    return NextResponse.json({ settings, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update settings." }, { status: 500 });
  }
}

