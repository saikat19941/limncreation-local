"use client";

import { useState } from "react";

import { Button, Input, Label, Modal } from "@heroui/react";

type ProductFormValues = {
  asin: string;
  description: string;
  sku: string;
  title: string;
};

export function ProductFormModal({
  isOpen,
  initialValues,
  onClose,
  onSubmit,
}: {
  initialValues: ProductFormValues;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    try {
      await onSubmit(form);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop />
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header className="border-b border-border/70 px-6 py-4">
            <div>
              <Modal.Heading className="text-xl">Product form</Modal.Heading>
              <p className="text-sm text-muted">Create or edit a product record.</p>
            </div>
          </Modal.Header>
          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-4 px-6 py-5">
              {[
                ["title", "Title"],
                ["sku", "SKU"],
                ["asin", "ASIN (optional)"],
              ].map(([key, label]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    fullWidth
                    id={key}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={label}
                    value={form[key as keyof ProductFormValues]}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  className="hero-border min-h-32 w-full rounded-[1rem] bg-field-background px-4 py-3 text-sm text-foreground outline-none focus:border-[color:var(--focus)]"
                  id="description"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Product description"
                  value={form.description}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-border/70 px-6 py-4">
              <Button onPress={onClose} type="button" variant="secondary">
                Cancel
              </Button>
              <Button isPending={isPending} type="submit">
                Save product
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
