import { NextResponse } from "next/server";

import { comparePassword, createSession } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { AuthUser } from "@/lib/types";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

type UserRecord = AuthUser & { password: string };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const user = await queryOne<UserRecord>(
      `SELECT id, name, email, role, password
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [parsed.data.email],
    );

    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    const isMatch = await comparePassword(parsed.data.password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password." }, { status: 401 });
    }

    await createSession({
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}

