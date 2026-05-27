import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import type { AuthUser, SessionPayload } from "@/lib/types";

const sessionCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax" as const,
  secure: false,
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(user: AuthUser) {
  const token = jwt.sign(user, env.appSessionSecret, { expiresIn: "7d" });
  const cookieStore = await cookies();

  cookieStore.set(env.sessionCookieName, token, sessionCookieOptions);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(env.sessionCookieName);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(env.sessionCookieName)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return jwt.verify(sessionCookie, env.appSessionSecret) as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(roles: AuthUser["role"][]) {
  const user = await requireSession();

  if (!roles.includes(user.role)) {
    throw new Error("Permission denied.");
  }

  return user;
}

export function createBackendAccessToken(user: AuthUser) {
  return jwt.sign(
    {
      email: user.email,
      id: user.id,
      role: user.role,
    },
    env.backendJwtSecret,
    { expiresIn: "7d" },
  );
}

