import { getAppSettings } from "@/lib/settings";
import type { AuthUser } from "@/lib/types";
import { createBackendAccessToken } from "@/lib/auth";

type MutationMethod = "DELETE" | "POST" | "PUT";

interface MutateTableArgs {
  body?: Record<string, unknown>;
  id?: number;
  method: MutationMethod;
  tableName: string;
  user: AuthUser;
}

export async function mutateBackendTable<T>({
  body,
  id,
  method,
  tableName,
  user,
}: MutateTableArgs): Promise<T> {
  const settings = await getAppSettings();
  const token = createBackendAccessToken(user);
  const url = new URL(
    `/api/databases/${encodeURIComponent("limncreation_local")}/${encodeURIComponent(tableName)}${id ? `/${id}` : ""}`,
    settings.backend_app_url,
  );

  const response = await fetch(url.toString(), {
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method,
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; success?: boolean }
    | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Backend mutation failed.");
  }

  return payload as T;
}

