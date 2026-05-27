"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Label,
  Pagination,
  Skeleton,
  Spinner,
  Table,
} from "@heroui/react";
import { Plus, RefreshCcw, Search, SquarePen, Trash2 } from "lucide-react";

import { useRealtimeRoom } from "@/components/inventory/realtime-room";
import { PageSectionHeader } from "@/components/shared/page-section-header";
import type { ProductRow } from "@/lib/types";

type InventoryPayload = {
  backendUrl: string;
  page: number;
  perPage: number;
  products: ProductRow[];
  total: number;
};

export function InventoryClient() {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "lcsin" | "sku" | "title">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      query,
      sortBy,
      sortDir,
    });

    try {
      const response = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as InventoryPayload & { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Failed to load products.");
        return;
      }

      setBackendUrl(payload.backendUrl);
      setProducts(payload.products);
      setTotal(payload.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, query, sortBy, sortDir]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, [loadProducts]);

  useRealtimeRoom({
    backendUrl,
    enabled: Boolean(backendUrl),
    onMessage: () => {
      setIsLoading(true);
      void loadProducts();
    },
    room: "limncreation_local.products",
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  async function deleteProduct(id: number) {
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Delete failed.");
      return;
    }

    await loadProducts();
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        action={
          <>
            <Button
              onPress={() => {
                setIsLoading(true);
                void loadProducts();
              }}
              variant="secondary"
            >
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
            <Button onPress={() => router.push("/dashboard/inventory/add")}>
              <Plus className="size-4" />
              Add product
            </Button>
          </>
        }
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Inventory" },
        ]}
        description="Search, sort, paginate, create, update, and remove products from a live local inventory table."
        title="Inventory"
      />
      <Card className="rounded-[1.75rem] p-5" variant="secondary">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-7"
              fullWidth
              onChange={(event) => {
                setIsLoading(true);
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by LCSIN, ASIN, SKU, or title"
              value={query}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown>
              <Button variant="secondary">Rows: {perPage}</Button>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  onAction={(key) => {
                    setIsLoading(true);
                    setPerPage(Number(key));
                  }}
                >
                  {[10, 20, 50].map((value) => (
                    <Dropdown.Item id={String(value)} key={value} textValue={String(value)}>
                      <Label>{value} rows</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            <Dropdown>
              <Button variant="secondary">
                Sort: {sortBy} / {sortDir}
              </Button>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  onAction={(key) => {
                    const [column, direction] = String(key).split(":");
                    setIsLoading(true);
                    setSortBy(column as typeof sortBy);
                    setSortDir(direction as typeof sortDir);
                  }}
                >
                  {[
                    "created_at:desc",
                    "created_at:asc",
                    "title:asc",
                    "lcsin:asc",
                    "sku:asc",
                  ].map((value) => (
                    <Dropdown.Item id={value} key={value} textValue={value}>
                      <Label>{value.replace(":", " / ")}</Label>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            <Chip color={backendUrl ? "success" : "warning"} variant="soft">
              {backendUrl ? "Realtime connected" : "Realtime waiting"}
            </Chip>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton className="h-14 w-full rounded-2xl" key={item} />
              ))}
            </div>
          ) : (
            <Table variant="secondary">
              <Table.ScrollContainer>
                <Table.Content aria-label="Inventory products" className="min-w-[980px]">
                  <Table.Header>
                    <Table.Column isRowHeader>ID</Table.Column>
                    <Table.Column>LCSIN</Table.Column>
                    <Table.Column>ASIN</Table.Column>
                    <Table.Column>SKU</Table.Column>
                    <Table.Column>Title</Table.Column>
                    <Table.Column>Created</Table.Column>
                    <Table.Column className="text-end">Actions</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {products.length === 0 ? (
                      <Table.Row id="empty">
                        <Table.Cell>No data</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>No products found.</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                      </Table.Row>
                    ) : (
                      products.map((product) => (
                        <Table.Row id={product.id} key={product.id}>
                          <Table.Cell>#{product.id}</Table.Cell>
                          <Table.Cell>
                            <Chip color="accent" size="sm" variant="soft">
                              {product.lcsin}
                            </Chip>
                          </Table.Cell>
                          <Table.Cell>{product.asin || "-"}</Table.Cell>
                          <Table.Cell>{product.sku || "-"}</Table.Cell>
                          <Table.Cell className="min-w-80">{product.title}</Table.Cell>
                          <Table.Cell>{new Date(product.created_at).toLocaleDateString()}</Table.Cell>
                          <Table.Cell>
                            <div className="flex justify-end gap-2">
                              <Button
                                isIconOnly
                                onPress={() =>
                                  router.push(
                                    `/dashboard/inventory/edit/${encodeURIComponent(product.lcsin)}`,
                                  )
                                }
                                size="sm"
                                variant="tertiary"
                              >
                                <SquarePen className="size-4" />
                              </Button>
                              <Button
                                isIconOnly
                                onPress={() => void deleteProduct(product.id)}
                                size="sm"
                                variant="danger-soft"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
              <Table.Footer className="pt-5">
                <Pagination className="w-full">
                  <Pagination.Summary>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Refreshing inventory
                      </span>
                    ) : (
                      `Showing ${products.length ? (page - 1) * perPage + 1 : 0}-${Math.min(page * perPage, total)} of ${total} results`
                    )}
                  </Pagination.Summary>
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous
                        isDisabled={page === 1}
                        onPress={() => {
                          setIsLoading(true);
                          setPage((current) => current - 1);
                        }}
                      >
                        <Pagination.PreviousIcon />
                        <span>Previous</span>
                      </Pagination.Previous>
                    </Pagination.Item>
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .slice(Math.max(0, page - 3), Math.max(5, page + 2))
                      .map((entry) => (
                        <Pagination.Item key={entry}>
                          <Pagination.Link
                            isActive={entry === page}
                            onPress={() => {
                              setIsLoading(true);
                              setPage(entry);
                            }}
                          >
                            {entry}
                          </Pagination.Link>
                        </Pagination.Item>
                      ))}
                    <Pagination.Item>
                      <Pagination.Next
                        isDisabled={page >= totalPages}
                        onPress={() => {
                          setIsLoading(true);
                          setPage((current) => current + 1);
                        }}
                      >
                        <span>Next</span>
                        <Pagination.NextIcon />
                      </Pagination.Next>
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination>
              </Table.Footer>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
