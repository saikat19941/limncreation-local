import { NextResponse } from "next/server";

import { execute, queryOne } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const user = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [parsed.data.email],
    );

    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    const hashedPassword = await hashPassword(parsed.data.newPassword);

    await execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Password reset failed." }, { status: 500 });
  }
}

