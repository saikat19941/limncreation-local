"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Form, Input, Label } from "@heroui/react";

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        autoComplete={type === "password" ? "current-password" : "email"}
        fullWidth
        id={id}
        name={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        type={type}
        value={value}
      />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        id="email"
        label="Email address"
        onChange={(value) => setForm((current) => ({ ...current, email: value }))}
        type="email"
        value={form.email}
      />
      <Field
        id="password"
        label="Password"
        onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        type="password"
        value={form.password}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-col gap-3 pt-2">
        <Button fullWidth isPending={isPending} type="submit">
          Sign In
        </Button>
        <div className="flex items-center justify-between text-sm text-muted">
          <Link className="hover:text-foreground" href="/forgot-password">
            Forgot password?
          </Link>
          <Link className="hover:text-foreground" href="/signup">
            Create account
          </Link>
        </div>
      </div>
    </Form>
  );
}

