import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { execute } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(_request: Request, context: RouteContext<"/api/notifications/[id]">) {
  try {
    await requireSession();
    const { id } = await context.params;

    await execute(
      `UPDATE notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [Number(id)],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update notification." }, { status: 500 });
  }
}
