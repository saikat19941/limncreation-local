import { ProductFormPage } from "@/components/inventory/product-form-page";

export default function AddInventoryPage() {
  return (
    <ProductFormPage
      initialValues={{ asin: "", description: "", sku: "", title: "" }}
      mode="add"
    />
  );
}

