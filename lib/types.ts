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
  storage_location_url: string;
  created_at: string | null;
  updated_at: string | null;
}

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

