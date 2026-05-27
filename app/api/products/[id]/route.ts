import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth";
import { mutateBackendTable } from "@/lib/backend";
import { execute } from "@/lib/db";
import { productSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PUT(request: Request, context: RouteContext<"/api/products/[id]">) {
  try {
    const user = await requireRole(["admin", "editor"]);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid product data." },
        { status: 400 },
      );
    }

    const payload = {
      asin: parsed.data.asin,
      description: parsed.data.description,
      sku: parsed.data.sku,
      title: parsed.data.title,
    };

    try {
      await mutateBackendTable({
        body: payload,
        id: Number(id),
        method: "PUT",
        tableName: "products",
        user,
      });
    } catch {
      await execute(
        `UPDATE products
         SET asin = ?, sku = ?, title = ?, description = ?
         WHERE id = ?`,
        [payload.asin, payload.sku, payload.title, payload.description, Number(id)],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/products/[id]">) {
  try {
    const user = await requireRole(["admin"]);
    const { id } = await context.params;

    try {
      await mutateBackendTable({
        id: Number(id),
        method: "DELETE",
        tableName: "products",
        user,
      });
    } catch {
      await execute("DELETE FROM products WHERE id = ?", [Number(id)]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete product." }, { status: 500 });
  }
}

