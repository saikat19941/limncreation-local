import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { queryOne, queryRows } from "@/lib/db";
import { getAppSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();

    const [productCount, userCount, roleRows, settings] = await Promise.all([
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM products"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM users"),
      queryRows<{ role: string }>("SELECT DISTINCT role FROM users ORDER BY role ASC"),
      getAppSettings(),
    ]);

    return NextResponse.json({
      stats: {
        configuredStoragePath: settings.storage_location_url || null,
        products: productCount?.count ?? 0,
        roles: roleRows.map((row) => row.role),
        settingsConfigured: Boolean(
          settings.backend_app_url && settings.storage_location_url && settings.app_name,
        ),
        users: userCount?.count ?? 0,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load summary." }, { status: 500 });
  }
}

