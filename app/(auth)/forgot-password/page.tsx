import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getSessionUser } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      description="Reset a local account password directly from this device when email delivery is not needed."
      eyebrow="Password recovery"
      title="Reset access"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

