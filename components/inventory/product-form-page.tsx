"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Form, Input, Label } from "@heroui/react";
import { ArrowLeft, Boxes, Save } from "lucide-react";

import { PageSectionHeader } from "@/components/shared/page-section-header";

export type ProductFormValues = {
  asin: string;
  description: string;
  sku: string;
  title: string;
};

export function ProductFormPage({
  initialValues,
  lcsin,
  mode,
  productId,
}: {
  initialValues: ProductFormValues;
  lcsin?: string;
  mode: "add" | "edit";
  productId?: number;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [isPending, setIsPending] = useState(false);

  const isEdit = mode === "edit";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const response = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: isEdit ? "PUT" : "POST",
      });

      const payload = (await response.json()) as { lcsin?: string; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to save product.");
        return;
      }

      router.push("/dashboard/inventory");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        action={
          <Button onPress={() => router.push("/dashboard/inventory")} variant="secondary">
            <ArrowLeft className="size-4" />
            Back to inventory
          </Button>
        }
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/inventory", label: "Inventory" },
          { label: isEdit ? "Edit" : "Add" },
        ]}
        description={
          isEdit
            ? "Update product information on a dedicated page instead of using a modal."
            : "Create a new inventory product. LCSIN will be auto-generated and a storage folder will be created automatically."
        }
        title={isEdit ? "Edit Product" : "Add Product"}
      />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_minmax(280px,360px)]">
        <Card className="rounded-[1.75rem] p-5" variant="secondary">
          <Form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                fullWidth
                id="title"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Product title"
                value={form.title}
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  fullWidth
                  id="sku"
                  onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                  placeholder="Stock keeping unit"
                  value={form.sku}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asin">ASIN</Label>
                <Input
                  fullWidth
                  id="asin"
                  onChange={(event) => setForm((current) => ({ ...current, asin: event.target.value }))}
                  placeholder="Amazon Standard Identification Number"
                  value={form.asin}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                className="hero-border min-h-40 w-full rounded-[1rem] bg-field-background px-4 py-3 text-sm text-foreground outline-none focus:border-[color:var(--focus)]"
                id="description"
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Write a clear product description"
                value={form.description}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button isPending={isPending} type="submit">
                <Save className="size-4" />
                {isEdit ? "Update product" : "Create product"}
              </Button>
              <Button
                onPress={() => router.push("/dashboard/inventory")}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card>
        <Card className="rounded-[1.75rem] p-5" variant="secondary">
          <Card.Header className="flex flex-col items-start gap-3 p-0">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-tertiary text-accent">
              <Boxes className="size-5" />
            </div>
            <div className="space-y-2">
              <Card.Description>Form details</Card.Description>
              <Card.Title className="text-2xl">{isEdit ? "Current product" : "New product"}</Card.Title>
            </div>
          </Card.Header>
          <Card.Content className="space-y-4 p-0 pt-5">
            <div className="rounded-[1.25rem] bg-surface p-4">
              <p className="text-xs tracking-[0.18em] text-muted uppercase">LCSIN</p>
              <p className="mt-2 text-sm text-foreground">
                {lcsin || "Will be auto-generated after submit"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-surface p-4">
              <p className="text-xs tracking-[0.18em] text-muted uppercase">Flow</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                After save, the app returns to the inventory table. New products also create a
                folder using the configured storage location.
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
