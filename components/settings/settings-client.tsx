"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Skeleton,
  Spinner,
  Switch,
} from "@heroui/react";

import { PageSectionHeader } from "@/components/shared/page-section-header";
import type { AppSettings } from "@/lib/types";

type SettingsForm = {
  app_name: string;
  backend_app_url: string;
  product_delete_protection: boolean;
  storage_location_url: string;
  toast_enabled: boolean;
  toast_max_visible: number;
  toast_placement: AppSettings["toast_placement"];
  toast_timeout_ms: number;
};

type SettingsTextKey = "app_name" | "backend_app_url" | "storage_location_url";

export function SettingsClient() {
  const textFields: Array<{
    key: SettingsTextKey;
    label: string;
  }> = [
    { key: "app_name", label: "App name" },
    { key: "backend_app_url", label: "Backend app URL" },
    { key: "storage_location_url", label: "Storage location path" },
  ];

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [form, setForm] = useState<SettingsForm>({
    app_name: "",
    backend_app_url: "",
    product_delete_protection: false,
    storage_location_url: "",
    toast_enabled: true,
    toast_max_visible: 3,
    toast_placement: "bottom end",
    toast_timeout_ms: 5000,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const payload = (await response.json()) as { settings: AppSettings };

      if (mounted) {
        setSettings(payload.settings);
        setForm({
          app_name: payload.settings.app_name,
          backend_app_url: payload.settings.backend_app_url,
          product_delete_protection: payload.settings.product_delete_protection,
          storage_location_url: payload.settings.storage_location_url,
          toast_enabled: payload.settings.toast_enabled,
          toast_max_visible: payload.settings.toast_max_visible,
          toast_placement: payload.settings.toast_placement,
          toast_timeout_ms: payload.settings.toast_timeout_ms,
        });
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const payload = (await response.json()) as { message?: string; settings?: AppSettings };

      if (!response.ok || !payload.settings) {
        setError(payload.message ?? "Failed to save settings.");
        return;
      }

      setSettings(payload.settings);
      setSuccess("Settings updated successfully.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Settings" },
        ]}
        description="Control the backend URL, storage folder root, and workspace name from one place."
        title="Workspace Settings"
      />
      <div className="grid gap-5 xl:grid-cols-[1.45fr_minmax(280px,360px)]">
        <Card className="rounded-[1.75rem] p-5" variant="secondary">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div className="space-y-2" key={item}>
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <Form className="space-y-5" onSubmit={handleSubmit}>
              {textFields.map(({ key, label }) => (
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
                    value={form[key]}
                  />
                </div>
              ))}
              <div className="rounded-[1.5rem] border border-border/70 bg-surface px-4 py-4">
                <Switch
                  isSelected={form.product_delete_protection}
                  onChange={(isSelected) =>
                    setForm((current) => ({
                      ...current,
                      product_delete_protection: isSelected,
                    }))
                  }
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Content>
                    <Label className="text-sm font-medium">Product delete protection</Label>
                    <p className="text-sm text-muted">
                      Turn this on to allow product deletion from the inventory page.
                    </p>
                  </Switch.Content>
                </Switch>
              </div>
              <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-surface px-4 py-4">
                <Switch
                  isSelected={form.toast_enabled}
                  onChange={(isSelected) =>
                    setForm((current) => ({
                      ...current,
                      toast_enabled: isSelected,
                    }))
                  }
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Content>
                    <Label className="text-sm font-medium">Realtime toast notifications</Label>
                    <p className="text-sm text-muted">
                      Show HeroUI toast alerts when new workspace notifications arrive.
                    </p>
                  </Switch.Content>
                </Switch>
                <div className="grid gap-4 md:grid-cols-3">
                  <Select
                    fullWidth
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        toast_placement: value as AppSettings["toast_placement"],
                      }))
                    }
                    value={form.toast_placement}
                    variant="secondary"
                  >
                    <Label>Toast placement</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {[
                          "top start",
                          "top",
                          "top end",
                          "bottom start",
                          "bottom",
                          "bottom end",
                        ].map((placement) => (
                          <ListBox.Item id={placement} key={placement} textValue={placement}>
                            {placement}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <div className="space-y-2">
                    <Label htmlFor="toast_timeout_ms">Toast timeout ms</Label>
                    <Input
                      fullWidth
                      id="toast_timeout_ms"
                      min={1000}
                      max={30000}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          toast_timeout_ms: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={String(form.toast_timeout_ms)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toast_max_visible">Max visible toasts</Label>
                    <Input
                      fullWidth
                      id="toast_max_visible"
                      min={1}
                      max={5}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          toast_max_visible: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={String(form.toast_max_visible)}
                    />
                  </div>
                </div>
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              {success ? <p className="text-sm text-success">{success}</p> : null}
              <Button isPending={isSaving} type="submit">
                Save settings
              </Button>
            </Form>
          )}
        </Card>
        <Card className="rounded-[1.75rem] p-5" variant="secondary">
          <Card.Header className="flex flex-col items-start gap-2 p-0">
            <Card.Description>Current state</Card.Description>
            <Card.Title className="text-2xl">Quick view</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4 p-0 pt-5">
            {isLoading || !settings ? (
              <div className="flex items-center gap-3 text-muted">
                <Spinner />
                <span>Loading live settings...</span>
              </div>
            ) : (
              <>
                <div className="rounded-[1.25rem] bg-surface p-4">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">Backend</p>
                  <p className="mt-2 text-sm break-all text-foreground">{settings.backend_app_url}</p>
                </div>
                <div className="rounded-[1.25rem] bg-surface p-4">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">Storage path</p>
                  <p className="mt-2 text-sm break-all text-foreground">
                    {settings.storage_location_url || "Not configured"}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-surface p-4">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">Delete access</p>
                  <p className="mt-2 text-sm text-foreground">
                    {settings.product_delete_protection
                      ? "Inventory delete is enabled"
                      : "Inventory delete is locked"}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-surface p-4">
                  <p className="text-xs tracking-[0.18em] text-muted uppercase">Toasts</p>
                  <p className="mt-2 text-sm text-foreground">
                    {settings.toast_enabled ? "Enabled" : "Disabled"} at {settings.toast_placement}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {settings.toast_timeout_ms}ms timeout, {settings.toast_max_visible} visible
                  </p>
                </div>
              </>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

