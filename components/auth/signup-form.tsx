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
        autoComplete={id.includes("password") ? "new-password" : id === "email" ? "email" : "name"}
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

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    confirmPassword: "",
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/signup", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Signup failed.");
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
        id="name"
        label="Full name"
        onChange={(value) => setForm((current) => ({ ...current, name: value }))}
        value={form.name}
      />
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
      <Field
        id="confirmPassword"
        label="Confirm password"
        onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
        type="password"
        value={form.confirmPassword}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-col gap-3 pt-2">
        <Button fullWidth isPending={isPending} type="submit">
          Create Account
        </Button>
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link className="text-foreground hover:text-accent" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </Form>
  );
}

