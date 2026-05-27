import { queryOne } from "@/lib/db";
import { env } from "@/lib/env";
import type { AppSettings } from "@/lib/types";

const fallbackSettings: AppSettings = {
  app_name: env.appName,
  backend_app_url: env.backendUrl,
  created_at: null,
  id: 1,
  product_delete_protection: false,
  storage_location_url: "",
  updated_at: null,
};

export async function getAppSettings() {
  const settings = await queryOne<AppSettings>(
    `SELECT id, app_name, backend_app_url, storage_location_url, product_delete_protection, created_at, updated_at
     FROM settings
     ORDER BY id ASC
     LIMIT 1`,
  );

  return {
    ...fallbackSettings,
    ...settings,
    backend_app_url: settings?.backend_app_url || env.backendUrl,
    product_delete_protection: Boolean(settings?.product_delete_protection),
  };
}

