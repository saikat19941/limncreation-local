import { NextResponse } from "next/server";

import { createSession, hashPassword } from "@/lib/auth";
import { execute, queryOne, queryRows } from "@/lib/db";
import { signupSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [parsed.data.email],
    );

    if (existing) {
      return NextResponse.json({ message: "Email already registered." }, { status: 409 });
    }

    const users = await queryRows<{ id: number }>("SELECT id FROM users LIMIT 2");
    const role = users.length === 0 ? "admin" : "editor";
    const hashedPassword = await hashPassword(parsed.data.password);

    const result = (await execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [parsed.data.name, parsed.data.email, hashedPassword, role],
    )) as { insertId: number };

    await createSession({
      email: parsed.data.email,
      id: result.insertId,
      name: parsed.data.name,
      role,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Signup failed." }, { status: 500 });
  }
}

