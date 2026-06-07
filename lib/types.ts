export type UserRole = "admin" | "editor";

export interface AuthUser {
  email: string;
  id: number;
  name: string;
  role: UserRole;
}

export interface SessionPayload extends AuthUser {
  exp?: number;
  iat?: number;
}

export interface AppSettings {
  id: number;
  app_name: string;
  backend_app_url: string;
  product_delete_protection: boolean;
  storage_location_url: string;
  toast_enabled: boolean;
  toast_max_visible: number;
  toast_placement: ToastPlacement;
  toast_timeout_ms: number;
  created_at: string | null;
  updated_at: string | null;
}

export type NotificationType = "info" | "success" | "warning" | "danger";

export type ToastPlacement =
  | "top start"
  | "top"
  | "top end"
  | "bottom start"
  | "bottom"
  | "bottom end";

export interface ProductRow {
  asin: string | null;
  created_at: string;
  description: string | null;
  id: number;
  lcsin: string;
  sku: string | null;
  title: string;
  updated_at?: string;
}

export interface SettingsRow {
  app_name: string;
  backend_app_url: string;
  storage_location_url: string;
  created_at: string;
  updated_at: string;
  product_delete_protection: boolean;
}

export interface NotificationRow {
  id: number;
  action_url: string | null;
  created_at: string;
  created_by: number | null;
  message: string | null;
  read_at: string | null;
  title: string;
  type: NotificationType;
}

