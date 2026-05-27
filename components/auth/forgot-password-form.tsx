"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Form, Input, Label } from "@heroui/react";

function Field({
  id,
  label,
  onChange,
  type = "text",
  value,
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
        fullWidth
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        type={type}
        value={value}
      />
    </div>
  );
}

export function ForgotPasswordForm() {
  const [form, setForm] = useState({
    confirmPassword: "",
    email: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Password reset failed.");
        return;
      }

      setSuccess(payload.message ?? "Password updated.");
      setForm({ confirmPassword: "", email: "", newPassword: "" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form className="space-y-5" onSubmit={handleSubmit}>
      <Field
        id="email"
        label="Account email"
        onChange={(value) => setForm((current) => ({ ...current, email: value }))}
        type="email"
        value={form.email}
      />
      <Field
        id="newPassword"
        label="New password"
        onChange={(value) => setForm((current) => ({ ...current, newPassword: value }))}
        type="password"
        value={form.newPassword}
      />
      <Field
        id="confirmPassword"
        label="Confirm new password"
        onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
        type="password"
        value={form.confirmPassword}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}
      <div className="flex flex-col gap-3 pt-2">
        <Button fullWidth isPending={isPending} type="submit">
          Reset Password
        </Button>
        <Link className="text-sm text-muted hover:text-foreground" href="/login">
          Back to login
        </Link>
      </div>
    </Form>
  );
}

