import { notFound } from "next/navigation";

import { ProductFormPage } from "@/components/inventory/product-form-page";
import { queryOne } from "@/lib/db";
import type { ProductRow } from "@/lib/types";

export default async function EditInventoryPage(
  props: PageProps<"/dashboard/inventory/edit/[lcsin]">,
) {
  const { lcsin } = await props.params;

  const product = await queryOne<ProductRow>(
    `SELECT id, lcsin, asin, sku, title, description, created_at
     FROM products
     WHERE lcsin = ?
     LIMIT 1`,
    [lcsin],
  );

  if (!product) {
    notFound();
  }

  return (
    <ProductFormPage
      initialValues={{
        asin: product.asin || "",
        description: product.description || "",
        sku: product.sku || "",
        title: product.title,
      }}
      lcsin={product.lcsin}
      mode="edit"
      productId={product.id}
    />
  );
}

