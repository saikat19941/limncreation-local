import { queryOne } from "@/lib/db";
import { env } from "@/lib/env";
import type { AppSettings, ToastPlacement } from "@/lib/types";

const toastPlacements: ToastPlacement[] = [
  "top start",
  "top",
  "top end",
  "bottom start",
  "bottom",
  "bottom end",
];

const fallbackSettings: AppSettings = {
  app_name: env.appName,
  backend_app_url: env.backendUrl,
  created_at: null,
  id: 1,
  product_delete_protection: false,
  storage_location_url: "",
  toast_enabled: true,
  toast_max_visible: 3,
  toast_placement: "bottom end",
  toast_timeout_ms: 5000,
  updated_at: null,
};

function normalizeToastPlacement(value: unknown): ToastPlacement {
  return toastPlacements.includes(value as ToastPlacement) ? (value as ToastPlacement) : "bottom end";
}

export async function getAppSettings() {
  const settings = await queryOne<AppSettings>(
    `SELECT id, app_name, backend_app_url, storage_location_url, product_delete_protection,
            toast_enabled, toast_placement, toast_timeout_ms, toast_max_visible, created_at, updated_at
     FROM settings
     ORDER BY id ASC
     LIMIT 1`,
  );

  return {
    ...fallbackSettings,
    ...settings,
    backend_app_url: settings?.backend_app_url || env.backendUrl,
    product_delete_protection: Boolean(settings?.product_delete_protection),
    toast_enabled: Boolean(settings?.toast_enabled ?? fallbackSettings.toast_enabled),
    toast_max_visible: Number(settings?.toast_max_visible ?? fallbackSettings.toast_max_visible),
    toast_placement: normalizeToastPlacement(settings?.toast_placement),
    toast_timeout_ms: Number(settings?.toast_timeout_ms ?? fallbackSettings.toast_timeout_ms),
  };
}

