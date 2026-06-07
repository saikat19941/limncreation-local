import { NextRequest, NextResponse } from "next/server";

import { requireRole, requireSession } from "@/lib/auth";
import { mutateBackendTable } from "@/lib/backend";
import { execute, queryOne, queryRows } from "@/lib/db";
import { createProductFolder } from "@/lib/filesystem";
import { generateUniqueLcsin } from "@/lib/lcsin";
import { actorId, createNotification } from "@/lib/notifications";
import { getAppSettings } from "@/lib/settings";
import type { ProductRow } from "@/lib/types";
import { productQuerySchema, productSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireSession();

    const parsed = productQuerySchema.safeParse({
      page: request.nextUrl.searchParams.get("page"),
      perPage: request.nextUrl.searchParams.get("perPage"),
      query: request.nextUrl.searchParams.get("query"),
      sortBy: request.nextUrl.searchParams.get("sortBy"),
      sortDir: request.nextUrl.searchParams.get("sortDir"),
    });

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid query." }, { status: 400 });
    }

    const { page, perPage, query, sortBy, sortDir } = parsed.data;
    const offset = (page - 1) * perPage;
    const whereValues: string[] = [];
    let whereClause = "";

    if (query) {
      whereClause = `
        WHERE lcsin LIKE ?
           OR COALESCE(asin, '') LIKE ?
           OR COALESCE(sku, '') LIKE ?
           OR title LIKE ?
      `;
      whereValues.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
    }

    const [products, countRow, settings] = await Promise.all([
      queryRows<ProductRow>(
        `SELECT id, lcsin, asin, sku, title, description, created_at
         FROM products
         ${whereClause}
         ORDER BY ${sortBy} ${sortDir.toUpperCase()}
         LIMIT ?
         OFFSET ?`,
        [...whereValues, perPage, offset],
      ),
      queryOne<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM products
         ${whereClause}`,
        whereValues,
      ),
      getAppSettings(),
    ]);

    return NextResponse.json({
      backendUrl: settings.backend_app_url,
      page,
      perPage,
      products,
      productDeleteProtection: settings.product_delete_protection,
      total: countRow?.count ?? 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to load products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["admin", "editor"]);
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid product data." },
        { status: 400 },
      );
    }

    const settings = await getAppSettings();

    if (!settings.storage_location_url) {
      return NextResponse.json(
        { message: "Set a storage location before creating products." },
        { status: 400 },
      );
    }

    const lcsin = await generateUniqueLcsin();
    const payload = {
      asin: parsed.data.asin,
      description: parsed.data.description,
      lcsin,
      sku: parsed.data.sku,
      title: parsed.data.title,
    };

    await createProductFolder(settings.storage_location_url, lcsin);

    try {
      await mutateBackendTable({
        body: payload,
        method: "POST",
        tableName: "products",
        user,
      });
    } catch {
      await execute(
        `INSERT INTO products (lcsin, asin, sku, title, description)
         VALUES (?, ?, ?, ?, ?)`,
        [payload.lcsin, payload.asin, payload.sku, payload.title, payload.description],
      );
    }

    await createNotification({
      action_url: `/dashboard/inventory/view/${encodeURIComponent(lcsin)}`,
      created_by: actorId(user),
      message: `${payload.title} was added with LCSIN ${lcsin}.`,
      title: "Product created",
      type: "success",
    });

    return NextResponse.json({ lcsin, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create product." }, { status: 500 });
  }
}
