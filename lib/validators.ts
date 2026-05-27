import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => value || null);

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(6, "Password is required."),
});

export const signupSchema = z
  .object({
    email: z.email().trim(),
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    password: z.string().trim().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().trim().min(6, "Please confirm the password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z
  .object({
    confirmPassword: z.string().trim().min(6, "Please confirm the new password."),
    email: z.email().trim(),
    newPassword: z.string().trim().min(6, "Password must be at least 6 characters."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const settingsSchema = z.object({
  app_name: z.string().trim().min(2, "App name is required."),
  backend_app_url: z.url("Please enter a valid backend URL.").trim(),
  product_delete_protection: z.boolean(),
  storage_location_url: z.string().trim().min(1, "Storage location is required."),
});

export const productSchema = z.object({
  asin: optionalTrimmed,
  description: optionalTrimmed,
  sku: optionalTrimmed,
  title: z.string().trim().min(2, "Title is required."),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(5).max(100).default(10),
  query: z.string().trim().default(""),
  sortBy: z.enum(["created_at", "lcsin", "sku", "title"]).default("created_at"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

