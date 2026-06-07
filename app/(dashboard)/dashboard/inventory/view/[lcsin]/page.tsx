import { notFound } from "next/navigation";

import { queryOne } from "@/lib/db";
import type { ProductRow } from "@/lib/types";
import { PageSectionHeader } from "@/components/shared/page-section-header";


export default async function ViewInventoryPage(
  props: PageProps<"/dashboard/inventory/view/[lcsin]">,
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
    <PageSectionHeader
       
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/inventory", label: "Inventory" },
          { label: product.title },
        ]}
        description="Search, sort, paginate, create, update, and remove products from a live local inventory table."
        title={product.title}
        inventory_sub={true}
        productData={[
          {
            id: String(product.id),
            lcsin: product.lcsin,
            asin: product.asin || undefined,
            sku: product.sku || undefined,
            title: product.title,
            description: product.description || undefined,
            created_at: product.created_at,
          }
        ]}
    //     <h1 className="text-2xl font-bold mb-4">View Product</h1>
    //     <p>{product.title}</p>
    // </div>
    // <ProductFormPage
    //   initialValues={{
    //     asin: product.asin || "",
    //     description: product.description || "",
    //     sku: product.sku || "",
    //     title: product.title,
    //   }}
    //   lcsin={product.lcsin}
    //   mode="edit"
    //   productId={product.id}
    />
  );
}

